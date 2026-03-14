import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import Tag from '../ui/Tag';

interface ClassCardProps {
    spaceName: string;
    courseCode: string;
    startTime: string;
    endTime: string;
    venue: string;
    status: 'upcoming' | 'live' | 'cancelled';
    isCarryover?: boolean;
    onPress?: () => void;
    style?: any;
}

export default function ClassCard({
    spaceName,
    courseCode,
    startTime,
    endTime,
    venue,
    status,
    isCarryover = false,
    onPress,
    style,
}: ClassCardProps) {
    const statusConfig = {
        upcoming: { label: 'Upcoming', color: Colors.warning, bg: '#FEF3C7' },
        live: { label: 'Live', color: Colors.success, bg: '#DCFCE7' },
        cancelled: { label: 'Cancelled', color: Colors.error, bg: '#FEE2E2' },
    };

    const config = statusConfig[status];
    const borderColor = isCarryover ? Colors.carryover : Colors.accentBlue;

    return (
        <TouchableOpacity
            style={[styles.card, { borderLeftColor: borderColor }, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.header}>
                <Text style={styles.courseCode} numberOfLines={1}>{courseCode}</Text>
                <View style={[styles.statusChip, { backgroundColor: config.bg }]}>
                    <Text style={[styles.statusText, { color: config.color }]}>
                        {config.label}
                    </Text>
                </View>
            </View>
            <Text style={styles.spaceName} numberOfLines={1}>{spaceName}</Text>
            <View style={styles.detailRow}>
                <Text style={styles.time}>{startTime} – {endTime}</Text>
            </View>
            <Text style={styles.venue} numberOfLines={1}>📍 {venue}</Text>
            {isCarryover && (
                <Tag label="Carryover" variant="carryover" style={styles.carryoverTag} />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 200,
        backgroundColor: Colors.surface,
        borderRadius: Spacing.cardRadius,
        padding: Spacing.md,
        marginRight: Spacing.md,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    courseCode: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
        flex: 1,
    },
    statusChip: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: Spacing.pillRadius,
        marginLeft: Spacing.xs,
    },
    statusText: {
        ...Typography.label,
        fontWeight: '600',
    },
    spaceName: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    detailRow: {
        marginBottom: Spacing.xs,
    },
    time: {
        ...Typography.body,
        color: Colors.textPrimary,
    },
    venue: {
        ...Typography.label,
        color: Colors.textSecondary,
    },
    carryoverTag: {
        marginTop: Spacing.sm,
    },
});
