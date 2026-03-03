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
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    Unsubscribe,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Post, PostType } from '../types';
import { sendPushNotification, saveNotificationToFirestore } from './notificationService';

/**
 * Create a post under a course+space, and notify all course members.
 */
export async function createPost(
    spaceId: string,
    courseId: string,
    post: Omit<Post, 'id' | 'createdAt'>
): Promise<string> {
    const postRef = doc(
        collection(db, 'spaces', spaceId, 'courses', courseId, 'posts')
    );

    const postData = {
        ...post,
        spaceId,
        courseId,
        createdAt: serverTimestamp(),
    };

    // Convert Dates to Timestamps for Firestore
    const firestoreData: Record<string, unknown> = { ...postData };
    if (post.lectureDate) firestoreData.lectureDate = Timestamp.fromDate(post.lectureDate);
    if (post.dueDate) firestoreData.dueDate = Timestamp.fromDate(post.dueDate);

    await setDoc(postRef, firestoreData);

    // Notify all course members
    try {
        const membersSnap = await getDocs(
            collection(db, 'spaces', spaceId, 'courses', courseId, 'members')
        );

        const postTitle = post.title;
        const courseName = post.courseCode;
        const emoji = getPostTypeEmoji(post.type);

        for (const memberDoc of membersSnap.docs) {
            if (memberDoc.id === post.authorUid) continue; // Don't notify author
            const memberData = memberDoc.data();

            await saveNotificationToFirestore(memberDoc.id, {
                title: `${courseName} ${emoji} ${postTitle}`,
                body: post.description || postTitle,
                postId: postRef.id,
                spaceId,
                courseId,
                type: post.type,
                isCarryover: Boolean(memberData.isCarryover),
            });
        }
    } catch (error) {
        console.error('Error sending notifications:', error);
    }

    return postRef.id;
}

function getPostTypeEmoji(type: PostType): string {
    const emojiMap: Record<PostType, string> = {
        lecture: '📚',
        assignment: '📝',
        test: '📋',
        note: '📌',
        announcement: '📢',
        cancellation: '❌',
    };
    return emojiMap[type] || '📌';
}

/**
 * Get all posts for a course, ordered by createdAt descending.
 */
export function subscribeToPostsByCourse(
    spaceId: string,
    courseId: string,
    callback: (posts: Post[]) => void
): Unsubscribe {
    const postsRef = collection(
        db,
        'spaces',
        spaceId,
        'courses',
        courseId,
        'posts'
    );
    const q = query(postsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map((d) => docToPost(d));
        callback(posts);
    });
}

/**
 * Get all posts across all courses in a space.
 */
export async function getPostsBySpace(spaceId: string): Promise<Post[]> {
    const coursesSnap = await getDocs(
        collection(db, 'spaces', spaceId, 'courses')
    );
    const allPosts: Post[] = [];

    for (const courseDoc of coursesSnap.docs) {
        const postsSnap = await getDocs(
            query(
                collection(
                    db,
                    'spaces',
                    spaceId,
                    'courses',
                    courseDoc.id,
                    'posts'
                ),
                orderBy('createdAt', 'desc')
            )
        );
        postsSnap.docs.forEach((d) => allPosts.push(docToPost(d)));
    }

    allPosts.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    return allPosts;
}

/**
 * Get the most recent posts across all user's spaces and courses.
 */
export async function getRecentPostsForUser(
    uid: string,
    maxPosts: number = 10
): Promise<Post[]> {
    const spacesSnap = await getDocs(collection(db, 'spaces'));
    const allPosts: Post[] = [];

    for (const spaceDoc of spacesSnap.docs) {
        // Check if user is a member of this space
        const memberSnap = await getDoc(
            doc(db, 'spaces', spaceDoc.id, 'members', uid)
        );

        if (!memberSnap.exists()) continue;

        const coursesSnap = await getDocs(
            collection(db, 'spaces', spaceDoc.id, 'courses')
        );

        for (const courseDoc of coursesSnap.docs) {
            // Check if member of this course
            const courseMemberSnap = await getDoc(
                doc(
                    db,
                    'spaces',
                    spaceDoc.id,
                    'courses',
                    courseDoc.id,
                    'members',
                    uid
                )
            );

            if (!courseMemberSnap.exists()) continue;

            const postsSnap = await getDocs(
                query(
                    collection(
                        db,
                        'spaces',
                        spaceDoc.id,
                        'courses',
                        courseDoc.id,
                        'posts'
                    ),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                )
            );

            const memberData = courseMemberSnap.data();
            postsSnap.docs.forEach((d) => {
                const post = docToPost(d);
                // Tag carryover status from member data
                post.isCarryover = Boolean(memberData.isCarryover);
                allPosts.push(post);
            });
        }
    }

    allPosts.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    return allPosts.slice(0, maxPosts);
}

/**
 * Update a post.
 */
export async function updatePost(
    spaceId: string,
    courseId: string,
    postId: string,
    updates: Partial<Post>
): Promise<void> {
    const updateData: Record<string, unknown> = { ...updates };
    if (updates.lectureDate) updateData.lectureDate = Timestamp.fromDate(updates.lectureDate);
    if (updates.dueDate) updateData.dueDate = Timestamp.fromDate(updates.dueDate);
    delete updateData.id;
    delete updateData.createdAt;

    await updateDoc(
        doc(db, 'spaces', spaceId, 'courses', courseId, 'posts', postId),
        updateData
    );
}

/**
 * Delete a post.
 */
export async function deletePost(
    spaceId: string,
    courseId: string,
    postId: string
): Promise<void> {
    await deleteDoc(
        doc(db, 'spaces', spaceId, 'courses', courseId, 'posts', postId)
    );
}

/**
 * Get a single post.
 */
export async function getPostById(
    spaceId: string,
    courseId: string,
    postId: string
): Promise<Post | null> {
    const snap = await getDoc(
        doc(db, 'spaces', spaceId, 'courses', courseId, 'posts', postId)
    );
    if (!snap.exists()) return null;
    return docToPost(snap);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function docToPost(d: any): Post {
    const data = d.data();
    return {
        id: d.id,
        spaceId: data.spaceId,
        courseId: data.courseId,
        courseCode: data.courseCode,
        type: data.type,
        title: data.title,
        description: data.description,
        authorUid: data.authorUid,
        authorName: data.authorName,
        authorRole: data.authorRole,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        lectureDate: data.lectureDate?.toDate?.(),
        startTime: data.startTime,
        endTime: data.endTime,
        venue: data.venue,
        lectureStatus: data.lectureStatus,
        dueDate: data.dueDate?.toDate?.(),
        marks: data.marks,
        topics: data.topics,
        linkedPostId: data.linkedPostId,
        isCarryover: Boolean(data.isCarryover),
    };
}
