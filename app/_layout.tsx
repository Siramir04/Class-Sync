import React, { useEffect, useState } from 'react';
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
import { useTheme } from '../hooks/useTheme';
import { useResponsive } from '../hooks/useResponsive';
import { logger } from '../utils/logger';
import { isWeb, isNative } from '../utils/platform';

// Web-safe wrappers — prevent native module crashes on web
import { usePushNotificationsSafe } from '../hooks/usePushNotificationsSafe';
import { useCarryoverAutoAcceptSafe } from '../hooks/useCarryoverAutoAcceptSafe';
import { registerBackgroundTasksSafe } from '../utils/registerBackgroundTasksSafe';

export default function RootLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const { colors: Colors, isDark } = useTheme();
    const { isDesktop } = useResponsive();

    // Phase 7 — Push Notifications (no-op on web)
    const { expoPushToken } = usePushNotificationsSafe();

    // Phase 8 — Carryover Auto-Accept (no-op on web)
    const {
        pendingCourses,
        showSheet,
        currentCourse,
        dismissSheet,
        acceptCourse,
    } = useCarryoverAutoAcceptSafe();

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

    // Phase 3 — Background Proximity Scanning (native only)
    useEffect(() => {
        registerBackgroundTasksSafe();
    }, []);

    useEffect(() => {
        if (isLoading || !fontsLoaded) return;

        const inAuthGroup = segments[0] === '(auth)';
        const isIndex = !segments[0];
        const isOnboarding = segments[0] === 'onboarding';

        if (!isAuthenticated) {
            if (!inAuthGroup && !isIndex && !isOnboarding) {
                router.replace('/(auth)/login');
            }
        } else if (isAuthenticated && inAuthGroup) {
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

    const content = <Slot />;

    const wrappedContent = isWeb && isDesktop ? (
        <View style={{ flex: 1, maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
            {content}
        </View>
    ) : content;

    // Dynamically render native components
    let NativeComponents = null;
    if (isNative && currentCourse) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const CourseAcceptSheet = require('../components/sheets/CourseAcceptSheet').default;
        NativeComponents = (
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
        );
    }

    return (
        <SafeAreaProvider>
            <StatusBar style={isDark ? "light" : "dark"} />
            {wrappedContent}
            {NativeComponents}
        </SafeAreaProvider>
    );
}
