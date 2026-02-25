import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { AppNotification } from '../../types';
import { formatRelativeTime } from '../../utils/formatDate';

interface NotificationCardProps {
    notification: AppNotification;
    onPress?: () => void;
}

const typeColors: Record<string, string> = {
    lecture: Colors.accentBlue,
    assignment: Colors.warning,
    test: Colors.error,
    note: Colors.success,
    announcement: Colors.primaryBlue,
    cancellation: Colors.error,
    course_added: Colors.accentBlue,
    course_auto_added: Colors.carryover,
    lecturer_assigned: Colors.success,
};

const typeIcons: Record<string, string> = {
    lecture: 'book',
    assignment: 'document-text',
    test: 'clipboard',
    note: 'pushpin',
    announcement: 'megaphone',
    cancellation: 'close-circle',
    course_added: 'add-circle',
    course_auto_added: 'refresh-circle',
    lecturer_assigned: 'person-add',
};

export default function NotificationCard({ notification, onPress }: NotificationCardProps) {
    const color = typeColors[notification.type] || Colors.accentBlue;
    const iconName = typeIcons[notification.type] || 'notifications';

    return (
        <TouchableOpacity
            style={[
                styles.card,
                !notification.isRead && styles.unread,
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.row}>
                {notification.isCarryover && <View style={styles.carryoverDot} />}
                <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
                    <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={20} color={color} />
                </View>
                <View style={styles.content}>
                    <Text style={styles.title} numberOfLines={2}>{notification.title}</Text>
                    <Text style={styles.body} numberOfLines={1}>{notification.body}</Text>
                    <Text style={styles.time}>{formatRelativeTime(notification.createdAt)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        paddingHorizontal: Spacing.screenPadding,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '40',
    },
    unread: {
        backgroundColor: Colors.subtleFill,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    carryoverDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.carryover,
        marginRight: Spacing.xs,
        marginTop: 8,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    content: {
        flex: 1,
    },
    title: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    body: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    time: {
        ...Typography.label,
        color: Colors.textSecondary,
    },
});
