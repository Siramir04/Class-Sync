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
    default: { bg: '#E5E5EA', text: '#3A3A3C' },
    carryover: { bg: '#EBEBF5', text: Colors.carryover },
    success: { bg: '#E8F5E9', text: Colors.success },
    warning: { bg: '#FFF3E0', text: Colors.warning },
    error: { bg: '#FFEBEE', text: Colors.error },
    lecture: { bg: '#E3F2FD', text: Colors.primaryBlue },
    assignment: { bg: '#FFF3E0', text: Colors.warning },
    test: { bg: '#FFEBEE', text: Colors.error },
    note: { bg: '#E8F5E9', text: Colors.success },
    announcement: { bg: '#F3E5F5', text: '#9C27B0' },
    cancellation: { bg: '#FFE0E0', text: Colors.error },
    role: { bg: '#E1F5FE', text: Colors.primaryBlue },
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
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: Spacing.pillRadius,
        alignSelf: 'flex-start',
    },
    text: {
        ...Typography.label,
        fontWeight: '700',
        fontSize: 11,
    },
});
