import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { PostType } from '../../types';

interface TagProps {
    label: string;
    variant?: 'default' | 'carryover' | 'success' | 'warning' | 'error' | 'lecture' | 'assignment' | 'test' | 'note' | 'announcement' | 'cancellation' | 'role';
    style?: ViewStyle;
}

const variantColors: Record<string, { bg: string; text: string }> = {
    default: { bg: Colors.subtleFill, text: Colors.accentBlue },
    carryover: { bg: '#F3E8FF', text: Colors.carryover },
    success: { bg: '#DCFCE7', text: Colors.success },
    warning: { bg: '#FEF3C7', text: Colors.warning },
    error: { bg: '#FEE2E2', text: Colors.error },
    lecture: { bg: Colors.subtleFill, text: Colors.accentBlue },
    assignment: { bg: '#FEF3C7', text: Colors.warning },
    test: { bg: '#FEE2E2', text: Colors.error },
    note: { bg: '#DCFCE7', text: Colors.success },
    announcement: { bg: Colors.subtleFill, text: Colors.primaryBlue },
    cancellation: { bg: '#FEE2E2', text: Colors.error },
    role: { bg: Colors.subtleFill, text: Colors.primaryBlue },
};

export default function Tag({ label, variant = 'default', style }: TagProps) {
    const colors = variantColors[variant] || variantColors.default;

    return (
        <View style={[styles.tag, { backgroundColor: colors.bg }, style]}>
            <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
        </View>
    );
}

/**
 * Returns the appropriate tag variant for a PostType.
 */
export function getPostTypeVariant(type: PostType): TagProps['variant'] {
    return type as TagProps['variant'];
}

const styles = StyleSheet.create({
    tag: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: Spacing.pillRadius,
        alignSelf: 'flex-start',
    },
    text: {
        ...Typography.label,
        fontWeight: '600',
    },
});
