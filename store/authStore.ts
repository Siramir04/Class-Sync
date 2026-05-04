import { create } from 'zustand';
import { User, UserRole } from '../types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    clearUser: () => void;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        setUser: (user) =>
            set({ user, isAuthenticated: !!user, isLoading: false }),
        setLoading: (loading) => set({ isLoading: loading }),
        clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false }),
        signOut: async () => {
            // 1. Unsubscribe/Clear all other stores
            const { useNotificationStore } = await import('./notificationStore');
            const { useSpaceStore } = await import('./spaceStore');
            const { useFeedStore } = await import('./feedStore');
            
            useNotificationStore.getState().cleanup();
            useSpaceStore.getState().cleanup();
            useFeedStore.getState().cleanup();

            // 2. Clear this store
            set({ user: null, isAuthenticated: false, isLoading: false });

            // 3. Firebase Sign Out
            const { logoutUser } = await import('../services/authService');
            await logoutUser();
        },
    })
);
