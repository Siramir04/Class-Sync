import { useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { useAuthStore } from '../store/authStore';
import { onAuthChanged, getCurrentUser, logoutUser } from '../services/authService';

/**
 * Hook to listen to Firebase auth state and sync with Zustand store.
 */
export function useAuth() {
    const { user, isAuthenticated, isLoading, signOut } = useAuthStore();
    return {
        user,
        isAuthenticated,
        isLoading,
        logout: signOut,
    };
}
