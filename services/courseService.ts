import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    Unsubscribe,
    arrayUnion,
    writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Course, CourseMember, UserRole } from '../types';

/**
 * Add a course to a space. Also adds all existing space members as course members
 * and updates their denormalized User.enrolledCourses array if auto-join is enabled.
 */
export async function addCourseToSpace(
    spaceId: string,
    courseName: string,
    courseCode: string,
    fullCode: string,
    lecturerUid?: string,
    allowCarryover: boolean = true
): Promise<string> {
    const batch = writeBatch(db);
    const courseRef = doc(collection(db, 'spaces', spaceId, 'courses'));

    batch.set(courseRef, {
        id: courseRef.id,
        spaceId,
        courseName,
        courseCode: courseCode.toUpperCase(),
        fullCode: fullCode.toUpperCase(),
        lecturerUid: lecturerUid || null,
        allowCarryover,
        isGeneral: false,
        createdAt: serverTimestamp(),
    });

    // Add all existing space members to this course
    const membersSnap = await getDocs(
        collection(db, 'spaces', spaceId, 'members')
    );
    
    for (const memberDoc of membersSnap.docs) {
        const memberData = memberDoc.data();
        
        // 1. Add to course members subcollection
        batch.set(
            doc(db, 'spaces', spaceId, 'courses', courseRef.id, 'members', memberDoc.id),
            {
                uid: memberDoc.id,
                role: memberData.role,
                joinedAt: serverTimestamp(),
                isCarryover: false,
                accepted: true,
            }
        );

        // 2. Auto-enroll in user document if enabled
        if (memberData.autoJoinEnabled !== false) { // Default to true if not set
            batch.update(doc(db, 'users', memberDoc.id), {
                enrolledCourses: arrayUnion({
                    courseId: courseRef.id,
                    spaceId,
                    enrolledAt: new Date(),
                    autoJoined: true
                })
            });
        }
    }

    await batch.commit();
    return courseRef.id;
}

/**
 * Toggle the auto-join preference for a user in a specific space.
 */
export async function toggleAutoJoinPreference(
    userId: string,
    spaceId: string,
    enabled: boolean
): Promise<void> {
    const batch = writeBatch(db);
    
    // Update user preference (Internal to User doc)
    batch.update(doc(db, 'users', userId), {
        'preferences.autoJoinNewCourses': enabled
    });
    
    // Update space membership record (Used by the creation trigger)
    batch.update(doc(db, 'spaces', spaceId, 'members', userId), {
        autoJoinEnabled: enabled
    });
    
    await batch.commit();
}

/**
 * Join a course by its full code (for carryover students).
 * Finds the course across all spaces by fullCode.
 */
export async function joinCourseByCode(
    fullCode: string,
    uid: string,
    role: UserRole
): Promise<{ course: Course; spaceId: string } | null> {
    // Search across all spaces for a course with matching fullCode
    const spacesSnap = await getDocs(collection(db, 'spaces'));

    for (const spaceDoc of spacesSnap.docs) {
        const coursesRef = collection(db, 'spaces', spaceDoc.id, 'courses');
        const q = query(coursesRef, where('fullCode', '==', fullCode.toUpperCase()));
        const coursesSnap = await getDocs(q);

        if (!coursesSnap.empty) {
            const courseDoc = coursesSnap.docs[0];
            const courseData = courseDoc.data();

            // Add user as carryover member
            await setDoc(
                doc(
                    db,
                    'spaces',
                    spaceDoc.id,
                    'courses',
                    courseDoc.id,
                    'members',
                    uid
                ),
                {
                    uid,
                    role,
                    joinedAt: serverTimestamp(),
                    isCarryover: true,
                    accepted: true,
                }
            );

            return {
                course: {
                    id: courseDoc.id,
                    spaceId: spaceDoc.id,
                    ...courseData,
                    isCarryover: Boolean(courseData.isCarryover),
                    accepted: Boolean(courseData.accepted),
                    createdAt: courseData.createdAt?.toDate?.() ?? new Date(),
                } as Course,
                spaceId: spaceDoc.id,
            };
        }
    }

    return null;
}

/**
 * Get all courses in a space.
 */
export async function getCoursesBySpace(spaceId: string): Promise<Course[]> {
    const snap = await getDocs(collection(db, 'spaces', spaceId, 'courses'));
    return snap.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            spaceId,
            ...data,
            isCarryover: Boolean(data.isCarryover),
            accepted: Boolean(data.accepted),
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
        } as Course;
    });
}

