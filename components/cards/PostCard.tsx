import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, Animated } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';
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
export default React.memo(function PostCard({
  post,
  isCarryover = false,
  onPress,
  style,
}: PostCardProps) {
  const { colors: Colors } = useTheme();
  const themedStyles = styles(Colors);
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
            themedStyles.container,
            isCarryover && themedStyles.carryoverContainer
          ]}
        >
          {post.isPinned && (
            <View style={themedStyles.pinnedBadge}>
              <LucideIcons.Pin size={12} color={Colors.primary} />
              <Text style={themedStyles.badgeText}>Pinned</Text>
            </View>
          )}

          {post.isImportant && (
            <View style={themedStyles.importantBadge}>
              <LucideIcons.Info size={12} color={Colors.error} />
              <Text style={[themedStyles.badgeText, { color: Colors.error }]}>Important</Text>
            </View>
          )}

          <View style={themedStyles.topRow}>
            <Tag label={post.type} type={post.type as TagType} />
            {isCarryover && (
              <Tag label="Carryover" type="carryover" style={{ marginLeft: 6 }} />
            )}
            <View style={{ flex: 1 }} />
            <Text style={themedStyles.timeText}>{formatRelativeTime(post.createdAt)}</Text>
          </View>

          <Text
            style={[
              themedStyles.title,
              isCancelled && { textDecorationLine: 'line-through', opacity: 0.5 }
            ]}
            numberOfLines={1}
          >
            {post.title}
          </Text>

          {post.description && (
            <Text style={themedStyles.description} numberOfLines={2}>
              {post.description}
            </Text>
          )}

          <View style={themedStyles.footer}>
            <View style={themedStyles.authorSection}>
              <View style={themedStyles.avatarPlaceholder}>
                <Text style={themedStyles.avatarText}>{post.authorName.charAt(0)}</Text>
              </View>
              <View>
                <Text style={themedStyles.authorName} numberOfLines={1}>{post.authorName}</Text>
                {post.authorRole && post.authorRole !== 'student' && (
                  <Text style={[themedStyles.roleText, { color: Colors.primary }]}>
                    {post.authorRole.replace('_', ' ').toUpperCase()}
                  </Text>
                )}
              </View>
            </View>

            <View style={themedStyles.actionSection}>
              {isLecture && !isCancelled && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setAlarmSheetVisible(true);
                  }}
                  style={[
                    themedStyles.alarmButton,
                    hasAlarm ? { backgroundColor: Colors.primary } : { backgroundColor: Colors.surfaceVariant }
                  ]}
                >
                  <LucideIcons.Bell
                    size={14}
                    color={hasAlarm ? Colors.onPrimary : Colors.onSurfaceVariant}
                    fill={hasAlarm ? Colors.onPrimary : 'transparent'}
                  />
                  <Text style={[themedStyles.alarmText, { color: hasAlarm ? Colors.onPrimary : Colors.onSurfaceVariant }]}>
                    {hasAlarm ? 'Alarm' : 'Notify'}
                  </Text>
                </Pressable>
              )}

              {isTask && dueStatus && (
                <View style={[themedStyles.duePill, { backgroundColor: dueStatus.container }]}>
                  <Text style={[themedStyles.duePillText, { color: dueStatus.text }]}>
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
});

const styles = (Colors: any) => StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
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
    color: Colors.accentSecondary,
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
    color: Colors.textSecondary,
    opacity: 0.8,
  },
  title: {
    ...Typography.m3.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    ...Typography.m3.labelSmall, // Changed from bodySmall
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
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
    color: Colors.textPrimary,
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
    borderRadius: 8,
  },
  alarmText: {
    ...Typography.m3.labelSmall,
    fontWeight: '700',
  },
  duePill: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  duePillText: {
    ...Typography.m3.labelSmall,
    fontWeight: '800',
  },
});
