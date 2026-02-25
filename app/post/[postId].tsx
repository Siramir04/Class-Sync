import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { getPostById, deletePost } from '../../services/postService';
import Tag, { getPostTypeVariant } from '../../components/ui/Tag';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Post, PostType } from '../../types';
import { formatPostDate, formatRelativeTime } from '../../utils/formatDate';
import { countdownLabel } from '../../utils/countdownLabel';

const typeLabels: Record<PostType, string> = {
    lecture: 'Lecture',
    assignment: 'Assignment',
    test: 'Test',
    note: 'Note',
    announcement: 'Announcement',
    cancellation: 'Cancellation',
};

export default function PostDetailScreen() {
    const { postId, spaceId, courseId } = useLocalSearchParams<{
        postId: string;
        spaceId: string;
        courseId: string;
    }>();
    const router = useRouter();
    const { user } = useAuthStore();

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!postId || !spaceId || !courseId) return;
        loadPost();
    }, [postId, spaceId, courseId]);

    const loadPost = async () => {
        setLoading(true);
        try {
            const data = await getPostById(spaceId!, courseId!, postId!);
            setPost(data);
        } catch (error) {
            console.error('Error loading post:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deletePost(spaceId!, courseId!, postId!);
                    router.back();
                },
            },
        ]);
    };

    const isOwner = user?.uid === post?.authorUid;
    const isCancelled = post?.type === 'cancellation' || post?.lectureStatus === 'cancelled';

    if (loading) return <LoadingSpinner fullScreen />;
    if (!post) return null;

    const dueDateInfo = post.dueDate ? countdownLabel(new Date(post.dueDate)) : null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                {isOwner && (
                    <TouchableOpacity onPress={() => {
                        Alert.alert('Options', '', [
                            { text: 'Edit', onPress: () => { } },
                            { text: 'Delete', style: 'destructive', onPress: handleDelete },
                            { text: 'Cancel', style: 'cancel' },
                        ]);
                    }}>
                        <Ionicons name="ellipsis-vertical" size={22} color={Colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Type badge + Course tag */}
                <View style={styles.tagRow}>
                    <Tag label={typeLabels[post.type]} variant={getPostTypeVariant(post.type)} />
                    <Tag label={post.courseCode} variant="default" style={{ marginLeft: 8 }} />
                </View>

                {/* Title */}
                <Text style={styles.title}>{post.title}</Text>

                {/* Author info */}
                <Text style={styles.authorInfo}>
                    {post.authorName} · {post.authorRole === 'monitor' ? 'Monitor' : post.authorRole === 'lecturer' ? 'Lecturer' : post.authorRole} · {formatRelativeTime(post.createdAt)}
                </Text>

                {/* Cancelled banner */}
                {isCancelled && (
                    <View style={styles.cancelledBanner}>
                        <Ionicons name="close-circle" size={20} color={Colors.white} />
                        <Text style={styles.cancelledText}>CANCELLED</Text>
                    </View>
                )}

                {/* Description */}
                {post.description && (
                    <Text style={styles.description}>{post.description}</Text>
                )}

                {/* Lecture-specific details */}
                {post.type === 'lecture' && (
                    <View style={styles.detailsSection}>
                        {post.venue && (
                            <View style={styles.detailRow}>
                                <Ionicons name="location-outline" size={18} color={Colors.textSecondary} />
                                <Text style={styles.detailText}>Venue: {post.venue}</Text>
                            </View>
                        )}
                        {post.lectureDate && (
                            <View style={styles.detailRow}>
                                <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
                                <Text style={styles.detailText}>Date: {formatPostDate(new Date(post.lectureDate))}</Text>
                            </View>
                        )}
                        {post.startTime && post.endTime && (
                            <View style={styles.detailRow}>
                                <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
                                <Text style={styles.detailText}>Time: {post.startTime} – {post.endTime}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Assignment-specific */}
                {post.type === 'assignment' && post.dueDate && dueDateInfo && (
                    <View style={styles.detailsSection}>
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
                            <Text style={styles.detailText}>Due: {formatPostDate(new Date(post.dueDate))}</Text>
                        </View>
                        <View style={[styles.countdownChip, {
                            backgroundColor: dueDateInfo.severity === 'danger' ? '#FEE2E2' :
                                dueDateInfo.severity === 'warning' ? '#FEF3C7' : Colors.subtleFill
                        }]}>
                            <Text style={[styles.countdownText, {
                                color: dueDateInfo.severity === 'danger' ? Colors.error :
                                    dueDateInfo.severity === 'warning' ? Colors.warning : Colors.accentBlue
                            }]}>
                                {dueDateInfo.label}
                            </Text>
                        </View>
                        {post.marks != null && (
                            <View style={styles.detailRow}>
                                <Ionicons name="ribbon-outline" size={18} color={Colors.textSecondary} />
                                <Text style={styles.detailText}>Marks: {post.marks}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Test-specific */}
                {post.type === 'test' && (
                    <View style={styles.detailsSection}>
                        {post.lectureDate && (
                            <View style={styles.detailRow}>
                                <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
                                <Text style={styles.detailText}>Date: {formatPostDate(new Date(post.lectureDate))}</Text>
                            </View>
                        )}
                        {post.startTime && (
                            <View style={styles.detailRow}>
                                <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
                                <Text style={styles.detailText}>Time: {post.startTime}</Text>
                            </View>
                        )}
                        {post.venue && (
                            <View style={styles.detailRow}>
                                <Ionicons name="location-outline" size={18} color={Colors.textSecondary} />
                                <Text style={styles.detailText}>Venue: {post.venue}</Text>
                            </View>
                        )}
                        {post.marks != null && (
                            <View style={styles.detailRow}>
                                <Ionicons name="ribbon-outline" size={18} color={Colors.textSecondary} />
                                <Text style={styles.detailText}>Marks: {post.marks}</Text>
                            </View>
                        )}
                        {post.topics && (
                            <View style={styles.topicsSection}>
                                <Text style={styles.topicsTitle}>Topics</Text>
                                <Text style={styles.topicsText}>{post.topics}</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
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
    content: {
        padding: Spacing.screenPadding,
        paddingBottom: Spacing.xxl,
    },
    tagRow: {
        flexDirection: 'row',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    authorInfo: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginBottom: Spacing.lg,
    },
    cancelledBanner: {
        backgroundColor: Colors.error,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        borderRadius: Spacing.buttonRadius,
        marginBottom: Spacing.lg,
        gap: 8,
    },
    cancelledText: {
        color: Colors.white,
        fontFamily: 'DMSans_700Bold',
        fontSize: 16,
        letterSpacing: 2,
    },
    description: {
        ...Typography.body,
        color: Colors.textPrimary,
        lineHeight: 22,
        marginBottom: Spacing.lg,
    },
    detailsSection: {
        backgroundColor: Colors.surface,
        borderRadius: Spacing.cardRadius,
        padding: Spacing.md,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        gap: Spacing.sm,
    },
    detailText: {
        ...Typography.body,
        color: Colors.textPrimary,
    },
    countdownChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Spacing.pillRadius,
        alignSelf: 'flex-start',
        marginVertical: Spacing.sm,
    },
    countdownText: {
        ...Typography.buttonText,
    },
    topicsSection: {
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border + '30',
    },
    topicsTitle: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    topicsText: {
        ...Typography.body,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
});
