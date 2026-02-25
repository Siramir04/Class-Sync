import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import Tag, { getPostTypeVariant } from '../ui/Tag';
import { Post, PostType } from '../../types';
import { formatRelativeTime } from '../../utils/formatDate';

interface PostCardProps {
    post: Post;
    isCarryover?: boolean;
    onPress?: () => void;
}

const typeIcons: Record<PostType, string> = {
    lecture: 'book-outline',
    assignment: 'document-text-outline',
    test: 'clipboard-outline',
    note: 'pin-outline',
    announcement: 'megaphone-outline',
    cancellation: 'close-circle-outline',
};

const typeLabels: Record<PostType, string> = {
    lecture: 'Lecture',
    assignment: 'Assignment',
    test: 'Test',
    note: 'Note',
    announcement: 'Announcement',
    cancellation: 'Cancellation',
};

export default function PostCard({ post, isCarryover = false, onPress }: PostCardProps) {
    const isCancelled = post.type === 'cancellation' || post.lectureStatus === 'cancelled';

    return (
        <TouchableOpacity
            style={[styles.card, isCancelled && styles.cancelledCard]}
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
                <Text style={styles.time}>{formatRelativeTime(post.createdAt)}</Text>
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
                <Text style={styles.author}>
                    {post.authorName}
                </Text>
                <Tag label={post.authorRole === 'monitor' ? 'Monitor' : post.authorRole === 'lecturer' ? 'Lecturer' : post.authorRole} variant="role" />
            </View>
        </TouchableOpacity>
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
    author: {
        ...Typography.label,
        color: Colors.textSecondary,
    },
});
