import { useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { useAuthStore } from '../store/authStore';
import { onAuthChanged, getCurrentUser, logoutUser } from '../services/authService';

/**
 * Hook to listen to Firebase auth state and sync with Zustand store.
 */
export function useAuth() {
    const { user, isAuthenticated, isLoading, setUser, setLoading, logout } =
        useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthChanged(async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                try {
                    const userData = await getCurrentUser(firebaseUser.uid);
                    setUser(userData);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await logoutUser();
            logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return {
        user,
        isAuthenticated,
        isLoading,
        logout: handleLogout,
    };
}
