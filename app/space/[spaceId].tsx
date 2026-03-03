import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { useCourses } from '../../hooks/useCourses';
import { getPostsBySpace } from '../../services/postService';
import { getSpaceById } from '../../services/spaceService';
import PostCard from '../../components/cards/PostCard';
import Tag from '../../components/ui/Tag';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PostTypeSheet from '../../components/sheets/PostTypeSheet';
import CreatePostSheet, { CreatePostData } from '../../components/sheets/CreatePostSheet';
import { Post, PostType, Space } from '../../types';
import { createPost } from '../../services/postService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AttendanceSession } from '../../types/attendance';

const postTypeFilters = ['All', 'Lectures', 'Assignments', 'Tests', 'Notes', 'Announcements'] as const;
const postTypeMap: Record<string, PostType | undefined> = {
    All: undefined,
    Lectures: 'lecture',
    Assignments: 'assignment',
    Tests: 'test',
    Notes: 'note',
    Announcements: 'announcement',
};

export default function SpaceFeedScreen() {
    const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
    const router = useRouter();
    const { user } = useAuthStore();
    const { courses } = useCourses(spaceId || null);

    const [space, setSpace] = useState<Space | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCourse, setActiveCourse] = useState<string>('All');
    const [activeTypeFilter, setActiveTypeFilter] = useState<string>('All');
    const [showPostTypeSheet, setShowPostTypeSheet] = useState(false);
    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [selectedPostType, setSelectedPostType] = useState<PostType>('lecture');
    const [createLoading, setCreateLoading] = useState(false);
    const [activeSessions, setActiveSessions] = useState<AttendanceSession[]>([]);

    const isMonitor = user?.uid === space?.monitorUid || user?.uid === space?.assistantMonitorUid;
    const isLecturer = user?.role === 'lecturer';

    useEffect(() => {
        if (!spaceId) return;
        loadData();
    }, [spaceId]);

    // Listen for active attendance sessions
    useEffect(() => {
        if (!spaceId || courses.length === 0) return;

        const unsubscribes: (() => void)[] = [];

        courses.forEach(course => {
            const sessionsRef = collection(db, 'spaces', spaceId, 'courses', course.id, 'sessions');
            const q = query(sessionsRef, where('isActive', '==', true));

            const unsub = onSnapshot(q, (snapshot) => {
                const liveSessions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AttendanceSession));
                setActiveSessions(prev => {
                    const filtered = prev.filter(s => s.courseId !== course.id);
                    return [...filtered, ...liveSessions];
                });
            });
            unsubscribes.push(unsub);
        });

        return () => unsubscribes.forEach(unsub => unsub());
    }, [spaceId, courses]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [spaceData, postsData] = await Promise.all([
                getSpaceById(spaceId!),
                getPostsBySpace(spaceId!),
            ]);
            setSpace(spaceData);
            setPosts(postsData);
        } catch (error) {
            console.error('Error loading space:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter posts
    const filteredPosts = posts.filter((post) => {
        const courseMatch =
            activeCourse === 'All' ||
            courses.find((c) => c.courseName === activeCourse)?.id === post.courseId;
        const typeMatch =
            activeTypeFilter === 'All' || post.type === postTypeMap[activeTypeFilter];
        return courseMatch && typeMatch;
    });

    const showFab = isMonitor || (isLecturer && activeCourse !== 'All');

    const handleCreatePost = async (data: CreatePostData) => {
        if (!spaceId || !user) return;
        const selectedCourse = activeCourse !== 'All'
            ? courses.find((c) => c.courseName === activeCourse)
            : courses[0];

        if (!selectedCourse) return;

        setCreateLoading(true);
        try {
            await createPost(spaceId, selectedCourse.id, {
                spaceId,
                courseId: selectedCourse.id,
                courseCode: selectedCourse.courseCode,
                type: selectedPostType,
                title: data.title,
                description: data.description,
                authorUid: user.uid,
                authorName: user.fullName,
                authorRole: user.role,
                venue: data.venue,
                startTime: data.startTime,
                endTime: data.endTime,
                lectureDate: data.lectureDate ? new Date(data.lectureDate) : undefined,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                marks: data.marks ? parseInt(data.marks) : undefined,
                topics: data.topics,
                lectureStatus: selectedPostType === 'lecture' ? 'scheduled' : undefined,
            });
            setShowCreateSheet(false);
            loadData();
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setCreateLoading(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.spaceName} numberOfLines={1}>{space?.name}</Text>
                    <Text style={styles.spaceCode}>{space?.spaceCode} · {space?.memberCount} members</Text>
                </View>
                {isMonitor && (
                    <TouchableOpacity
                        onPress={() => router.push(`/space/manage?spaceId=${spaceId}`)}
                    >
                        <Ionicons name="ellipsis-vertical" size={22} color={Colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Course Filter Row */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterRow}
                contentContainerStyle={styles.filterContent}
            >
                <TouchableOpacity
                    style={[styles.filterPill, activeCourse === 'All' && styles.filterPillActive]}
                    onPress={() => setActiveCourse('All')}
                >
                    <Text style={[styles.filterPillText, activeCourse === 'All' && styles.filterPillTextActive]}>
                        All
                    </Text>
                </TouchableOpacity>
                {courses.map((course) => (
                    <TouchableOpacity
                        key={course.id}
                        style={[styles.filterPill, activeCourse === course.courseName && styles.filterPillActive]}
                        onPress={() => setActiveCourse(course.courseName)}
                    >
                        <Text
                            style={[
                                styles.filterPillText,
                                activeCourse === course.courseName && styles.filterPillTextActive,
                            ]}
                        >
                            {course.courseCode}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Type Filter Row */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.typeFilterRow}
                contentContainerStyle={styles.filterContent}
            >
                {postTypeFilters.map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[styles.typeFilterPill, activeTypeFilter === filter && styles.filterPillActive]}
                        onPress={() => setActiveTypeFilter(filter)}
                    >
                        <Text
                            style={[
                                styles.typeFilterPillText,
                                activeTypeFilter === filter && styles.filterPillTextActive,
                            ]}
                        >
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Active Sessions Banner */}
            {activeSessions.length > 0 && (
                <View style={styles.activeSessionsContainer}>
                    {activeSessions.map(session => (
                        <TouchableOpacity
                            key={session.id}
                            style={styles.sessionBanner}
                            onPress={() => router.push(`/attendance/session/${session.id}?courseId=${session.courseId}&spaceId=${spaceId}`)}
                        >
                            <View style={styles.sessionIcon}>
                                <Ionicons name="qr-code" size={20} color={Colors.white} />
                            </View>
                            <View style={styles.sessionInfo}>
                                <Text style={styles.sessionTitle}>Live Attendance: {session.courseCode}</Text>
                                <Text style={styles.sessionSubtitle}>Started by {session.initiatedByName} · Tap to join</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={Colors.white + '80'} />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Activity Feed */}
            <FlatList
                data={filteredPosts}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        onPress={() =>
                            router.push(`/post/${item.id}?spaceId=${item.spaceId}&courseId=${item.courseId}`)
                        }
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.feedContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState icon="📝" title="No posts yet" subtitle="Activity will appear here" />
                }
            />

            {/* FAB */}
            {showFab && (
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
                    if (type === 'attendance') {
                        // Find the first course to start attendance if 'All' is selected, 
                        // or use the active course.
                        const course = activeCourse !== 'All'
                            ? courses.find(c => c.courseCode === activeCourse)
                            : courses[0];

                        if (course) {
                            router.push(`/attendance/session/new?courseId=${course.id}&spaceId=${spaceId}&courseCode=${course.courseCode}&courseName=${encodeURIComponent(course.courseName)}`);
                        }
                    } else {
                        setSelectedPostType(type);
                        setShowCreateSheet(true);
                    }
                }}
            />

            <CreatePostSheet
                visible={showCreateSheet}
                onClose={() => setShowCreateSheet(false)}
                postType={selectedPostType}
                courseCode={activeCourse !== 'All' ? activeCourse : courses[0]?.courseCode || ''}
                onSubmit={handleCreatePost}
                loading={createLoading}
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
        alignItems: 'center',
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
        marginLeft: Spacing.sm,
    },
    spaceName: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    spaceCode: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    filterRow: {
        maxHeight: 44,
        marginTop: Spacing.sm,
    },
    typeFilterRow: {
        maxHeight: 36,
        marginTop: Spacing.xs,
    },
    filterContent: {
        paddingHorizontal: Spacing.screenPadding,
        gap: 8,
    },
    filterPill: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Spacing.pillRadius,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border + '40',
    },
    filterPillActive: {
        backgroundColor: Colors.accentBlue,
        borderColor: Colors.accentBlue,
    },
    filterPillText: {
        ...Typography.label,
        color: Colors.textSecondary,
    },
    filterPillTextActive: {
        color: Colors.white,
    },
    typeFilterPill: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: Spacing.pillRadius,
        backgroundColor: Colors.surface,
    },
    typeFilterPillText: {
        ...Typography.label,
        color: Colors.textSecondary,
        fontSize: 11,
    },
    feedContent: {
        padding: Spacing.screenPadding,
        paddingBottom: 100,
    },
    activeSessionsContainer: {
        paddingHorizontal: Spacing.screenPadding,
        marginTop: Spacing.md,
        gap: 8,
    },
    sessionBanner: {
        backgroundColor: Colors.primaryBlue,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: Colors.primaryBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    sessionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sessionInfo: {
        flex: 1,
    },
    sessionTitle: {
        ...Typography.buttonText,
        fontSize: 14,
        color: Colors.white,
    },
    sessionSubtitle: {
        ...Typography.label,
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
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
