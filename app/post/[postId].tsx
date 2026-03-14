import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    Platform,
    Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { getPostById, deletePost, markPostAsRead, updatePostImportantStatus } from '../../services/postService';
import Card from '../../components/ui/Card';
import Tag, { getPostTypeVariant } from '../../components/ui/Tag';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Post, PostType } from '../../types';
import { formatPostDate, formatRelativeTime } from '../../utils/formatDate';
import { countdownLabel } from '../../utils/countdownLabel';
import { useAlarmStore } from '../../store/alarmStore';
import AlarmSheet from '../../components/sheets/AlarmSheet';
import ReadReceiptsSheet from '../../components/sheets/ReadReceiptsSheet';

const typeLabels: Record<PostType, string> = {
    lecture: 'Lecture',
    assignment: 'Assignment',
    test: 'Test',
    note: 'Note',
    announcement: 'Announcement',
    cancellation: 'Cancellation',
    attendance: 'Attendance',
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
    const [alarmSheetVisible, setAlarmSheetVisible] = useState(false);
    const { isAlarmSet } = useAlarmStore();
    const [isMonitor, setIsMonitor] = useState(false);
    const [receiptsVisible, setReceiptsVisible] = useState(false);
    const [memberCount, setMemberCount] = useState(0);

    useEffect(() => {
        if (!postId || !spaceId || !courseId) return;
        loadPost();
        checkMonitorStatus();
    }, [postId, spaceId, courseId]);

    const checkMonitorStatus = async () => {
        if (!spaceId || !user) return;
        const { getSpaceById } = await import('../../services/spaceService');
        const space = await getSpaceById(spaceId);
        if (space) {
            setIsMonitor(user.uid === space.monitorUid || user.uid === space.assistantMonitorUid);
            setMemberCount(space.memberCount || 0);
        }
    };

    const loadPost = async () => {
        setLoading(true);
        try {
            const data = await getPostById(spaceId!, courseId!, postId!);
            setPost(data);

            // Mark as read if important and not the author
            if (data?.isImportant && user && data.authorUid !== user.uid) {
                await markPostAsRead(spaceId!, courseId!, postId!, user.uid, user.fullName);
            }
        } catch (error) {
            console.error('Error loading post:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleImportance = async () => {
        if (!post) return;
        const newStatus = !post.isImportant;
        try {
            await updatePostImportantStatus(spaceId!, courseId!, postId!, newStatus);
            setPost({ ...post, isImportant: newStatus });
            Alert.alert('Success', `Post marked as ${newStatus ? 'Important' : 'Normal'}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update post status');
        }
    };

    const handleDelete = () => {
        Alert.alert('Delete Post', 'Are you sure you want to delete this post? This action cannot be undone.', [
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

    const handleShare = async () => {
        if (!post) return;
        try {
            await Share.share({
                message: `${post.title}\n\n${post.description || ''}\n\nShared via ClassSync`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const isOwner = user?.uid === post?.authorUid;
    const isCancelled = post?.type === 'cancellation' || post?.lectureStatus === 'cancelled';

    if (loading) return <LoadingSpinner fullScreen />;
    if (!post) return null;

    const dueDateInfo = post.dueDate ? countdownLabel(new Date(post.dueDate)) : null;

    return (
        <SafeAreaView style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{post.courseCode}</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleShare} style={styles.headerButton} activeOpacity={0.7}>
                        <Ionicons name="share-outline" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => {
                                const options = [
                                    { text: 'Edit Post', onPress: () => { } },
                                    { text: 'Delete Post', style: 'destructive' as const, onPress: handleDelete },
                                    { text: 'Cancel', style: 'cancel' as const },
                                ];

                                if (isMonitor) {
                                    options.splice(1, 0, { 
                                        text: post.isImportant ? 'Unmark as Important' : 'Mark as Important', 
                                        onPress: handleToggleImportance 
                                    });
                                }

                                Alert.alert('Post Options', '', options);
                            }}
                            style={styles.headerButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="ellipsis-horizontal" size={22} color={Colors.textPrimary} />
                        </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.badgeRow}>
                        <Tag label={typeLabels[post.type]} variant={getPostTypeVariant(post.type)} />
                        {post.isImportant && (
                            <View style={styles.importantBadge}>
                                <Ionicons name="alert-circle" size={12} color={Colors.white} />
                                <Text style={styles.importantBadgeText}>IMPORTANT</Text>
                            </View>
                        )}
                        {post.isCarryover && <Tag label="CARRYOVER" variant="carryover" style={{marginLeft: 8}} />}
                    </View>
                    <Text style={styles.mainTitle}>{post.title}</Text>
                    <View style={styles.authorSection}>
                        <View style={styles.authorAvatar}>
                            <Text style={styles.avatarText}>{post.authorName.charAt(0)}</Text>
                        </View>
                        <View>
                            <Text style={styles.authorName}>{post.authorName}</Text>
                            <Text style={styles.postTime}>
                                {post.authorRole.charAt(0).toUpperCase() + post.authorRole.slice(1)} · {formatRelativeTime(post.createdAt)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Cancelled Alert */}
                {isCancelled && (
                    <View style={styles.errorBanner}>
                        <Ionicons name="alert-circle" size={20} color={Colors.white} />
                        <Text style={styles.errorBannerText}>This lecture has been cancelled.</Text>
                    </View>
                )}

                {/* Content Cards */}
                <View style={styles.cardsContainer}>
                    {/* Primary Details Card */}
                    {(post.venue || post.lectureDate || post.startTime || post.dueDate) && (
                        <Card style={styles.detailCard}>
                            <Text style={styles.cardLabel}>SCHEDULE DETAILS</Text>
                            {post.venue && (
                                <View style={styles.detailItem}>
                                    <View style={[styles.iconBox, {backgroundColor: '#EBF5FF'}]}>
                                        <Ionicons name="location" size={18} color={Colors.primaryBlue} />
                                    </View>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemLabel}>Location</Text>
                                        <Text style={styles.itemValue}>{post.venue}</Text>
                                    </View>
                                </View>
                            )}
                            {(post.lectureDate || post.dueDate) && (
                                <View style={styles.detailItem}>
                                    <View style={[styles.iconBox, {backgroundColor: '#F0FDF4'}]}>
                                        <Ionicons name="calendar" size={18} color={Colors.success} />
                                    </View>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemLabel}>{post.type === 'assignment' ? 'Due Date' : 'Date'}</Text>
                                        <Text style={styles.itemValue}>
                                            {formatPostDate(new Date(post.type === 'assignment' ? post.dueDate! : post.lectureDate!))}
                                        </Text>
                                    </View>
                                </View>
                            )}
                            {post.startTime && (
                                <View style={styles.detailItem}>
                                    <View style={[styles.iconBox, {backgroundColor: '#FEF3C7'}]}>
                                        <Ionicons name="time" size={18} color={Colors.warning} />
                                    </View>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemLabel}>Time</Text>
                                        <Text style={styles.itemValue}>{post.startTime} {post.endTime ? `– ${post.endTime}` : ''}</Text>
                                    </View>
                                </View>
                            )}

                            {/* Class Alarm Row */}
                            {post.type === 'lecture' && !isCancelled && (
                                <TouchableOpacity 
                                    style={styles.alarmRow} 
                                    onPress={() => setAlarmSheetVisible(true)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.iconBox, {backgroundColor: isAlarmSet(post.id) ? Colors.accentBlue + '15' : Colors.subtleFill}]}>
                                        <Ionicons 
                                            name={isAlarmSet(post.id) ? "notifications" : "notifications-outline"} 
                                            size={18} 
                                            color={isAlarmSet(post.id) ? Colors.accentBlue : Colors.textTertiary} 
                                        />
                                    </View>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemLabel}>Class Alarm</Text>
                                        <Text style={styles.itemValue}>
                                            {isAlarmSet(post.id) ? 'Alarm Set' : 'Set Alarm'}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                                </TouchableOpacity>
                            )}

                            {post.marks != null && (
                                <View style={styles.detailItem}>
                                    <View style={[styles.iconBox, {backgroundColor: '#FDF2F2'}]}>
                                        <Ionicons name="ribbon" size={18} color={Colors.error} />
                                    </View>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemLabel}>Total Marks</Text>
                                        <Text style={styles.itemValue}>{post.marks} points</Text>
                                    </View>
                                </View>
                            )}

                            {/* Engagement Row */}
                            {isMonitor && post.isImportant && (
                                <TouchableOpacity 
                                    style={[styles.detailItem, { borderBottomWidth: 1, borderBottomColor: Colors.border + '10', paddingBottom: 16 }]} 
                                    onPress={() => setReceiptsVisible(true)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.iconBox, {backgroundColor: Colors.primaryBlue + '10'}]}>
                                        <Ionicons name="people" size={18} color={Colors.primaryBlue} />
                                    </View>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemLabel}>Read Receipts</Text>
                                        <Text style={styles.itemValue}>
                                            Seen by {post.readCount || 0} / {memberCount} members
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                                </TouchableOpacity>
                            )}

                            {/* Course Materials Row */}
                            <TouchableOpacity 
                                style={[styles.detailItem, { borderBottomWidth: 0, marginTop: 4 }]} 
                                onPress={() => router.push({
                                    pathname: '/course/[courseId]/materials',
                                    params: { 
                                        spaceId: post.spaceId, 
                                        courseId: post.courseId, 
                                        courseCode: post.courseCode 
                                    }
                                })}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBox, {backgroundColor: Colors.subtleFill}]}>
                                    <Ionicons name="document-text" size={18} color={Colors.textSecondary} />
                                </View>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemLabel}>Course Resources</Text>
                                    <Text style={styles.itemValue}>View PDF & Materials</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                            </TouchableOpacity>
                        </Card>
                    )}

                    {/* Description Card */}
                    {post.description && (
                        <Card style={styles.descriptionCard}>
                            <Text style={styles.cardLabel}>DESCRIPTION</Text>
                            <Text style={styles.descriptionText}>{post.description}</Text>
                        </Card>
                    )}

                    {/* Topics Card */}
                    {post.topics && (
                        <Card style={styles.topicsCard}>
                            <Text style={styles.cardLabel}>TEST TOPICS</Text>
                            <Text style={styles.topicsText}>{post.topics}</Text>
                        </Card>
                    )}
                </View>

                {/* Assignment Countdown */}
                {post.type === 'assignment' && post.dueDate && dueDateInfo && (
                    <View style={[styles.countdownBanner, {
                        backgroundColor: dueDateInfo.severity === 'danger' ? Colors.error :
                            dueDateInfo.severity === 'warning' ? Colors.warning : Colors.primaryBlue
                    }]}>
                        <Ionicons name="hourglass-outline" size={20} color={Colors.white} />
                        <Text style={styles.countdownBannerText}>
                            Deadline {dueDateInfo.label}
                        </Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {post.type === 'lecture' && !isCancelled && (
                <AlarmSheet 
                    visible={alarmSheetVisible}
                    onClose={() => setAlarmSheetVisible(false)}
                    post={post}
                />
            )}

            <ReadReceiptsSheet
                visible={receiptsVisible}
                onClose={() => setReceiptsVisible(false)}
                postId={postId!}
                spaceId={spaceId!}
                courseId={courseId!}
                memberCount={memberCount}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    alarmRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '15',
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingTop: Platform.OS === 'ios' ? 0 : 10,
        height: 56,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '15',
    },
    headerButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    headerActions: {
        flexDirection: 'row',
    },
    scrollContent: {
        paddingTop: Spacing.sm,
    },
    hero: {
        paddingHorizontal: Spacing.screenPadding,
        marginBottom: 24,
    },
    badgeRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    mainTitle: {
        fontSize: 28,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
        lineHeight: 34,
        marginBottom: 20,
    },
    authorSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.subtleFill,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: Colors.border + '30',
    },
    avatarText: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textSecondary,
    },
    authorName: {
        fontSize: 15,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.textPrimary,
    },
    postTime: {
        fontSize: 13,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textTertiary,
        marginTop: 1,
    },
    errorBanner: {
        backgroundColor: Colors.error,
        marginHorizontal: Spacing.screenPadding,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 8,
    },
    errorBannerText: {
        color: Colors.white,
        fontFamily: 'DMSans_700Bold',
        fontSize: 14,
    },
    cardsContainer: {
        paddingHorizontal: Spacing.screenPadding,
    },
    cardLabel: {
        fontSize: 11,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textTertiary,
        letterSpacing: 1,
        marginBottom: 16,
    },
    detailCard: {
        marginBottom: 16,
        padding: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemLabel: {
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
        color: Colors.textTertiary,
        marginBottom: 1,
    },
    itemValue: {
        fontSize: 15,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.textPrimary,
    },
    descriptionCard: {
        marginBottom: 16,
        padding: 16,
    },
    descriptionText: {
        fontSize: 16,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textPrimary,
        lineHeight: 24,
    },
    topicsCard: {
        marginBottom: 16,
        padding: 16,
    },
    topicsText: {
        fontSize: 15,
        fontFamily: 'DMSans_500Medium',
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    countdownBanner: {
        marginHorizontal: Spacing.screenPadding,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    countdownBannerText: {
        color: Colors.white,
        fontFamily: 'DMSans_700Bold',
        fontSize: 15,
    },
    importantBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.error,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 6,
        marginLeft: 8,
    },
    importantBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontFamily: 'DMSans_700Bold',
        letterSpacing: 0.5,
    },
});
