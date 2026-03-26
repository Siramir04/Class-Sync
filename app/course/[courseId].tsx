import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { usePosts } from '../../hooks/usePosts';
import { getCourseById } from '../../services/courseService';
import PostCard from '../../components/cards/PostCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PostTypeSheet from '../../components/sheets/PostTypeSheet';
import CreatePostSheet, { CreatePostData } from '../../components/sheets/CreatePostSheet';
import { PostType, Course, UserRole } from '../../types';
import { createPost, updatePostPinStatus } from '../../services/postService';
import { useSpaceRole } from '../../hooks/useSpaceRole';
import MemberPickerSheet from '../../components/sheets/MemberPickerSheet';
import { assignLecturer as assignLecturerService } from '../../services/courseService';
import * as LucideIcons from 'lucide-react-native';

export default function CourseFeedScreen() {
    const { spaceId, courseId } = useLocalSearchParams<{
        spaceId: string;
        courseId: string;
    }>();
    const router = useRouter();
    const { user } = useAuthStore();

    const [course, setCourse] = useState<Course | null>(null);
    const [courseLoading, setCourseLoading] = useState(true);
    const { posts, loading: postsLoading } = usePosts(spaceId || null, courseId || null);

    const [showPostTypeSheet, setShowPostTypeSheet] = useState(false);
    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [selectedPostType, setSelectedPostType] = useState<PostType>('lecture');

    const { role, isMonitor, isAssistant, isLecturer } = useSpaceRole(spaceId || '');
    
    // Permission to post: Monitor, Asst, Lecturer, OR Student (for Note/Link)
    const canPost = isMonitor || isAssistant || isLecturer || (role === 'student');

    useEffect(() => {
        loadCourse();
    }, [spaceId, courseId]);

    const loadCourse = async () => {
        if (!spaceId || !courseId) return;
        setCourseLoading(true);
        try {
            const data = await getCourseById(spaceId, courseId);
            setCourse(data);
        } catch (error) {
            console.error('Error loading course:', error);
        } finally {
            setCourseLoading(false);
        }
    };

    const handleCreate = async (data: CreatePostData) => {
        if (!spaceId || !courseId || !user || !course) return;
        try {
            await createPost(spaceId, courseId, {
                spaceId,
                courseId,
                courseCode: course.courseCode,
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
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    if (courseLoading) return <LoadingSpinner fullScreen />;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.courseCode}>{course?.courseCode}</Text>
                    <Text style={styles.courseName} numberOfLines={1}>{course?.courseName}</Text>
                </View>
            </View>

            {/* Course info bar */}
            <View style={styles.infoBar}>
                <View style={styles.lecturerRow}>
                    <Text style={styles.infoText}>
                        👨‍🏫 {course?.lecturerName || 'No lecturer assigned'}
                    </Text>
                    {isMonitor && (
                        <TouchableOpacity 
                            onPress={() => setShowPicker(true)} 
                            style={styles.manageBtn}
                        >
                            <Text style={styles.manageText}>
                                {course?.lecturerUid ? 'Change' : 'Assign'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.infoText}>
                    {course?.fullCode}
                </Text>
            </View>

            {/* Posts */}
            {postsLoading ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={posts}
                    renderItem={({ item }) => (
                        <PostCard
                            post={item}
                            onPress={() =>
                                router.push(
                                    `/post/${item.id}?spaceId=${item.spaceId}&courseId=${item.courseId}`
                                )
                            }
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.feedContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState icon="📝" title="No posts yet" subtitle="Activity for this course will appear here" />
                    }
                />
            )}

            {/* FAB for Permitted Users */}
            {canPost && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setShowPostTypeSheet(true)}
                    activeOpacity={0.8}
                >
                    <LucideIcons.Plus size={28} color="#FFFFFF" />
                </TouchableOpacity>
            )}

            <MemberPickerSheet 
                visible={showPicker}
                onClose={() => setShowPicker(false)}
                spaceId={spaceId || ''}
                onSelect={async (lecturer) => {
                    if (!spaceId || !courseId) return;
                    try {
                        await assignLecturerService(spaceId, courseId, lecturer.uid, lecturer.fullName);
                        loadCourse(); // Refresh
                    } catch (error) {
                        console.error("Error assigning lecturer:", error);
                    }
                }}
            />

            <PostTypeSheet
                visible={showPostTypeSheet}
                onClose={() => setShowPostTypeSheet(false)}
                onSelect={(type) => {
                    setSelectedPostType(type);
                    setShowCreateSheet(true);
                }}
                // Lecturers can only create lectures/materials
                filterToLecture={isLecturer && !isMonitor && !isAssistant}
                isStudent={role === 'student'}
            />

            <CreatePostSheet
                visible={showCreateSheet}
                onClose={() => setShowCreateSheet(false)}
                postType={selectedPostType}
                courseCode={course?.courseCode || ''}
                onSubmit={handleCreate}
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
        paddingTop: 16,
        paddingBottom: 8,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
        marginLeft: 12,
    },
    courseCode: {
        fontSize: Typography.size.md,
        fontFamily: Typography.family.bold,
        color: Colors.accentBlue,
    },
    courseName: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    infoBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.screenPadding,
        paddingVertical: 10,
        backgroundColor: Colors.surfaceSecondary,
    },
    infoText: {
        fontSize: Typography.size.sm,
        fontFamily: Typography.family.medium,
        color: Colors.textSecondary,
    },
    lecturerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    manageBtn: {
        backgroundColor: Colors.accentBlueSoft,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    manageText: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.accentBlue,
        fontFamily: Typography.family.bold,
        textTransform: 'uppercase',
    },
    feedContent: {
        padding: Spacing.screenPadding,
        paddingBottom: 100,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
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
