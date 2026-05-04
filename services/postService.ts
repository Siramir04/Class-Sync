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
import { verifySpaceRole } from './spaceService';

/**
 * Create a post under a course+space, and notify all course members.
 */
export async function createPost(
    spaceId: string,
    courseId: string,
    post: Omit<Post, 'id' | 'createdAt'>
): Promise<string> {
    // Phase 1: Verify Role before write
    const hasPermission = await verifySpaceRole(spaceId, post.authorUid, ['monitor', 'assistant_monitor', 'lecturer']);
    if (!hasPermission) throw new Error('Permission denied: You cannot post in this space.');

    const postRef = doc(
        collection(db, 'spaces', spaceId, 'courses', courseId, 'posts')
    );

    const postData = {
        ...post,
        spaceId,
        courseId,
        createdAt: serverTimestamp(),
    };

    const firestoreData: Record<string, unknown> = { ...postData };
    if (post.lectureDate) firestoreData.lectureDate = Timestamp.fromDate(post.lectureDate);
    if (post.dueDate) firestoreData.dueDate = Timestamp.fromDate(post.dueDate);

    await setDoc(postRef, firestoreData);

    try {
        const membersSnap = await getDocs(
            collection(db, 'spaces', spaceId, 'courses', courseId, 'members')
        );

        const postTitle = post.title;
        const courseName = post.courseCode;
        const emoji = getPostTypeEmoji(post.type);

        for (const memberDoc of membersSnap.docs) {
            if (memberDoc.id === post.authorUid) continue;
            const memberData = memberDoc.data();

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
 * Get all posts for a course.
 */
export function subscribeToPostsByCourse(
    spaceId: string,
    courseId: string,
    callback: (posts: Post[]) => void
): Unsubscribe {
    const postsRef = collection(db, 'spaces', spaceId, 'courses', courseId, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map((d) => docToPost(d));
        callback(posts);
    });
}

/**
 * Update a post.
 */
export async function updatePost(
    spaceId: string,
    courseId: string,
    postId: string,
    uid: string,
    updates: Partial<Post>
): Promise<void> {
    const hasPermission = await verifySpaceRole(spaceId, uid, ['monitor', 'assistant_monitor', 'lecturer']);
    if (!hasPermission) throw new Error('Permission denied');

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
    postId: string,
    uid: string
): Promise<void> {
    const hasPermission = await verifySpaceRole(spaceId, uid, ['monitor', 'assistant_monitor', 'lecturer']);
    if (!hasPermission) throw new Error('Permission denied');

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
            if (receiptSnap.exists()) return;

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
 * Toggle pinning of a post.
 */
export async function updatePostPinStatus(
    spaceId: string,
    courseId: string,
    postId: string,
    uid: string,
    isPinned: boolean
): Promise<void> {
    const hasPermission = await verifySpaceRole(spaceId, uid, ['monitor', 'assistant_monitor']);
    if (!hasPermission) throw new Error('Permission denied');

    await updateDoc(doc(db, 'spaces', spaceId, 'courses', courseId, 'posts', postId), {
        isPinned,
    });
}

/**
 * Toggle importance of a post.
 */
export async function updatePostImportantStatus(
    spaceId: string,
    courseId: string,
    postId: string,
    uid: string,
    isImportant: boolean
): Promise<void> {
    const hasPermission = await verifySpaceRole(spaceId, uid, ['monitor', 'assistant_monitor', 'lecturer']);
    if (!hasPermission) throw new Error('Permission denied');

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
        isPinned: Boolean(data.isPinned),
        readCount: data.readCount || 0,
    };
}
