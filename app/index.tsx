import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { useAuthStore } from '../store/authStore';

export default function SplashScreen() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

                if (isLoading) return;

                if (!hasSeenOnboarding) {
                    router.replace('/onboarding');
                } else if (!isAuthenticated) {
                    router.replace('/(auth)/login');
                } else {
                    router.replace('/(tabs)');
                }
            } catch {
                router.replace('/(auth)/login');
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [isLoading, isAuthenticated]);

    return (
        <View style={styles.container}>
            <Text style={styles.appName}>ClassSync</Text>
            <Text style={styles.tagline}>Your class, always in sync</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primaryBlue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appName: {
        ...Typography.display,
        color: Colors.white,
    },
    tagline: {
        ...Typography.body,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 8,
    },
});
