import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SectionList,
    TouchableOpacity,
    SafeAreaView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { isToday, isYesterday } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { useNotifications } from '../hooks/useNotifications';
import { markAsRead, markAllAsRead } from '../services/notificationService';
import { useAuthStore } from '../store/authStore';
import NotificationCard from '../components/cards/NotificationCard';
import EmptyState from '../components/ui/EmptyState';
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
        if (!user?.uid || notifications.every(n => n.isRead)) return;
        try {
            await markAllAsRead(user.uid);
            markAllReadLocal();
        } catch (error) {
            console.error(error);
        }
    };

    const handleNotificationPress = async (notification: AppNotification) => {
        if (!user?.uid) return;
        if (!notification.isRead) {
            try {
                await markAsRead(user.uid, notification.id);
                markRead(notification.id);
            } catch (error) {
                console.error(error);
            }
        }
        if (notification.postId && notification.spaceId && notification.courseId) {
            router.push(
                `/post/${notification.postId}?spaceId=${notification.spaceId}&courseId=${notification.courseId}`
            );
        }
    };

    const anyUnread = notifications.some(n => !n.isRead);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity 
                    onPress={handleMarkAllRead} 
                    disabled={!anyUnread}
                    style={[styles.markReadBtn, { opacity: anyUnread ? 1 : 0.3 }]}
                    activeOpacity={0.7}
                >
                    <Ionicons name="checkmark-done" size={22} color={Colors.accentBlue} />
                </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <EmptyState
                        icon="notifications-outline"
                        title="Quiet for now"
                        subtitle="We'll let you know when there's an update in your spaces."
                    />
                </View>
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
                    stickySectionHeadersEnabled={false}
                    contentContainerStyle={styles.listPadding}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
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
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        paddingBottom: 16,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.separator,
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    markReadBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: Typography.size.title3,
        fontFamily: Typography.family.bold,
        color: Colors.textPrimary,
    },
    sectionHeader: {
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: 24,
        paddingBottom: 8,
        backgroundColor: Colors.background,
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: Typography.family.bold,
        color: Colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    listPadding: {
        paddingBottom: 40,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.separator,
        marginLeft: 72, 
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingBottom: 100,
    },
});
