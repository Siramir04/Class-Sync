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
 * Utility to verify if a user has administrative rights in a space.
 */
export async function verifySpaceRole(
    spaceId: string,
    uid: string,
    allowedRoles: UserRole[] = ['monitor', 'assistant_monitor']
): Promise<boolean> {
    const memberSnap = await getDoc(doc(db, 'spaces', spaceId, 'members', uid));
    if (!memberSnap.exists()) return false;
    const role = memberSnap.data().role as UserRole;
    return allowedRoles.includes(role);
}

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
    monitorUid: string,
    initialCourses: { courseCode: string; courseName: string }[] = []
): Promise<string> {
    const spaceRef = doc(collection(db, 'spaces'));
    const spaceData: Omit<Space, 'id'> = {
        name,
        university,
        department,
        programme,
        entryYear,
        spaceCode: spaceCode.toUpperCase().trim(),
        monitorUid,
        memberCount: 1,
        createdAt: new Date(),
    };

    const batch = writeBatch(db);

    // 1. Write space doc
    batch.set(spaceRef, {
        ...spaceData,
        createdAt: serverTimestamp(),
    });

    // 2. Add creator as monitor member to space
    const memberRef = doc(db, 'spaces', spaceRef.id, 'members', monitorUid);
    batch.set(memberRef, {
        uid: monitorUid,
        role: 'monitor' as UserRole,
        joinedAt: serverTimestamp(),
        isCarryover: false,
        accepted: true,
    });

    // 3. Write initial courses and add creator as member to each
    for (const course of initialCourses) {
        const courseRef = doc(collection(db, 'spaces', spaceRef.id, 'courses'));
        batch.set(courseRef, {
            spaceId: spaceRef.id,
            courseName: course.courseName.trim(),
            courseCode: course.courseCode.toUpperCase().trim(),
            fullCode: `${course.courseCode.toUpperCase().trim()}-${spaceCode.toUpperCase().trim()}`,
            createdAt: serverTimestamp(),
        });

        const courseMemberRef = doc(db, 'spaces', spaceRef.id, 'courses', courseRef.id, 'members', monitorUid);
        batch.set(courseMemberRef, {
            uid: monitorUid,
            role: 'monitor' as UserRole,
            joinedAt: serverTimestamp(),
            isCarryover: false,
            accepted: true,
        });
    }

    await batch.commit();
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
    uid: string,
    updates: Partial<Pick<Space, 'name' | 'department' | 'programme'>>
): Promise<void> {
    const hasPermission = await verifySpaceRole(spaceId, uid, ['monitor']);
    if (!hasPermission) throw new Error('Permission denied: Monitor role required');

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
    const hasPermission = await verifySpaceRole(spaceId, oldMonitorUid, ['monitor']);
    if (!hasPermission) throw new Error('Permission denied: Monitor role required');

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
export async function deleteSpace(spaceId: string, uid: string): Promise<void> {
    const hasPermission = await verifySpaceRole(spaceId, uid, ['monitor']);
    if (!hasPermission) throw new Error('Permission denied: Monitor role required');

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
 * Real-time listener for all members of a space.
 */
export function subscribeToSpaceMembers(
    spaceId: string,
    callback: (members: CourseMember[]) => void
): Unsubscribe {
    const membersRef = collection(db, 'spaces', spaceId, 'members');
    return onSnapshot(membersRef, (snapshot) => {
        const members = snapshot.docs.map((d) => {
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
        callback(members);
    });
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
    uidToRemove: string,
    adminUid: string
): Promise<void> {
    const hasPermission = await verifySpaceRole(spaceId, adminUid, ['monitor', 'assistant_monitor']);
    if (!hasPermission) throw new Error('Permission denied');

    const batch = writeBatch(db);
    batch.delete(doc(db, 'spaces', spaceId, 'members', uidToRemove));
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
            uidToRemove
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
    uidToPromote: string,
    adminUid: string
): Promise<void> {
    const hasPermission = await verifySpaceRole(spaceId, adminUid, ['monitor']);
    if (!hasPermission) throw new Error('Permission denied: Monitor role required');

    const batch = writeBatch(db);
    batch.update(doc(db, 'spaces', spaceId), { assistantMonitorUid: uidToPromote });
    batch.update(doc(db, 'spaces', spaceId, 'members', uidToPromote), {
        role: 'assistant_monitor',
    });
    await batch.commit();
}
