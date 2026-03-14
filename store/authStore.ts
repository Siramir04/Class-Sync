import { create } from 'zustand';
import { User, UserRole } from '../types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    clearUser: () => void;
    logout: () => void;
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
        logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
    })
);
