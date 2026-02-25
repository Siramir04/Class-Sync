import { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { subscribeToUserNotifications } from '../services/notificationService';

/**
 * Hook to subscribe to the user's notifications in real-time.
 */
export function useNotifications() {
    const { user } = useAuthStore();
    const { notifications, unreadCount, setNotifications, markRead, markAllRead } =
        useNotificationStore();

    useEffect(() => {
        if (!user?.uid) return;

        const unsubscribe = subscribeToUserNotifications(user.uid, (fetched) => {
            setNotifications(fetched);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    return { notifications, unreadCount, markRead, markAllRead };
}