/**
 * Real-time listener for courses in a space.
 */
export function subscribeToCourses(
    spaceId: string,
    callback: (courses: Course[]) => void
): Unsubscribe {
    return onSnapshot(
        collection(db, 'spaces', spaceId, 'courses'),
        (snapshot) => {
            const courses = snapshot.docs.map((d) => {
                const data = d.data();
                return {
                    id: d.id,
                    spaceId,
                    ...data,
                    isCarryover: Boolean(data.isCarryover),
                    accepted: Boolean(data.accepted),
                    createdAt: data.createdAt?.toDate?.() ?? new Date(),
                } as Course;
            });
            callback(courses);
        }
    );
}

/**
 * Assign a lecturer to a course.
 */
export async function assignLecturer(
    spaceId: string,
    courseId: string,
    lecturerUid: string,
    lecturerName: string
): Promise<void> {
    await updateDoc(doc(db, 'spaces', spaceId, 'courses', courseId), {
        lecturerUid,
        lecturerName,
    });

    // Also add lecturer as a course member
    await setDoc(
        doc(db, 'spaces', spaceId, 'courses', courseId, 'members', lecturerUid),
        {
            uid: lecturerUid,
            role: 'lecturer' as UserRole,
            joinedAt: serverTimestamp(),
            isCarryover: false,
            accepted: true,
        }
    );
}

/**
 * Accept a pending course invite (for carryover).
 */
export async function acceptCourseInvite(
    spaceId: string,
    courseId: string,
    uid: string
): Promise<void> {
    await updateDoc(
        doc(db, 'spaces', spaceId, 'courses', courseId, 'members', uid),
        { accepted: true }
    );
}

/**
 * Check and auto-accept courses past their deadline for a user.
 * Called on every app launch.
 */
export async function checkAndAutoAcceptCourses(
    uid: string
): Promise<string[]> {
    const acceptedCodes: string[] = [];
    const spacesSnap = await getDocs(collection(db, 'spaces'));
    const now = new Date();

    for (const spaceDoc of spacesSnap.docs) {
        const coursesSnap = await getDocs(
            collection(db, 'spaces', spaceDoc.id, 'courses')
        );

        for (const courseDoc of coursesSnap.docs) {
            const memberRef = doc(
                db,
                'spaces',
                spaceDoc.id,
                'courses',
                courseDoc.id,
                'members',
                uid
            );
            const memberSnap = await getDoc(memberRef);

            if (memberSnap.exists()) {
                const memberData = memberSnap.data();
                if (
                    memberData.accepted === false &&
                    memberData.acceptDeadline &&
                    memberData.acceptDeadline.toDate() <= now
                ) {
                    await updateDoc(memberRef, { accepted: true });
                    const courseData = courseDoc.data();
                    acceptedCodes.push(courseData.fullCode || courseData.courseCode);
                }
            }
        }
    }

    return acceptedCodes;
}

/**
 * Get course members.
 */
export async function getCourseMembers(
    spaceId: string,
    courseId: string
): Promise<CourseMember[]> {
    const snap = await getDocs(
        collection(db, 'spaces', spaceId, 'courses', courseId, 'members')
    );
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
 * Get a single course by ID.
 */
export async function getCourseById(
    spaceId: string,
    courseId: string
): Promise<Course | null> {
    const snap = await getDoc(doc(db, 'spaces', spaceId, 'courses', courseId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
        id: snap.id,
        spaceId,
        ...data,
        isCarryover: Boolean(data.isCarryover),
        accepted: Boolean(data.accepted),
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
    } as Course;
}

/**
 * Find a course by its full code across all spaces.
 */
export async function findCourseByFullCode(
    fullCode: string
): Promise<{ course: Course; spaceId: string } | null> {
    const spacesSnap = await getDocs(collection(db, 'spaces'));

    for (const spaceDoc of spacesSnap.docs) {
        const q = query(
            collection(db, 'spaces', spaceDoc.id, 'courses'),
            where('fullCode', '==', fullCode.toUpperCase())
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
            const d = snap.docs[0];
            const data = d.data();
            return {
                course: {
                    id: d.id,
                    spaceId: spaceDoc.id,
                    ...data,
                    isCarryover: Boolean(data.isCarryover),
                    accepted: Boolean(data.accepted),
                    createdAt: data.createdAt?.toDate?.() ?? new Date(),
                } as Course,
                spaceId: spaceDoc.id,
            };
        }
    }

    return null;
}
