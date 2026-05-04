import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useCarryoverAutoAccept } from '../hooks/useCarryoverAutoAccept';
import { useTheme } from '../hooks/useTheme';
import { logger } from '../utils/logger';
import CourseAcceptSheet from '../components/sheets/CourseAcceptSheet';
import { registerBackgroundTasks } from '../services/backgroundTask';

export default function RootLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const { colors: Colors, isDark } = useTheme();

    // Phase 7 — Push Notifications
    const { expoPushToken } = usePushNotifications();

    // Phase 8 — Carryover Auto-Accept
    const {
        pendingCourses,
        showSheet,
        currentCourse,
        dismissSheet,
        acceptCourse,
    } = useCarryoverAutoAccept();

    const [fontsLoaded] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_600SemiBold,
        DMSans_700Bold,
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        useAuthStore.getState().setUser({ 
                            uid: firebaseUser.uid, 
                            ...userDoc.data(),
                            createdAt: userDoc.data().createdAt?.toDate?.() || new Date()
                        } as User);
                    } else {
                        // User exists in Auth but not in Firestore - handle or clear
                        useAuthStore.getState().setUser(null);
                    }
                } catch (err) {
                    logger.error('Error fetching user data:', err);
                    useAuthStore.getState().setUser(null);
                }
            } else {
                useAuthStore.getState().clearUser();
            }
        });

        return () => unsubscribe();
    }, []);

    // Phase 3 — Background Proximity Scanning
    useEffect(() => {
        registerBackgroundTasks();
    }, []);

    useEffect(() => {
        if (isLoading || !fontsLoaded) return;

        const inAuthGroup = segments[0] === '(auth)';
        const isIndex = !segments[0];
        const isOnboarding = segments[0] === 'onboarding';

        if (!isAuthenticated) {
            // Redirect to login if trying to access protected routes
            if (!inAuthGroup && !isIndex && !isOnboarding) {
                router.replace('/(auth)/login');
            }
        } else if (isAuthenticated && inAuthGroup) {
            // Redirect to main app if already logged in and in auth group
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, segments, isLoading, fontsLoaded]);

    if (!fontsLoaded || isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <ActivityIndicator size="large" color={Colors.accentBlue} />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <StatusBar style={isDark ? "light" : "dark"} />
            <Slot />

            {/* Phase 8 — Carryover auto-accept notification sheet */}
            {currentCourse && (
                <CourseAcceptSheet
                    visible={showSheet}
                    courseName={currentCourse.courseName}
                    courseCode={currentCourse.fullCode}
                    daysRemaining={
                        currentCourse.deadline
                            ? Math.max(0, Math.ceil((currentCourse.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                            : 0
                    }
                    onAccept={acceptCourse}
                    onDismiss={dismissSheet}
                />
            )}
        </SafeAreaProvider>
    );
}
