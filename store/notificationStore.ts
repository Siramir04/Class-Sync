import { create } from 'zustand';
import { AppNotification } from '../types';

interface NotificationState {
    notifications: AppNotification[];
    unreadCount: number;
    setNotifications: (notifications: AppNotification[]) => void;
    setUnreadCount: (count: number) => void;
    markRead: (notificationId: string) => void;
    markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    setNotifications: (notifications) =>
        set({
            notifications,
            unreadCount: notifications.filter((n) => !n.isRead).length,
        }),
    setUnreadCount: (unreadCount) => set({ unreadCount }),
    markRead: (notificationId) =>
        set((state) => {
            const updated = state.notifications.map((n) =>
                n.id === notificationId ? { ...n, isRead: true } : n
            );
            return {
                notifications: updated,
                unreadCount: updated.filter((n) => !n.isRead).length,
            };
        }),
    markAllRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
            unreadCount: 0,
        })),
}));
