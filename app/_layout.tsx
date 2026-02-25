import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useCarryoverAutoAccept } from '../hooks/useCarryoverAutoAccept';
import { Colors } from '../constants/colors';
import CourseAcceptSheet from '../components/sheets/CourseAcceptSheet';

export default function RootLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

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
        if (isLoading || !fontsLoaded) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!isAuthenticated && !inAuthGroup) {
            // Not logged in and not in auth screens — splash handles routing
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

    return (
        <>
            <StatusBar style="dark" />
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
        </>
    );
}
