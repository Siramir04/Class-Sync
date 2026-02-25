import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { addDays, format, isSameDay, startOfToday } from 'date-fns';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { useRecentPosts } from '../../hooks/usePosts';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PostTypeSheet from '../../components/sheets/PostTypeSheet';
import CreatePostSheet from '../../components/sheets/CreatePostSheet';
import { Post, PostType } from '../../types';

function generateWeekDates(): Date[] {
    const today = startOfToday();
    return Array.from({ length: 7 }, (_, i) => addDays(today, i - 3));
}

export default function ScheduleScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { posts, loading } = useRecentPosts(50);

    const [selectedDate, setSelectedDate] = useState(startOfToday());
    const [showPostTypeSheet, setShowPostTypeSheet] = useState(false);
    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [selectedPostType, setSelectedPostType] = useState<PostType>('lecture');

    const weekDates = generateWeekDates();
    const scrollRef = useRef<ScrollView>(null);

    const isMonitorOrAssistant =
        user?.role === 'monitor' || user?.role === 'assistant_monitor';

    // Filter lectures for selected date
    const dayLectures = posts.filter(
        (p) =>
            p.type === 'lecture' &&
            p.lectureDate &&
            isSameDay(new Date(p.lectureDate), selectedDate)
    );

    // Sort by start time
    dayLectures.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    useEffect(() => {
        // Auto-scroll to today
        setTimeout(() => {
            scrollRef.current?.scrollTo({ x: 3 * 60, animated: true });
        }, 100);
    }, []);

    const renderTimelineRow = ({ item: lecture }: { item: Post }) => {
        const isCarryover = (lecture as Post & { _isCarryover?: boolean })._isCarryover;
        const borderColor = isCarryover ? Colors.carryover : Colors.accentBlue;

        return (
            <TouchableOpacity
                style={styles.timelineRow}
                onPress={() =>
                    router.push(
                        `/post/${lecture.id}?spaceId=${lecture.spaceId}&courseId=${lecture.courseId}`
                    )
                }
                activeOpacity={0.8}
            >
                <View style={[styles.timelineBar, { backgroundColor: borderColor }]} />
                <View style={styles.timeColumn}>
                    <Text style={styles.timeText}>{lecture.startTime || '—'}</Text>
                    <Text style={styles.timeTextEnd}>{lecture.endTime || '—'}</Text>
                </View>
                <View style={styles.lectureInfo}>
                    <Text style={styles.courseName} numberOfLines={1}>
                        {lecture.courseCode}
                    </Text>
                    <Text style={styles.venueName} numberOfLines={1}>
                        📍 {lecture.venue || 'TBD'}
                    </Text>
                </View>
                {lecture.lectureStatus === 'cancelled' && (
                    <View style={styles.cancelChip}>
                        <Text style={styles.cancelChipText}>Cancelled</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Schedule</Text>
            </View>

            {/* 7-Day Date Strip */}
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dateStrip}
                contentContainerStyle={styles.dateStripContent}
            >
                {weekDates.map((date, index) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, startOfToday());
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.dateTile, isSelected && styles.dateTileSelected]}
                            onPress={() => setSelectedDate(date)}
                        >
                            <Text
                                style={[
                                    styles.dayAbbrev,
                                    isSelected && styles.dateTileTextSelected,
                                ]}
                            >
                                {format(date, 'EEE')}
                            </Text>
                            <Text
                                style={[
                                    styles.dateNum,
                                    isSelected && styles.dateTileTextSelected,
                                ]}
                            >
                                {format(date, 'd')}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Timeline List */}
            {loading ? (
                <LoadingSpinner />
            ) : dayLectures.length > 0 ? (
                <FlatList
                    data={dayLectures}
                    renderItem={renderTimelineRow}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.timeline}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <EmptyState
                    icon="📅"
                    title={`No classes on ${format(selectedDate, 'EEEE')}`}
                />
            )}

            {/* FAB for Monitor */}
            {isMonitorOrAssistant && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setShowPostTypeSheet(true)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={28} color={Colors.white} />
                </TouchableOpacity>
            )}

            <PostTypeSheet
                visible={showPostTypeSheet}
                onClose={() => setShowPostTypeSheet(false)}
                onSelect={(type) => {
                    setSelectedPostType(type);
                    setShowCreateSheet(true);
                }}
                filterToLecture
            />

            <CreatePostSheet
                visible={showCreateSheet}
                onClose={() => setShowCreateSheet(false)}
                postType={selectedPostType}
                courseCode=""
                onSubmit={() => setShowCreateSheet(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    headerTitle: {
        ...Typography.pageTitle,
        color: Colors.textPrimary,
    },
    dateStrip: {
        maxHeight: 80,
    },
    dateStripContent: {
        paddingHorizontal: Spacing.screenPadding,
        gap: 8,
    },
    dateTile: {
        width: 52,
        height: 68,
        borderRadius: Spacing.cardRadius,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.surface,
    },
    dateTileSelected: {
        backgroundColor: Colors.accentBlue,
    },
    dayAbbrev: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    dateNum: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
    },
    dateTileTextSelected: {
        color: Colors.white,
    },
    timeline: {
        padding: Spacing.screenPadding,
    },
    timelineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: Spacing.cardRadius,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    timelineBar: {
        width: 4,
        height: '100%',
        minHeight: 40,
        borderRadius: 2,
        marginRight: Spacing.md,
    },
    timeColumn: {
        width: 60,
        marginRight: Spacing.md,
    },
    timeText: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
        fontSize: 13,
    },
    timeTextEnd: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    lectureInfo: {
        flex: 1,
    },
    courseName: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
    },
    venueName: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    cancelChip: {
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: Spacing.pillRadius,
    },
    cancelChipText: {
        ...Typography.label,
        color: Colors.error,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: Spacing.fabSize,
        height: Spacing.fabSize,
        borderRadius: Spacing.fabSize / 2,
        backgroundColor: Colors.accentBlue,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.accentBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
});
