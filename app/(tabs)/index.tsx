import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useRecentPosts } from '../../hooks/usePosts';
import { useSpaces } from '../../hooks/useSpace';
import { useNotifications } from '../../hooks/useNotifications';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ClassCard from '../../components/cards/ClassCard';
import PostCard from '../../components/cards/PostCard';
import SpaceTile from '../../components/cards/SpaceTile';
import { getTodayLabel } from '../../utils/formatDate';
import { Post } from '../../types';

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { unreadCount } = useNotifications();
    const { posts: recentPosts, loading: postsLoading } = useRecentPosts(5);
    const { spaces, loading: spacesLoading } = useSpaces();

    const firstName = user?.fullName?.split(' ')[0] || 'there';

    // Filter today's lectures
    const today = new Date();
    const todayLectures = recentPosts.filter(
        (p) =>
            p.type === 'lecture' &&
            p.lectureDate &&
            new Date(p.lectureDate).toDateString() === today.toDateString()
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Top Bar */}
                <View style={styles.topBar}>
                    <View style={styles.greeting}>
                        <Text style={styles.greetingText}>
                            {getGreeting()}, {firstName} 👋
                        </Text>
                    </View>
                    <View style={styles.topBarRight}>
                        <TouchableOpacity
                            style={styles.bellButton}
                            onPress={() => router.push('/notifications')}
                        >
                            <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
                            {unreadCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                            <Avatar name={user?.fullName || '?'} size={36} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Today's Classes */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Today · {getTodayLabel()}</Text>
                    {todayLectures.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classStrip}>
                            {todayLectures.map((lecture) => (
                                <ClassCard
                                    key={lecture.id}
                                    spaceName={lecture.courseCode}
                                    courseCode={lecture.courseCode}
                                    startTime={lecture.startTime || '—'}
                                    endTime={lecture.endTime || '—'}
                                    venue={lecture.venue || 'TBD'}
                                    status={
                                        lecture.lectureStatus === 'cancelled'
                                            ? 'cancelled'
                                            : 'upcoming'
                                    }
                                    isCarryover={lecture.isCarryover}
                                    onPress={() =>
                                        router.push(
                                            `/post/${lecture.id}?spaceId=${lecture.spaceId}&courseId=${lecture.courseId}`
                                        )
                                    }
                                />
                            ))}
                        </ScrollView>
                    ) : (
                        <EmptyState
                            icon="🎉"
                            title="No classes today"
                            subtitle="Enjoy your free day"
                        />
                    )}
                </View>

                {/* Recent Notices */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionLabel}>Recent Notices</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/spaces')}>
                            <Text style={styles.seeAll}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    {postsLoading ? (
                        <LoadingSpinner />
                    ) : recentPosts.length > 0 ? (
                        recentPosts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                isCarryover={post.isCarryover}
                                onPress={() =>
                                    router.push(
                                        `/post/${post.id}?spaceId=${post.spaceId}&courseId=${post.courseId}`
                                    )
                                }
                            />
                        ))
                    ) : (
                        <EmptyState
                            icon="📭"
                            title="No notices yet"
                            subtitle="Posts from your courses will appear here"
                        />
                    )}
                </View>

                {/* My Spaces */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>My Spaces</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.spacesRow}>
                        {spaces.map((space) => (
                            <SpaceTile
                                key={space.id}
                                name={space.name}
                                onPress={() => router.push(`/space/${space.id}`)}
                            />
                        ))}
                        <SpaceTile
                            name="Add"
                            isAddButton
                            onPress={() => router.push('/join')}
                        />
                    </ScrollView>
                </View>

                <View style={{ height: Spacing.xxl }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    greeting: {
        flex: 1,
    },
    greetingText: {
        ...Typography.pageTitle,
        color: Colors.textPrimary,
    },
    topBarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bellButton: {
        position: 'relative',
        padding: 4,
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -4,
        backgroundColor: Colors.error,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: '700',
    },
    section: {
        paddingHorizontal: Spacing.screenPadding,
        marginTop: Spacing.lg,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionLabel: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    seeAll: {
        ...Typography.label,
        color: Colors.accentBlue,
        marginBottom: Spacing.md,
    },
    classStrip: {
        marginLeft: -Spacing.screenPadding,
        paddingLeft: Spacing.screenPadding,
    },
    spacesRow: {
        marginLeft: -Spacing.screenPadding,
        paddingLeft: Spacing.screenPadding,
    },
});
