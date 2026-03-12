import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { useAuthStore } from '../store/authStore';
import VideoIntro from '../components/intro/VideoIntro';

export default function SplashScreen() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();
    const [showIntro, setShowIntro] = useState<boolean | null>(null);

    useEffect(() => {
        checkIntro();
    }, []);

    const checkIntro = async () => {
        try {
            const hasSeenIntro = await AsyncStorage.getItem('hasSeenIntro');
            if (hasSeenIntro === 'true') {
                setShowIntro(false);
            } else {
                setShowIntro(true);
            }
        } catch (error) {
            setShowIntro(false);
        }
    };

    const handleIntroFinish = async () => {
        try {
            await AsyncStorage.setItem('hasSeenIntro', 'true');
            setShowIntro(false);
        } catch (error) {
            setShowIntro(false);
        }
    };

    useEffect(() => {
        if (isLoading || showIntro === null || showIntro === true) return;

        const timer = setTimeout(async () => {
            try {
                const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

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
        }, 1000);

        return () => clearTimeout(timer);
    }, [isLoading, isAuthenticated, showIntro]);

    if (showIntro === true) {
        return <VideoIntro onFinish={handleIntroFinish} />;
    }

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
