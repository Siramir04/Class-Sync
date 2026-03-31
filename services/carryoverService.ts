import { 
    updateDoc, 
    doc, 
    getDocs, 
    collection, 
    query, 
    where,
    arrayUnion,
    getDoc,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Course, UserRole } from '../types';

/**
 * Service to handle carryover course joining logic.
 * Optimizes the Spark plan by updating the denormalized User document.
 */
export const carryoverService = {
    /**
     * Join a course from an external space as a carryover student.
     * @param userId Current user UID
     * @param fullCode The full identifier (e.g., "SC-FUTB-CSC301")
     */
    async joinCourseByCode(
        userId: string,
        fullCode: string
    ) {
        // 1. Search across all spaces for a course with matching fullCode
        const spacesSnap = await getDocs(collection(db, 'spaces'));
        let targetSpaceId = '';
        let targetCourse: Course | null = null;
        let targetCourseId = '';

        for (const spaceDoc of spacesSnap.docs) {
            const coursesRef = collection(db, 'spaces', spaceDoc.id, 'courses');
            const q = query(coursesRef, where('fullCode', '==', fullCode.toUpperCase().trim()));
            const coursesSnap = await getDocs(q);

            if (!coursesSnap.empty) {
                const courseDoc = coursesSnap.docs[0];
                targetCourse = { id: courseDoc.id, spaceId: spaceDoc.id, ...courseDoc.data() } as Course;
                targetSpaceId = spaceDoc.id;
                targetCourseId = courseDoc.id;
                break;
            }
        }

        if (!targetCourse || !targetSpaceId) {
            throw new Error('Course not found with the provided code.');
        }

        if (targetCourse.allowCarryover === false) {
            throw new Error('This course does not allow carryover students.');
        }

        // 2. Fetch User to verify constraints
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) throw new Error('User not found.');
        const user = userDoc.data() as User;

        if (user.primarySpaceId === targetSpaceId) {
            throw new Error('You are a primary member of this space. Use standard enrollment.');
        }

        const alreadyEnrolled = user.carryoverEnrollments?.some(e => e.courseId === targetCourseId);
        if (alreadyEnrolled) {
            throw new Error('You are already enrolled in this course.');
        }

        // 3. Update User Document (Denormalized Feed Access)
        await updateDoc(doc(db, 'users', userId), {
            carryoverEnrollments: arrayUnion({
                courseId: targetCourseId,
                spaceId: targetSpaceId,
                enrolledAt: new Date(),
                status: 'active'
            })
        });

        // 4. Add User to Course Members Subcollection (RBAC visibility)
        await setDoc(
            doc(db, 'spaces', targetSpaceId, 'courses', targetCourseId, 'members', userId),
            {
                uid: userId,
                role: 'student' as UserRole,
                joinedAt: serverTimestamp(),
                isCarryover: true,
                accepted: true,
            }
        );

        // 5. Add to Space Members (if not already there) to allow general visibility
        const spaceMemberRef = doc(db, 'spaces', targetSpaceId, 'members', userId);
        const spaceMemberSnap = await getDoc(spaceMemberRef);
        if (!spaceMemberSnap.exists()) {
            await setDoc(spaceMemberRef, {
                uid: userId,
                role: 'student' as UserRole,
                joinedAt: serverTimestamp(),
                isCarryover: true,
                accepted: true,
            });
        }

        return {
            courseId: targetCourseId,
            spaceId: targetSpaceId,
            courseName: targetCourse.courseName,
            courseCode: targetCourse.courseCode
        };
    }
};
