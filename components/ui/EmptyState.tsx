import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Spacing } from '../../constants/spacing';

import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
}

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
    const { colors: Colors, typography: Typography } = useTheme();
    return (
        <View style={styles.container}>
            {icon ? (
                <View style={styles.iconBox}>
                    <Ionicons name={icon} size={48} color={Colors.textTertiary} />
                </View>
            ) : null}
            <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Typography.family.bold }]}>
                {title}
            </Text>
            {subtitle ? (
                <Text style={[styles.subtitle, { color: Colors.textSecondary, fontFamily: Typography.family.regular }]}>
                    {subtitle}
                </Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    iconBox: {
        marginBottom: 20,
        opacity: 0.5,
    },
    title: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
});
