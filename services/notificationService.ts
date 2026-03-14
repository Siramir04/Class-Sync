import {
    collection,
    doc,
    setDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    writeBatch,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AppNotification, PostType } from '../types';

/**
 * Save a notification to Firestore for a specific user.
 */
export async function saveNotificationToFirestore(
    uid: string,
    notification: {
        title: string;
        body: string;
        postId?: string;
        spaceId?: string;
        courseId?: string;
        type: PostType | 'course_added' | 'course_auto_added' | 'lecturer_assigned';
        isCarryover: boolean;
        isImportant?: boolean;
    }
): Promise<void> {
    const notifRef = doc(collection(db, 'notifications', uid, 'items'));
    await setDoc(notifRef, {
        uid,
        ...notification,
        isRead: false,
        createdAt: serverTimestamp(),
    });
}

/**
 * Send a push notification (via Expo push API).
 * For full FCM integration, use Firebase Cloud Functions in production.
 */
export async function sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data?: Record<string, string>
): Promise<void> {
    try {
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: expoPushToken,
                title,
                body,
                data,
                sound: 'default',
            }),
        });
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
}

/**
 * Real-time listener for a user's notifications.
 */
export function subscribeToUserNotifications(
    uid: string,
    callback: (notifications: AppNotification[]) => void
): Unsubscribe {
    const q = query(
        collection(db, 'notifications', uid, 'items'),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map((d) => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                isRead: Boolean(data.isRead),
                isCarryover: Boolean(data.isCarryover),
                createdAt: data.createdAt?.toDate?.() ?? new Date(),
            } as AppNotification;
        });
        callback(notifications);
    });
}

/**
 * Get a user's notifications (one-time fetch).
 */
export async function getUserNotifications(
    uid: string
): Promise<AppNotification[]> {
    const q = query(
        collection(db, 'notifications', uid, 'items'),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            ...data,
            isRead: Boolean(data.isRead),
            isCarryover: Boolean(data.isCarryover),
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
        } as AppNotification;
    });
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(
    uid: string,
    notificationId: string
): Promise<void> {
    await updateDoc(doc(db, 'notifications', uid, 'items', notificationId), {
        isRead: true,
    });
}

/**
 * Mark all notifications as read.
 */
export async function markAllAsRead(uid: string): Promise<void> {
    const q = query(
        collection(db, 'notifications', uid, 'items'),
        where('isRead', '==', false)
    );
    const snap = await getDocs(q);

    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
        batch.update(d.ref, { isRead: true });
    });
    await batch.commit();
}

/**
 * Get the unread notification count.
 */
export async function getUnreadCount(uid: string): Promise<number> {
    const q = query(
        collection(db, 'notifications', uid, 'items'),
        where('isRead', '==', false)
    );
    const snap = await getDocs(q);
    return snap.size;
}
