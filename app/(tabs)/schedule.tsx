import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { addDays, format, isSameDay, startOfToday } from 'date-fns';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { useRecentPosts } from '../../hooks/usePosts';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PostTypeSheet from '../../components/sheets/PostTypeSheet';
import CreatePostSheet from '../../components/sheets/CreatePostSheet';
import { Post, PostType } from '../../types';

function generateWeekDates(): Date[] {
    const today = startOfToday();
    return Array.from({ length: 14 }, (_, i) => addDays(today, i - 3));
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
        // Auto-scroll to today/selected on mount
        setTimeout(() => {
            const index = weekDates.findIndex(d => isSameDay(d, selectedDate));
            if (index !== -1 && scrollRef.current) {
                scrollRef.current.scrollTo({ x: index * 62 - 20, animated: true });
            }
        }, 300);
    }, []);

    const renderTimelineRow = ({ item: lecture }: { item: Post }) => {
        const isCancelled = lecture.lectureStatus === 'cancelled';
        const borderColor = lecture.isCarryover ? Colors.carryover : Colors.primaryBlue;

        return (
            <TouchableOpacity
                onPress={() =>
                    router.push(
                        `/post/${lecture.id}?spaceId=${lecture.spaceId}&courseId=${lecture.courseId}`
                    )
                }
                activeOpacity={0.7}
            >
                <Card style={[styles.lectureCard, isCancelled && styles.cancelledCard]}>
                    <View style={[styles.statusIndicator, { backgroundColor: borderColor }]} />
                    <View style={styles.lectureContent}>
                        <View style={styles.lectureMain}>
                            <View style={styles.timeInfo}>
                                <Text style={styles.timeText}>{lecture.startTime || '—'}</Text>
                                <Text style={styles.durationText}>
                                    {lecture.endTime ? `until ${lecture.endTime}` : ''}
                                </Text>
                            </View>
                            <View style={styles.courseInfo}>
                                <Text style={styles.courseCode} numberOfLines={1}>
                                    {lecture.courseCode}
                                </Text>
                                <Text style={styles.venueText} numberOfLines={1}>
                                    {lecture.venue || 'TBD'}
                                </Text>
                            </View>
                        </View>
                        {isCancelled && (
                            <View style={styles.cancelBadge}>
                                <Text style={styles.cancelBadgeText}>CANCELLED</Text>
                            </View>
                        )}
                        {lecture.isCarryover && !isCancelled && (
                            <View style={styles.carryoverBadge}>
                                <Text style={styles.carryoverBadgeText}>CARRYOVER</Text>
                            </View>
                        )}
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Schedule</Text>
                    <Text style={styles.monthLabel}>{format(selectedDate, 'MMMM yyyy')}</Text>
                </View>
                {isMonitorOrAssistant && (
                    <TouchableOpacity 
                        style={styles.addIconButton}
                        onPress={() => setShowPostTypeSheet(true)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={26} color={Colors.primaryBlue} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Date Strip */}
            <View style={styles.dateStripContainer}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dateStripContent}
                >
                    {weekDates.map((date, index) => {
                        const isSelected = isSameDay(date, selectedDate);
                        const isToday = isSameDay(date, startOfToday());
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dateTile, 
                                    isSelected && styles.dateTileSelected,
                                    isToday && !isSelected && styles.dateTileToday
                                ]}
                                onPress={() => setSelectedDate(date)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.dayAbbrev,
                                    isSelected && styles.dateTileTextSelected,
                                    isToday && !isSelected && styles.dayTodayText
                                ]}>
                                    {format(date, 'EEE')}
                                </Text>
                                <Text style={[
                                    styles.dateNum,
                                    isSelected && styles.dateTileTextSelected,
                                    isToday && !isSelected && styles.dateTodayText
                                ]}>
                                    {format(date, 'd')}
                                </Text>
                                {isToday && isSelected && <View style={styles.todayDot} />}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Timeline List */}
            <View style={styles.content}>
                {loading ? (
                    <LoadingSpinner />
                ) : dayLectures.length > 0 ? (
                    <FlatList
                        data={dayLectures}
                        renderItem={renderTimelineRow}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listPadding}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <EmptyState
                        icon="calendar-outline"
                        title={isSameDay(selectedDate, startOfToday()) ? "No classes today" : "Free day!"}
                        subtitle={`You have no scheduled lectures for ${format(selectedDate, 'EEEE, do MMMM')}.`}
                    />
                )}
            </View>

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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        marginBottom: Spacing.lg,
    },
    headerTitle: {
        ...Typography.pageTitle,
        color: Colors.textPrimary,
    },
    monthLabel: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    addIconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    dateStripContainer: {
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '20',
    },
    dateStripContent: {
        paddingHorizontal: Spacing.screenPadding,
        gap: 10,
    },
    dateTile: {
        width: 52,
        height: 68,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border + '20',
    },
    dateTileSelected: {
        backgroundColor: Colors.primaryBlue,
        borderColor: Colors.primaryBlue,
        ...Platform.select({
            ios: {
                shadowColor: Colors.primaryBlue,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    dateTileToday: {
        borderColor: Colors.primaryBlue + '60',
    },
    dayAbbrev: {
        fontSize: 10,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    dateNum: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    dateTileTextSelected: {
        color: Colors.white,
    },
    dayTodayText: {
        color: Colors.primaryBlue,
    },
    dateTodayText: {
        color: Colors.primaryBlue,
    },
    todayDot: {
        position: 'absolute',
        bottom: 8,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.white,
    },
    content: {
        flex: 1,
    },
    listPadding: {
        padding: Spacing.screenPadding,
        paddingBottom: 120, // Extra space for tab bar
    },
    lectureCard: {
        flexDirection: 'row',
        padding: 0,
        marginBottom: Spacing.md,
        overflow: 'hidden',
    },
    cancelledCard: {
        opacity: 0.6,
        backgroundColor: Colors.background,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: Colors.border,
        elevation: 0,
        shadowOpacity: 0,
    },
    statusIndicator: {
        width: 6,
        height: '100%',
    },
    lectureContent: {
        flex: 1,
        padding: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lectureMain: {
        flex: 1,
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 4,
    },
    timeText: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    durationText: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textSecondary,
    },
    courseInfo: {
        gap: 2,
    },
    courseCode: {
        fontSize: 17,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.textPrimary,
    },
    venueText: {
        fontSize: 13,
        fontFamily: 'DMSans_500Medium',
        color: Colors.textTertiary,
    },
    cancelBadge: {
        backgroundColor: Colors.error + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    cancelBadgeText: {
        fontSize: 10,
        fontFamily: 'DMSans_700Bold',
        color: Colors.error,
    },
    carryoverBadge: {
        backgroundColor: Colors.carryover + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    carryoverBadgeText: {
        fontSize: 10,
        fontFamily: 'DMSans_700Bold',
        color: Colors.carryover,
    },
});
