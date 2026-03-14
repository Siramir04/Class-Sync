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
    increment,
    runTransaction,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Post, PostType, ReadReceipt } from '../types';
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

            // 1. In-app notification
            await saveNotificationToFirestore(memberDoc.id, {
                title: `${courseName} ${emoji} ${postTitle}`,
                body: post.description || postTitle,
                postId: postRef.id,
                spaceId,
                courseId,
                type: post.type,
                isCarryover: Boolean(memberData.isCarryover),
                isImportant: Boolean(post.isImportant),
            });

            // 2. Push notification attempt (if token exists)
            // Note: In production, this should ideally be handled by a Cloud Function
            // Fetching user doc to get fcmToken
            const userDoc = await getDoc(doc(db, 'users', memberDoc.id));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.fcmToken) {
                    await sendPushNotification(
                        userData.fcmToken,
                        `${courseName}: ${postTitle}`,
                        post.description || `New ${post.type} posted.`,
                        { spaceId, courseId, postId: postRef.id }
                    );
                }
            }
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
        attendance: '⏱️',
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
 * Real-time listener for the most recent posts across all user's spaces and courses.
 */
export function subscribeToUserRecentPosts(
    uid: string,
    callback: (posts: Post[]) => void,
    maxPosts: number = 10
): Unsubscribe {
    // This is complex for a single listener. We'll listen to the user's spaces and for each, 
    // listen to courses, then for each course listen to posts.
    // For MVP, we'll keep it as a managed set of unsubscribes.
    
    let unsubscribes: Unsubscribe[] = [];
    const postsMap: Record<string, Post[]> = {};

    const updateAggregate = () => {
        const allPosts = Object.values(postsMap).flat();
        allPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        callback(allPosts.slice(0, maxPosts));
    };

    const spacesUnsub = onSnapshot(collection(db, 'spaces'), async (spacesSnap) => {
        // Clear previous sub-unsubscribes if spaces change significantly
        // (Simple version: just manage the growth)
        for (const spaceDoc of spacesSnap.docs) {
            const memberSnap = await getDoc(doc(db, 'spaces', spaceDoc.id, 'members', uid));
            if (memberSnap.exists()) {
                const coursesUnsub = onSnapshot(collection(db, 'spaces', spaceDoc.id, 'courses'), (coursesSnap) => {
                    for (const courseDoc of coursesSnap.docs) {
                        const postsUnsub = subscribeToPostsByCourse(spaceDoc.id, courseDoc.id, (coursePosts) => {
                            postsMap[`${spaceDoc.id}_${courseDoc.id}`] = coursePosts;
                            updateAggregate();
                        });
                        unsubscribes.push(postsUnsub);
                    }
                });
                unsubscribes.push(coursesUnsub);
            }
        }
    });

    unsubscribes.push(spacesUnsub);

    return () => {
        unsubscribes.forEach(unsub => unsub());
    };
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

/**
 * Mark a post as read by a user.
 */
export async function markPostAsRead(
    spaceId: string,
    courseId: string,
    postId: string,
    uid: string,
    fullName: string
): Promise<void> {
    const postRef = doc(db, 'spaces', spaceId, 'courses', courseId, 'posts', postId);
    const receiptRef = doc(db, 'spaces', spaceId, 'courses', courseId, 'posts', postId, 'receipts', uid);

    try {
        await runTransaction(db, async (transaction) => {
            const receiptSnap = await transaction.get(receiptRef);
            if (receiptSnap.exists()) return; // Already read

            transaction.set(receiptRef, {
                uid,
                fullName,
                readAt: serverTimestamp(),
            });

            transaction.update(postRef, {
                readCount: increment(1),
            });
        });
    } catch (error) {
        console.error('Error marking post as read:', error);
    }
}

/**
 * Get all read receipts for a post.
 */
export async function getReadReceipts(
    spaceId: string,
    courseId: string,
    postId: string
): Promise<ReadReceipt[]> {
    const receiptsRef = collection(db, 'spaces', spaceId, 'courses', courseId, 'posts', postId, 'receipts');
    const q = query(receiptsRef, orderBy('readAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
        uid: d.id,
        fullName: d.data().fullName,
        readAt: d.data().readAt?.toDate() ?? new Date(),
    } as ReadReceipt));
}

/**
 * Toggle importance of a post.
 */
export async function updatePostImportantStatus(
    spaceId: string,
    courseId: string,
    postId: string,
    isImportant: boolean
): Promise<void> {
    await updateDoc(doc(db, 'spaces', spaceId, 'courses', courseId, 'posts', postId), {
        isImportant,
    });
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
        isImportant: Boolean(data.isImportant),
        readCount: data.readCount || 0,
    };
}
