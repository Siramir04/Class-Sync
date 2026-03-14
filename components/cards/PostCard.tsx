import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import Tag, { getPostTypeVariant } from '../ui/Tag';
import { Post, PostType } from '../../types';
import { formatRelativeTime } from '../../utils/formatDate';
import { useAlarmStore } from '../../store/alarmStore';
import AlarmSheet from '../sheets/AlarmSheet';
import { useRouter } from 'expo-router';

interface PostCardProps {
    post: Post;
    isCarryover?: boolean;
    isMonitor?: boolean;
    onPress?: () => void;
    style?: any;
}

const typeIcons: Record<PostType, string> = {
    lecture: 'book-outline',
    assignment: 'document-text-outline',
    test: 'clipboard-outline',
    note: 'pin-outline',
    announcement: 'megaphone-outline',
    cancellation: 'close-circle-outline',
    attendance: 'time-outline',
};

const typeLabels: Record<PostType, string> = {
    lecture: 'Lecture',
    assignment: 'Assignment',
    test: 'Test',
    note: 'Note',
    announcement: 'Announcement',
    cancellation: 'Cancellation',
    attendance: 'Attendance',
};

export default function PostCard({ post, isCarryover = false, isMonitor = false, onPress, style }: PostCardProps) {
    const router = useRouter();
    const isCancelled = post.type === 'cancellation' || post.lectureStatus === 'cancelled';
    const { isAlarmSet } = useAlarmStore();
    const [alarmSheetVisible, setAlarmSheetVisible] = React.useState(false);

    const isAlarmEnabled = post.type === 'lecture' && !isCancelled;
    const hasAlarm = isAlarmSet(post.id);

    return (
        <>
            <TouchableOpacity
                style={[styles.card, isCancelled && styles.cancelledCard, style]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                {isCancelled && (
                    <View style={styles.cancelledStamp}>
                        <Text style={styles.cancelledStampText}>CANCELLED</Text>
                    </View>
                )}
                <View style={styles.header}>
                    <View style={styles.tagRow}>
                        <Tag label={post.courseCode} variant={getPostTypeVariant(post.type)} />
                        {isCarryover && <Tag label="Carryover" variant="carryover" style={styles.tagMargin} />}
                    </View>
                    <View style={styles.headerRight}>
                        {post.isImportant && (
                            <View style={styles.importantBadge}>
                                <Ionicons name="alert-circle" size={10} color={Colors.white} />
                                <Text style={styles.importantText}>IMPORTANT</Text>
                            </View>
                        )}
                        <Text style={styles.time}>{formatRelativeTime(post.createdAt)}</Text>
                        {isMonitor && (
                            <TouchableOpacity 
                                onPress={(e) => {
                                    e.stopPropagation();
                                    // In a real app, this would open an ActionSheet or Menu
                                    if (post.type === 'lecture' && !isCancelled) {
                                        router.push({
                                            pathname: '/attendance/new',
                                            params: { 
                                                spaceId: post.spaceId, 
                                                courseId: post.courseId,
                                                courseCode: post.courseCode,
                                                lectureId: post.id 
                                            }
                                        });
                                    }
                                }}
                                style={styles.menuButton}
                            >
                                <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textTertiary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={styles.titleRow}>
                    <Ionicons
                        name={typeIcons[post.type] as keyof typeof Ionicons.glyphMap}
                        size={18}
                        color={Colors.textSecondary}
                        style={styles.icon}
                    />
                    <Text style={styles.title} numberOfLines={1}>{post.title}</Text>
                </View>

                {post.description ? (
                    <Text style={styles.description} numberOfLines={2}>
                        {post.description}
                    </Text>
                ) : null}

                <View style={styles.footer}>
                    <View style={styles.footerLeft}>
                        <Text style={styles.author} numberOfLines={1}>
                            {post.authorName}
                        </Text>
                        <Tag label={post.authorRole === 'monitor' ? 'Monitor' : post.authorRole === 'lecturer' ? 'Lecturer' : post.authorRole} variant="role" />
                    </View>
                    
                    <View style={styles.footerRight}>
                        {post.readCount !== undefined && post.readCount > 0 && (
                            <View style={styles.readCountContainer}>
                                <Ionicons name="eye-outline" size={14} color={Colors.textTertiary} />
                                <Text style={styles.readCountText}>{post.readCount}</Text>
                            </View>
                        )}
                        {isAlarmEnabled && (
                            <TouchableOpacity 
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setAlarmSheetVisible(true);
                                }}
                                style={styles.alarmButton}
                                activeOpacity={0.6}
                            >
                                <Ionicons 
                                    name={hasAlarm ? "notifications" : "notifications-outline"} 
                                    size={18} 
                                    color={hasAlarm ? Colors.accentBlue : Colors.textTertiary} 
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>

            {isAlarmEnabled && (
                <AlarmSheet 
                    visible={alarmSheetVisible}
                    onClose={() => setAlarmSheetVisible(false)}
                    post={post}
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        borderRadius: Spacing.cardRadius,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    cancelledCard: {
        opacity: 0.85,
    },
    cancelledStamp: {
        position: 'absolute',
        top: 20,
        right: -30,
        backgroundColor: Colors.error,
        paddingHorizontal: 40,
        paddingVertical: 4,
        transform: [{ rotate: '35deg' }],
        zIndex: 10,
    },
    cancelledStampText: {
        color: Colors.white,
        fontWeight: '800',
        fontSize: 10,
        letterSpacing: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    menuButton: {
        padding: 4,
        marginRight: -4,
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagMargin: {
        marginLeft: Spacing.xs,
    },
    time: {
        ...Typography.label,
        color: Colors.textSecondary,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    icon: {
        marginRight: Spacing.sm,
    },
    title: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
        flex: 1,
    },
    description: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    footerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    author: {
        ...Typography.label,
        color: Colors.textSecondary,
        maxWidth: '60%',
    },
    footerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    importantBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.error,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 2,
    },
    importantText: {
        color: Colors.white,
        fontSize: 8,
        fontFamily: 'DMSans_700Bold',
        letterSpacing: 0.5,
    },
    readCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readCountText: {
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
        color: Colors.textTertiary,
    },
    alarmButton: {
        padding: 4,
    },
});
