import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    increment,
    writeBatch,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Space, CourseMember, UserRole } from '../types';

/**
 * Create a new space and add the creator as the monitor member.
 */
export async function createSpace(
    name: string,
    university: string,
    department: string,
    programme: string,
    entryYear: string,
    spaceCode: string,
    monitorUid: string
): Promise<string> {
    const spaceRef = doc(collection(db, 'spaces'));
    const spaceData: Omit<Space, 'id'> = {
        name,
        university,
        department,
        programme,
        entryYear,
        spaceCode: spaceCode.toUpperCase(),
        monitorUid,
        memberCount: 1,
        createdAt: new Date(),
    };

    await setDoc(spaceRef, {
        ...spaceData,
        createdAt: serverTimestamp(),
    });

    // Add creator as monitor member
    const memberRef = doc(db, 'spaces', spaceRef.id, 'members', monitorUid);
    await setDoc(memberRef, {
        uid: monitorUid,
        role: 'monitor' as UserRole,
        joinedAt: serverTimestamp(),
        isCarryover: false,
        accepted: true,
    });

    return spaceRef.id;
}

/**
 * Join a space by its space code. Also adds the user to all course member subcollections.
 */
export async function joinSpaceByCode(
    spaceCode: string,
    uid: string,
    role: UserRole
): Promise<Space | null> {
    const spacesRef = collection(db, 'spaces');
    const q = query(spacesRef, where('spaceCode', '==', spaceCode.toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const spaceDoc = snapshot.docs[0];
    const spaceId = spaceDoc.id;
    const spaceData = spaceDoc.data();

    const batch = writeBatch(db);

    // Add user to space members
    const memberRef = doc(db, 'spaces', spaceId, 'members', uid);
    batch.set(memberRef, {
        uid,
        role,
        joinedAt: serverTimestamp(),
        isCarryover: false,
        accepted: true,
    });

    // Increment member count
    const spaceRef = doc(db, 'spaces', spaceId);
    batch.update(spaceRef, { memberCount: increment(1) });

    // Add user to all course member subcollections
    const coursesSnap = await getDocs(collection(db, 'spaces', spaceId, 'courses'));
    for (const courseDoc of coursesSnap.docs) {
        const courseMemberRef = doc(
            db,
            'spaces',
            spaceId,
            'courses',
            courseDoc.id,
            'members',
            uid
        );
        batch.set(courseMemberRef, {
            uid,
            role,
            joinedAt: serverTimestamp(),
            isCarryover: false,
            accepted: true,
        });
    }

    await batch.commit();

    return {
        id: spaceId,
        ...spaceData,
        createdAt: spaceData.createdAt?.toDate?.() ?? new Date(),
    } as Space;
}

/**
 * Get a space by its ID.
 */
export async function getSpaceById(spaceId: string): Promise<Space | null> {
    const snap = await getDoc(doc(db, 'spaces', spaceId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
        id: snap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
    } as Space;
}

/**
 * Real-time listener for all spaces a user is a member of.
 */
export function subscribeToUserSpaces(
    uid: string,
    callback: (spaces: Space[]) => void
): Unsubscribe {
    // We query spaces where the user is monitor or has a member doc
    // For simplicity, we query all spaces and filter client-side with member sub-check
    const spacesRef = collection(db, 'spaces');
    return onSnapshot(spacesRef, async (snapshot) => {
        const spaces: Space[] = [];
        for (const docSnap of snapshot.docs) {
            const memberSnap = await getDoc(
                doc(db, 'spaces', docSnap.id, 'members', uid)
            );
            if (memberSnap.exists()) {
                const data = docSnap.data();
                spaces.push({
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() ?? new Date(),
                } as Space);
            }
        }
        callback(spaces);
    });
}

/**
 * Get all spaces a user has joined (one-time fetch).
 */
export async function getUserSpaces(uid: string): Promise<Space[]> {
    const spacesRef = collection(db, 'spaces');
    const snapshot = await getDocs(spacesRef);
    const spaces: Space[] = [];

    for (const docSnap of snapshot.docs) {
        const memberSnap = await getDoc(
            doc(db, 'spaces', docSnap.id, 'members', uid)
        );
        if (memberSnap.exists()) {
            const data = docSnap.data();
            spaces.push({
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() ?? new Date(),
            } as Space);
        }
    }

    return spaces;
}

/**
 * Update space details.
 */
export async function updateSpace(
    spaceId: string,
    updates: Partial<Pick<Space, 'name' | 'department' | 'programme'>>
): Promise<void> {
    await updateDoc(doc(db, 'spaces', spaceId), updates);
}

/**
 * Transfer space ownership to another member.
 */
export async function transferOwnership(
    spaceId: string,
    newMonitorUid: string,
    oldMonitorUid: string
): Promise<void> {
    const batch = writeBatch(db);

    // Update space document
    batch.update(doc(db, 'spaces', spaceId), { monitorUid: newMonitorUid });

    // Update old monitor's role to student
    batch.update(doc(db, 'spaces', spaceId, 'members', oldMonitorUid), {
        role: 'student',
    });

    // Update new monitor's role
    batch.update(doc(db, 'spaces', spaceId, 'members', newMonitorUid), {
        role: 'monitor',
    });

    await batch.commit();
}

/**
 * Delete a space and all its subcollections.
 */
export async function deleteSpace(spaceId: string): Promise<void> {
    // Delete all member docs
    const membersSnap = await getDocs(collection(db, 'spaces', spaceId, 'members'));
    const batch = writeBatch(db);
    membersSnap.docs.forEach((d) => batch.delete(d.ref));

    // Delete all courses and their subcollections
    const coursesSnap = await getDocs(collection(db, 'spaces', spaceId, 'courses'));
    for (const courseDoc of coursesSnap.docs) {
        const courseMembers = await getDocs(
            collection(db, 'spaces', spaceId, 'courses', courseDoc.id, 'members')
        );
        courseMembers.docs.forEach((d) => batch.delete(d.ref));
        const coursePosts = await getDocs(
            collection(db, 'spaces', spaceId, 'courses', courseDoc.id, 'posts')
        );
        coursePosts.docs.forEach((d) => batch.delete(d.ref));
        batch.delete(courseDoc.ref);
    }

    // Delete the space doc
    batch.delete(doc(db, 'spaces', spaceId));
    await batch.commit();
}

/**
 * Get all members of a space.
 */
export async function getSpaceMembers(spaceId: string): Promise<CourseMember[]> {
    const snap = await getDocs(collection(db, 'spaces', spaceId, 'members'));
    return snap.docs.map((d) => {
        const data = d.data();
        return {
            ...data,
            uid: d.id,
            isCarryover: Boolean(data.isCarryover),
            accepted: Boolean(data.accepted),
            joinedAt: data.joinedAt?.toDate?.() ?? new Date(),
            acceptDeadline: data.acceptDeadline?.toDate?.(),
        } as CourseMember;
    });
}

/**
 * Remove a member from a space.
 */
export async function removeSpaceMember(
    spaceId: string,
    uid: string
): Promise<void> {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'spaces', spaceId, 'members', uid));
    batch.update(doc(db, 'spaces', spaceId), { memberCount: increment(-1) });

    // Also remove from all courses
    const coursesSnap = await getDocs(collection(db, 'spaces', spaceId, 'courses'));
    for (const courseDoc of coursesSnap.docs) {
        const memberRef = doc(
            db,
            'spaces',
            spaceId,
            'courses',
            courseDoc.id,
            'members',
            uid
        );
        const memberSnap = await getDoc(memberRef);
        if (memberSnap.exists()) {
            batch.delete(memberRef);
        }
    }

    await batch.commit();
}

/**
 * Promote a member to assistant monitor.
 */
export async function promoteToAssistantMonitor(
    spaceId: string,
    uid: string
): Promise<void> {
    const batch = writeBatch(db);
    batch.update(doc(db, 'spaces', spaceId), { assistantMonitorUid: uid });
    batch.update(doc(db, 'spaces', spaceId, 'members', uid), {
        role: 'assistant_monitor',
    });
    await batch.commit();
}
