import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { useCourses } from '../../hooks/useCourses';
import { getPostsBySpace, createPost } from '../../services/postService';
import { getSpaceById } from '../../services/spaceService';
import PostCard from '../../components/cards/PostCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PostTypeSheet from '../../components/sheets/PostTypeSheet';
import CreatePostSheet, { CreatePostData } from '../../components/sheets/CreatePostSheet';
import { Post, PostType, Space, AttendanceSession } from '../../types';

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
    const [activeCourseId, setActiveCourseId] = useState<string>('All');
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

    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            const courseMatch = activeCourseId === 'All' || post.courseId === activeCourseId;
            const typeMatch = activeTypeFilter === 'All' || post.type === postTypeMap[activeTypeFilter];
            return courseMatch && typeMatch;
        });
    }, [posts, activeCourseId, activeTypeFilter]);

    const handleCreatePost = async (data: CreatePostData) => {
        if (!spaceId || !user) return;
        const selectedCourse = activeCourseId !== 'All' 
            ? courses.find(c => c.id === activeCourseId) 
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
            {/* Nav Header */}
            <View style={styles.navHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.navTitleContainer}>
                    <Text style={styles.navTitle} numberOfLines={1}>{space?.name}</Text>
                    <Text style={styles.navSubtitle}>{space?.spaceCode} · {space?.memberCount} members</Text>
                </View>
                {isMonitor && (
                    <TouchableOpacity
                        style={styles.headerIconButton}
                        onPress={() => router.push(`/space/manage?spaceId=${spaceId}`)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="settings-outline" size={22} color={Colors.textPrimary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Content Switcher / Filters */}
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContent}
                >
                    <TouchableOpacity
                        style={[styles.filterPill, activeCourseId === 'All' && styles.filterPillActive]}
                        onPress={() => setActiveCourseId('All')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.filterPillText, activeCourseId === 'All' && styles.filterPillTextActive]}>
                            All Feed
                        </Text>
                    </TouchableOpacity>
                    {courses.map((course) => (
                        <TouchableOpacity
                            key={course.id}
                            style={[styles.filterPill, activeCourseId === course.id && styles.filterPillActive]}
                            onPress={() => setActiveCourseId(course.id)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.filterPillText,
                                    activeCourseId === course.id && styles.filterPillTextActive,
                                ]}
                            >
                                {course.courseCode}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.typeFilterRow}
                    contentContainerStyle={styles.filterContent}
                >
                    {postTypeFilters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.typeFilterPill, activeTypeFilter === filter && styles.typeFilterPillActive]}
                            onPress={() => setActiveTypeFilter(filter)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.typeFilterText,
                                    activeTypeFilter === filter && styles.typeFilterTextActive,
                                ]}
                            >
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Quick Access Row */}
            <View style={styles.quickAccessRow}>
                <TouchableOpacity 
                    style={styles.materialsBtn}
                    onPress={() => router.push({
                        pathname: '/course/[courseId]/materials',
                        params: { 
                            spaceId: spaceId!, 
                            courseId: activeCourseId !== 'All' ? activeCourseId : courses[0]?.id || '',
                            courseCode: activeCourseId !== 'All' ? courses.find(c => c.id === activeCourseId)?.courseCode : courses[0]?.courseCode
                        }
                    })}
                    activeOpacity={0.7}
                >
                    <View style={styles.materialsIconBox}>
                        <Ionicons name="document-attach" size={18} color={Colors.primaryBlue} />
                    </View>
                    <Text style={styles.materialsText}>Course Materials</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                </TouchableOpacity>
            </View>

            {/* Live Activities / Attendance */}
            <View style={styles.listContainer}>
                <FlatList
                    data={filteredPosts}
                    renderItem={({ item }) => (
                        <PostCard
                            post={item}
                            isMonitor={isMonitor}
                            onPress={() =>
                                router.push(`/post/${item.id}?spaceId=${item.spaceId}&courseId=${item.courseId}`)
                            }
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.feedContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        activeSessions.length > 0 ? (
                            <View style={styles.activeSessionsContainer}>
                                {activeSessions.map(session => (
                                    <TouchableOpacity
                                        key={session.id}
                                        style={styles.sessionBanner}
                                        onPress={() => router.push(`/attendance/session/${session.id}?courseId=${session.courseId}&spaceId=${spaceId}`)}
                                        activeOpacity={0.9}
                                    >
                                        <View style={styles.sessionPulse}>
                                            <View style={styles.pulseInner} />
                                        </View>
                                        <View style={styles.sessionInfo}>
                                            <Text style={styles.sessionTitle}>Live Attendance</Text>
                                            <Text style={styles.sessionSubtitle}>{session.courseCode} · Join session now</Text>
                                        </View>
                                        <Ionicons name="qr-code-outline" size={20} color={Colors.white} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <EmptyState 
                            icon="newspaper-outline" 
                            title="Nothing here yet" 
                            subtitle="Be the first to share an update or schedule a lecture." 
                        />
                    }
                />
            </View>

            {/* Create Post FAB */}
            {(isMonitor || isLecturer) && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setShowPostTypeSheet(true)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={30} color={Colors.white} />
                </TouchableOpacity>
            )}

            <PostTypeSheet
                visible={showPostTypeSheet}
                onClose={() => setShowPostTypeSheet(false)}
                onSelect={(type) => {
                    if (type === 'attendance') {
                        const course = activeCourseId !== 'All'
                            ? courses.find(c => c.id === activeCourseId)
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
                courseCode={activeCourseId !== 'All' ? courses.find(c => c.id === activeCourseId)?.courseCode || '' : courses[0]?.courseCode || ''}
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
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingTop: Platform.OS === 'ios' ? 0 : 10,
        height: 56,
    },
    headerIconButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    navTitle: {
        fontSize: 17,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    navSubtitle: {
        fontSize: 11,
        fontFamily: 'DMSans_500Medium',
        color: Colors.textSecondary,
    },
    filterContainer: {
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '20',
    },
    filterContent: {
        paddingHorizontal: Spacing.screenPadding,
        gap: 8,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border + '40',
    },
    filterPillActive: {
        backgroundColor: Colors.primaryBlue,
        borderColor: Colors.primaryBlue,
    },
    filterPillText: {
        fontSize: 13,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.textSecondary,
    },
    filterPillTextActive: {
        color: Colors.white,
    },
    typeFilterRow: {
        marginTop: 10,
    },
    typeFilterPill: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeFilterPillActive: {
        backgroundColor: Colors.primaryBlue + '10',
    },
    typeFilterText: {
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
        color: Colors.textTertiary,
    },
    typeFilterTextActive: {
        color: Colors.primaryBlue,
        fontFamily: 'DMSans_700Bold',
    },
    listContainer: {
        flex: 1,
    },
    feedContent: {
        padding: Spacing.screenPadding,
        paddingBottom: 100,
    },
    activeSessionsContainer: {
        marginBottom: Spacing.lg,
        gap: 8,
    },
    sessionBanner: {
        backgroundColor: Colors.error, // Use error (red) for live pulse feel
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: Colors.error,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    sessionPulse: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    pulseInner: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.white,
    },
    sessionInfo: {
        flex: 1,
    },
    sessionTitle: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: Colors.white,
    },
    sessionSubtitle: {
        fontSize: 11,
        fontFamily: 'DMSans_500Medium',
        color: 'rgba(255,255,255,0.8)',
    },
    quickAccessRow: {
        paddingHorizontal: Spacing.screenPadding,
        paddingVertical: 12,
        backgroundColor: Colors.background,
    },
    materialsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border + '15',
    },
    materialsIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.primaryBlue + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    materialsText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.textPrimary,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 25,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.primaryBlue,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        ...Platform.select({
            ios: {
                shadowColor: Colors.primaryBlue,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
            },
            android: {
                elevation: 8,
            },
        }),
    },
});
