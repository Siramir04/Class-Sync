import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
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
        logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
    })
);
