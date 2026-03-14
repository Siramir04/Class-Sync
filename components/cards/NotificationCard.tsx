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

const typeConfig: Record<string, { color: string; icon: string }> = {
    lecture: { color: Colors.primaryBlue, icon: 'book' },
    assignment: { color: Colors.warning, icon: 'document-text' },
    test: { color: Colors.error, icon: 'clipboard' },
    note: { color: Colors.success, icon: 'bookmark' },
    announcement: { color: Colors.accentBlue, icon: 'megaphone' },
    cancellation: { color: Colors.error, icon: 'close-circle' },
    course_added: { color: Colors.primaryBlue, icon: 'add-circle' },
    course_auto_added: { color: Colors.carryover, icon: 'refresh-circle' },
    lecturer_assigned: { color: Colors.success, icon: 'person-add' },
};

export default function NotificationCard({ notification, onPress }: NotificationCardProps) {
    const config = typeConfig[notification.type] || { color: Colors.primaryBlue, icon: 'notifications' };

    return (
        <TouchableOpacity
            style={[
                styles.card,
                !notification.isRead && styles.unread,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.container}>
                <View style={[styles.iconContainer, { backgroundColor: config.color + '15' }]}>
                    <Ionicons name={config.icon as any} size={20} color={config.color} />
                </View>
                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title} numberOfLines={1}>
                            {notification.title}
                        </Text>
                        {!notification.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.body} numberOfLines={2}>
                        {notification.body}
                    </Text>
                    <View style={styles.footer}>
                        <Text style={styles.time}>
                            {formatRelativeTime(notification.createdAt)}
                        </Text>
                        {notification.isCarryover && (
                            <View style={styles.carryoverBadge}>
                                <Text style={styles.carryoverText}>CARRYOVER</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        paddingHorizontal: Spacing.screenPadding,
        paddingVertical: 14,
        backgroundColor: Colors.background,
    },
    unread: {
        backgroundColor: Colors.primaryBlue + '05',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    title: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primaryBlue,
    },
    body: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textSecondary,
        lineHeight: 18,
        marginBottom: 8,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    time: {
        fontSize: 11,
        fontFamily: 'DMSans_500Medium',
        color: Colors.textTertiary,
    },
    carryoverBadge: {
        backgroundColor: Colors.carryover + '15',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    carryoverText: {
        fontSize: 9,
        fontFamily: 'DMSans_700Bold',
        color: Colors.carryover,
    },
});
