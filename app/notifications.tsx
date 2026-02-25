import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SectionList,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { isToday, isYesterday } from 'date-fns';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { useNotifications } from '../hooks/useNotifications';
import { markAsRead, markAllAsRead } from '../services/notificationService';
import { useAuthStore } from '../store/authStore';
import NotificationCard from '../components/cards/NotificationCard';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ScreenHeader from '../components/layout/ScreenHeader';
import { AppNotification } from '../types';

export default function NotificationsScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { notifications, markRead, markAllRead: markAllReadLocal } = useNotifications();

    // Group by Today / Yesterday / Earlier
    const grouped: { title: string; data: AppNotification[] }[] = [];
    const today: AppNotification[] = [];
    const yesterday: AppNotification[] = [];
    const earlier: AppNotification[] = [];

    notifications.forEach((n) => {
        if (isToday(n.createdAt)) today.push(n);
        else if (isYesterday(n.createdAt)) yesterday.push(n);
        else earlier.push(n);
    });

    if (today.length > 0) grouped.push({ title: 'Today', data: today });
    if (yesterday.length > 0) grouped.push({ title: 'Yesterday', data: yesterday });
    if (earlier.length > 0) grouped.push({ title: 'Earlier', data: earlier });

    const handleMarkAllRead = async () => {
        if (!user?.uid) return;
        await markAllAsRead(user.uid);
        markAllReadLocal();
    };

    const handleNotificationPress = async (notification: AppNotification) => {
        if (!user?.uid) return;
        if (!notification.isRead) {
            await markAsRead(user.uid, notification.id);
            markRead(notification.id);
        }
        if (notification.postId && notification.spaceId && notification.courseId) {
            router.push(
                `/post/${notification.postId}?spaceId=${notification.spaceId}&courseId=${notification.courseId}`
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={handleMarkAllRead}>
                    <Text style={styles.markAllRead}>Mark all as read</Text>
                </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
                <EmptyState
                    icon="🔔"
                    title="No notifications"
                    subtitle="You're all caught up!"
                />
            ) : (
                <SectionList
                    sections={grouped}
                    renderItem={({ item }) => (
                        <NotificationCard
                            notification={item}
                            onPress={() => handleNotificationPress(item)}
                        />
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{title}</Text>
                        </View>
                    )}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.md,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: {
        fontSize: 24,
        color: Colors.textPrimary,
    },
    headerTitle: {
        ...Typography.pageTitle,
        color: Colors.textPrimary,
    },
    markAllRead: {
        ...Typography.label,
        color: Colors.accentBlue,
    },
    sectionHeader: {
        paddingHorizontal: Spacing.screenPadding,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.background,
    },
    sectionTitle: {
        ...Typography.label,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
