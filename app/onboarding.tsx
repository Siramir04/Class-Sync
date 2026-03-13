import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import Button from '../components/ui/Button';

const { width, height } = Dimensions.get('window');

interface Slide {
    icon: string;
    headline: string;
    body: string;
}

const slides: Slide[] = [
    {
        icon: '📅',
        headline: 'Never miss a class again',
        body: 'Get instant alerts for lectures, cancellations, and assignments',
    },
    {
        icon: '🏫',
        headline: 'One Space for your whole class',
        body: 'Courses, lecturers, and classmates — all connected in one place',
    },
    {
        icon: '🔄',
        headline: 'Carryover? No problem',
        body: 'Join just the course you need across any class or year',
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleComplete = async () => {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        router.replace('/(auth)/register');
    };

    const handleLogin = async () => {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        router.replace('/(auth)/login');
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        router.replace('/(auth)/login');
    };

    const renderSlide = ({ item, index }: { item: Slide; index: number }) => (
        <View style={styles.slide}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.headline}>{item.headline}</Text>
            <Text style={styles.body}>{item.body}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {activeIndex < 2 && (
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            )}

            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => i.toString()}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setActiveIndex(index);
                }}
            />

            {/* Dot Indicators */}
            <View style={styles.pagination}>
                {slides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index === activeIndex ? styles.activeDot : styles.inactiveDot,
                        ]}
                    />
                ))}
            </View>

            {/* Bottom buttons — only on last slide */}
            {activeIndex === 2 && (
                <View style={styles.bottomButtons}>
                    <Button title="Create Account" onPress={handleComplete} />
                    <TouchableOpacity onPress={handleLogin} style={styles.loginLink}>
                        <Text style={styles.loginText}>I already have an account</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    skipButton: {
        position: 'absolute',
        top: 60,
        right: Spacing.screenPadding,
        zIndex: 10,
        padding: Spacing.sm,
    },
    skipText: {
        ...Typography.buttonText,
        color: Colors.textSecondary,
    },
    slide: {
        width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    icon: {
        fontSize: 80,
        marginBottom: Spacing.xl,
    },
    headline: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    body: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: Colors.accentBlue,
        width: 24,
    },
    inactiveDot: {
        backgroundColor: Colors.border,
    },
    bottomButtons: {
        paddingHorizontal: Spacing.screenPadding,
        paddingBottom: Spacing.xxl,
    },
    loginLink: {
        marginTop: Spacing.md,
        alignItems: 'center',
    },
    loginText: {
        ...Typography.buttonText,
        color: Colors.textSecondary,
    },
});
