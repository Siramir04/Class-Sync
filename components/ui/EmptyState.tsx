import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

interface EmptyStateProps {
    icon?: string;
    title: string;
    subtitle?: string;
}

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
    return (
        <View style={styles.container}>
            {icon ? <Text style={styles.icon}>{icon}</Text> : null}
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxl,
        paddingHorizontal: Spacing.lg,
    },
    icon: {
        fontSize: 48,
        marginBottom: Spacing.md,
    },
    title: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});
