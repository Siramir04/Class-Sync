import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, Animated } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Tag, TagType } from '../ui/Tag';
import { Post } from '../../types';
import { formatRelativeTime } from '../../utils/formatDate';
import { useAlarmStore } from '../../store/alarmStore';
import AlarmSheet from '../sheets/AlarmSheet';

interface PostCardProps {
  post: Post;
  isCarryover?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * Material 3 (M3) Post Card
 * Uses Tonal Surface elevations and large rounded corners.
 * Features smooth spring-scale interaction.
 */
export default function PostCard({
  post,
  isCarryover = false,
  onPress,
  style,
}: PostCardProps) {
  const [alarmSheetVisible, setAlarmSheetVisible] = useState(false);
  const { isAlarmSet } = useAlarmStore();
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const hasAlarm = isAlarmSet(post.id);
  const isCancelled = post.lectureStatus === 'cancelled' || post.type === 'cancellation';
  const isLecture = post.type === 'lecture';
  const isTask = post.type === 'assignment' || post.type === 'test';

  const getDueStatus = () => {
    if (!post.dueDate) return null;
    const now = new Date();
    const due = new Date(post.dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Overdue', container: Colors.errorContainer, text: Colors.onErrorContainer };
    if (diffDays <= 1) return { label: 'Due Tomorrow', container: Colors.errorContainer, text: Colors.onErrorContainer };
    if (diffDays <= 4) return { label: `Due in ${diffDays}d`, container: Colors.secondaryContainer, text: Colors.onSecondaryContainer };
    return { label: `Due in ${diffDays}d`, container: Colors.secondaryContainer, text: Colors.onSecondaryContainer };
  };

  const dueStatus = getDueStatus();

  return (
    <>
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.container,
            isCarryover && styles.carryoverContainer
          ]}
        >
          {post.isPinned && (
            <View style={styles.pinnedBadge}>
              <LucideIcons.Pin size={12} color={Colors.primary} />
              <Text style={styles.badgeText}>Pinned</Text>
            </View>
          )}

          {post.isImportant && (
            <View style={styles.importantBadge}>
              <LucideIcons.Info size={12} color={Colors.error} />
              <Text style={[styles.badgeText, { color: Colors.error }]}>Important</Text>
            </View>
          )}

          <View style={styles.topRow}>
            <Tag label={post.type} type={post.type as TagType} />
            {isCarryover && (
              <Tag label="Carryover" type="carryover" style={{ marginLeft: 6 }} />
            )}
            <View style={{ flex: 1 }} />
            <Text style={styles.timeText}>{formatRelativeTime(post.createdAt)}</Text>
          </View>

          <Text
            style={[
              styles.title,
              isCancelled && { textDecorationLine: 'line-through', opacity: 0.5 }
            ]}
            numberOfLines={1}
          >
            {post.title}
          </Text>

          {post.description && (
            <Text style={styles.description} numberOfLines={2}>
              {post.description}
            </Text>
          )}

          <View style={styles.footer}>
            <View style={styles.authorSection}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{post.authorName.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.authorName} numberOfLines={1}>{post.authorName}</Text>
                {post.authorRole && post.authorRole !== 'student' && (
                  <Text style={[styles.roleText, { color: Colors.primary }]}>
                    {post.authorRole.replace('_', ' ').toUpperCase()}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.actionSection}>
              {isLecture && !isCancelled && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setAlarmSheetVisible(true);
                  }}
                  style={[
                    styles.alarmButton,
                    hasAlarm ? { backgroundColor: Colors.primary } : { backgroundColor: Colors.surfaceElevation3 }
                  ]}
                >
                  <LucideIcons.Bell
                    size={14}
                    color={hasAlarm ? Colors.onPrimary : Colors.onSurfaceVariant}
                    fill={hasAlarm ? Colors.onPrimary : 'transparent'}
                  />
                  <Text style={[styles.alarmText, { color: hasAlarm ? Colors.onPrimary : Colors.onSurfaceVariant }]}>
                    {hasAlarm ? 'Alarm' : 'Notify'}
                  </Text>
                </Pressable>
              )}

              {isTask && dueStatus && (
                <View style={[styles.duePill, { backgroundColor: dueStatus.container }]}>
                  <Text style={[styles.duePillText, { color: dueStatus.text }]}>
                    {dueStatus.label}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>

      {isLecture && (
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
  container: {
    backgroundColor: Colors.surfaceElevation1,
    borderRadius: 24, // M3 Large Corner
    padding: 16,
    overflow: 'hidden',
  },
  carryoverContainer: {
    backgroundColor: Colors.tertiaryContainer,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  importantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  badgeText: {
    ...Typography.m3.labelSmall,
    color: Colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeText: {
    ...Typography.m3.labelSmall,
    color: Colors.onSurfaceVariant,
    opacity: 0.8,
  },
  title: {
    ...Typography.m3.titleMedium,
    color: Colors.onSurface,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    ...Typography.m3.bodySmall,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.onSecondaryContainer,
  },
  authorName: {
    ...Typography.m3.labelLarge,
    color: Colors.onSurface,
    fontSize: 13,
  },
  roleText: {
    ...Typography.m3.labelSmall,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionSection: {
    marginLeft: 8,
  },
  alarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100, // Stadium
  },
  alarmText: {
    ...Typography.m3.labelSmall,
    fontWeight: '700',
  },
  duePill: {
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  duePillText: {
    ...Typography.m3.labelSmall,
    fontWeight: '800',
  },
});
