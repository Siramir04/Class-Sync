// components/web/WebFeaturePrompt.tsx
// Fallback UI for native-only features when accessed on web
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';

interface WebFeaturePromptProps {
    feature: string;
    appStoreUrl?: string;
}

/**
 * Centered card shown on web when a user navigates to a native-only feature.
 * Displays an explanation and an optional CTA to download the mobile app.
 */
export default function WebFeaturePrompt({ feature, appStoreUrl }: WebFeaturePromptProps) {
    const { colors } = useTheme();

    const handleDownload = () => {
        if (appStoreUrl) {
            Linking.openURL(appStoreUrl).catch(() => {
                // Silently fail if URL can't be opened
            });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.card, { backgroundColor: colors.surfaceSecondary }]}>
                <View style={[styles.iconCircle, { backgroundColor: colors.accentBlueSoft }]}>
                    <Ionicons name="phone-portrait-outline" size={32} color={colors.accentBlue} />
                </View>

                <Text style={[styles.title, { color: colors.textPrimary }]}>
                    Mobile-Only Feature
                </Text>

                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    {feature} is only available on the ClassSync mobile app.
                    Download the app for the full experience.
                </Text>

                {appStoreUrl && (
                    <TouchableOpacity
                        style={[styles.ctaButton, { backgroundColor: colors.primary }]}
                        onPress={handleDownload}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="download-outline" size={18} color={colors.onPrimary} />
                        <Text style={[styles.ctaText, { color: colors.onPrimary }]}>
                            Get the App
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontFamily: Typography.family.bold,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        fontFamily: Typography.family.regular,
        fontWeight: '400',
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 24,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
        width: '100%',
    },
    ctaText: {
        fontSize: 16,
        fontFamily: Typography.family.semiBold,
        fontWeight: '600',
    },
});
