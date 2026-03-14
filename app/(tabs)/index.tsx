import React from 'react';
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
import { useRecentPosts } from '../../hooks/usePosts';
import { useSpaces } from '../../hooks/useSpace';
import { useNotifications } from '../../hooks/useNotifications';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ClassCard from '../../components/cards/ClassCard';
import PostCard from '../../components/cards/PostCard';
import SpaceTile from '../../components/cards/SpaceTile';
import { getTodayLabel } from '../../utils/formatDate';
import { useActiveAttendance } from '../../hooks/useAttendance';
import { useTracker } from '../../hooks/useTracker';
import AttendanceMarkSheet from '../../components/sheets/AttendanceMarkSheet';
import DueSoonWidget from '../../components/home/DueSoonWidget';
import { Animated, Easing } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { AttendanceSession } from '../../types';

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
    const { posts: recentPosts, loading: postsLoading } = useRecentPosts(10);
    const { spaces } = useSpaces();

    const firstName = user?.fullName?.split(' ')[0] || 'there';

    // Filter today's lectures
    const today = new Date();
    const todayLectures = recentPosts.filter(
        (p) =>
            p.type === 'lecture' &&
            p.lectureDate &&
            new Date(p.lectureDate).toDateString() === today.toDateString()
    );

    const { activeSessions, loading: attendanceLoading } = useActiveAttendance();
    const { deadlines, loading: trackerLoading } = useTracker();
    const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (activeSessions.length > 0) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 0.85,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [activeSessions]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.dateLabel}>{getTodayLabel()}</Text>
                        <Text style={styles.greetingText}>
                            {getGreeting()}, {firstName}
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => router.push('/notifications')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="notifications" size={24} color={Colors.textPrimary} />
                            {unreadCount > 0 && <View style={styles.badge} />}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.7}>
                            <Avatar name={user?.fullName || '?'} size={40} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Attendance Banner */}
                {activeSessions.length > 0 && (
                    <Animated.View style={[styles.bannerContainer, { opacity: pulseAnim }]}>
                        <TouchableOpacity 
                            style={styles.attendanceBanner}
                            onPress={() => setSelectedSession(activeSessions[0])}
                            activeOpacity={0.9}
                        >
                            <View style={styles.bannerIconBox}>
                                <Ionicons name="location" size={24} color={Colors.white} />
                            </View>
                            <View style={styles.bannerContent}>
                                <View style={styles.bannerBadge}>
                                    <View style={styles.liveDot} />
                                    <Text style={styles.liveText}>LIVE SESSION AVAILABLE</Text>
                                </View>
                                <Text style={styles.bannerTitle}>{activeSessions[0].courseCode}</Text>
                                <Text style={styles.bannerSubtitle}>Tap to verify proximity & mark present</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.white} />
                        </TouchableOpacity>
                    </Animated.View>
                )}
                {/* Due Soon Tracker */}
                <DueSoonWidget deadlines={deadlines} loading={trackerLoading} />

                {/* Today's Schedule Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Today's Schedule</Text>
                    </View>
                    
                    {todayLectures.length > 0 ? (
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false} 
                            contentContainerStyle={styles.horizontalScroll}
                        >
                            {todayLectures.map((lecture) => (
                                <ClassCard
                                    key={lecture.id}
                                    spaceName={lecture.courseCode}
                                    courseCode={lecture.courseCode}
                                    startTime={lecture.startTime || '—'}
                                    endTime={lecture.endTime || '—'}
                                    venue={lecture.venue || 'TBD'}
                                    status={lecture.lectureStatus === 'cancelled' ? 'cancelled' : 'upcoming'}
                                    isCarryover={lecture.isCarryover}
                                    style={styles.classCard}
                                    onPress={() =>
                                        router.push(`/post/${lecture.id}?spaceId=${lecture.spaceId}&courseId=${lecture.courseId}`)
                                    }
                                />
                            ))}
                        </ScrollView>
                    ) : (
                        <Card style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No classes scheduled for today.</Text>
                        </Card>
                    )}
                </View>

                {/* Spaces Quick Access */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>My Spaces</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/spaces')} activeOpacity={0.7}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScroll}
                    >
                        {spaces.map((space) => (
                            <SpaceTile
                                key={space.id}
                                name={space.name}
                                style={styles.spaceTile}
                                onPress={() => router.push(`/space/${space.id}`)}
                            />
                        ))}
                        <TouchableOpacity 
                            style={styles.addSpaceButton}
                            onPress={() => router.push('/join')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add" size={24} color={Colors.primaryBlue} />
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Recent Updates */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Updates</Text>
                    </View>
                    
                    {postsLoading ? (
                        <LoadingSpinner />
                    ) : recentPosts.length > 0 ? (
                        recentPosts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                isCarryover={post.isCarryover}
                                style={styles.postCard}
                                onPress={() =>
                                    router.push(`/post/${post.id}?spaceId=${post.spaceId}&courseId=${post.courseId}`)
                                }
                            />
                        ))
                    ) : (
                        <EmptyState
                            icon="newspaper-outline"
                            title="No updates yet"
                            subtitle="Course updates and announcements will appear here."
                        />
                    )}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {selectedSession && (
                <AttendanceMarkSheet 
                    visible={!!selectedSession}
                    onClose={() => setSelectedSession(null)}
                    session={selectedSession}
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
    scrollContent: {
        paddingTop: 10,
    },
    bannerContainer: {
        marginHorizontal: Spacing.screenPadding,
        marginBottom: Spacing.lg,
    },
    attendanceBanner: {
        backgroundColor: Colors.accentBlue,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: Colors.accentBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    bannerIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bannerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.success,
    },
    liveText: {
        fontSize: 10,
        fontFamily: 'DMSans_700Bold',
        color: Colors.white,
        letterSpacing: 0.5,
    },
    bannerContent: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: Colors.white,
    },
    bannerSubtitle: {
        fontSize: 13,
        fontFamily: 'DMSans_400Regular',
        color: 'rgba(255,255,255,0.8)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.screenPadding,
        marginBottom: Spacing.xl,
    },
    dateLabel: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    greetingText: {
        ...Typography.pageTitle,
        color: Colors.textPrimary,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.error,
        borderWidth: 2,
        borderColor: Colors.surface,
    },
    section: {
        marginBottom: Spacing.xxl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingHorizontal: Spacing.screenPadding,
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
    },
    seeAll: {
        ...Typography.bodySmall,
        color: Colors.primaryBlue,
        fontWeight: '600',
    },
    horizontalScroll: {
        paddingLeft: Spacing.screenPadding,
        paddingRight: Spacing.screenPadding,
        gap: 16,
    },
    classCard: {
        width: 280,
    },
    spaceTile: {
        width: 120,
    },
    addSpaceButton: {
        marginRight: Spacing.screenPadding,
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border + '40',
        borderStyle: 'dashed',
    },
    emptyCard: {
        marginHorizontal: Spacing.screenPadding,
        padding: Spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        ...Typography.body,
        color: Colors.textSecondary,
    },
    postCard: {
        marginHorizontal: Spacing.screenPadding,
        marginBottom: Spacing.md,
    },
});
