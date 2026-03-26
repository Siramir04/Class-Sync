import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
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

export default function PostCard({
  post,
  isCarryover = false,
  onPress,
  style,
}: PostCardProps) {
  const [alarmSheetVisible, setAlarmSheetVisible] = useState(false);
  const { isAlarmSet } = useAlarmStore();
  
  const hasAlarm = isAlarmSet(post.id);
  const isCancelled = post.lectureStatus === 'cancelled' || post.type === 'cancellation';
  const isLecture = post.type === 'lecture';
  const isTask = post.type === 'assignment' || post.type === 'test';

  const getDueStatus = () => {
    if (!post.dueDate) return null;
    const now = new Date();
    const due = new Date(post.dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Overdue', bg: Colors.error, text: 'white' };
    if (diffDays <= 1) return { label: 'Due Tomorrow', bg: Colors.errorSoft, text: Colors.error };
    if (diffDays <= 4) return { label: `Due in ${diffDays}d`, bg: Colors.warningSoft, text: Colors.warning };
    return { label: `Due in ${diffDays}d`, bg: Colors.successSoft, text: Colors.success };
  };

  const dueStatus = getDueStatus();

  return (
    <>
      <Pressable 
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          isCarryover && styles.carryoverBorder,
          style,
          pressed && { transform: [{ scale: 0.98 }] }
        ]}
      >
        {post.isPinned && (
          <View style={styles.pinnedBanner}>
            <LucideIcons.Pin size={11} color={Colors.accentBlue} />
            <Text style={styles.pinnedText}>PINNED</Text>
          </View>
        )}

        {post.isImportant && (
          <View style={styles.importantBanner}>
            <LucideIcons.Info size={11} color={Colors.error} />
            <Text style={styles.importantText}>IMPORTANT</Text>
          </View>
        )}

        {isCancelled && isLecture && (
          <View style={styles.cancelledBanner}>
            <LucideIcons.XCircle size={11} color={Colors.error} />
            <Text style={styles.cancelledLabel}>Cancelled</Text>
          </View>
        )}

        <View style={styles.topRow}>
          <Tag label={post.type} type={post.type as TagType} />
          {isCarryover && (
            <Tag label="Carryover" type="carryover" style={{ marginLeft: 5 }} />
          )}
          <View style={{ flex: 1 }} />
          <Text style={styles.timeText}>{formatRelativeTime(post.createdAt)}</Text>
        </View>

        <Text 
          style={[
            styles.title, 
            isCancelled && { textDecorationLine: 'line-through', color: Colors.textTertiary }
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

        <View style={styles.bottomRow}>
          <View style={styles.authorSection}>
            <Text style={styles.authorName} numberOfLines={1}>{post.authorName}</Text>
            {post.authorRole && post.authorRole !== 'student' && (
              <View style={[
                styles.roleBadge,
                post.authorRole === 'monitor' && { backgroundColor: '#1A3C6E' },
                post.authorRole === 'assistant_monitor' && { backgroundColor: '#64748B' },
                post.authorRole === 'lecturer' && { backgroundColor: Colors.success }
              ]}>
                <Text style={styles.roleBadgeText}>
                  {post.authorRole === 'monitor' ? 'Monitor' : 
                   post.authorRole === 'assistant_monitor' ? 'Asst. Monitor' : 
                   post.authorRole === 'lecturer' ? 'Lecturer' : ''}
                </Text>
              </View>
            )}
          </View>

          <View style={{ marginLeft: 'auto' }}>
            {isLecture && !isCancelled && (
              <Pressable 
                onPress={(e) => {
                  e.stopPropagation();
                  setAlarmSheetVisible(true);
                }}
                style={[
                  styles.alarmButton,
                  hasAlarm ? { 
                    borderColor: Colors.accentBlue, 
                    backgroundColor: Colors.accentBlueSoft 
                  } : { 
                    borderColor: Colors.separatorOpaque, 
                    backgroundColor: Colors.background 
                  }
                ]}
              >
                <LucideIcons.Bell 
                  size={11} 
                  color={hasAlarm ? Colors.accentBlue : Colors.textTertiary} 
                  fill={hasAlarm ? Colors.accentBlue : 'transparent'}
                />
                <Text style={[
                  styles.alarmText, 
                  { color: hasAlarm ? Colors.accentBlue : Colors.textTertiary }
                ]}>
                  {hasAlarm ? 'Alarm' : 'Set alarm'}
                </Text>
              </Pressable>
            )}

            {isTask && dueStatus && (
              <View style={[styles.dueBadge, { backgroundColor: dueStatus.bg }]}>
                <Text style={[styles.dueBadgeText, { color: dueStatus.text }]}>
                  {dueStatus.label}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>

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
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.separatorOpaque,
    padding: 12,
    overflow: 'hidden',
  },
  carryoverBorder: {
    borderColor: Colors.carryoverSoft,
  },
  importantBanner: {
    backgroundColor: Colors.errorSoft,
    marginHorizontal: -12,
    marginTop: -12,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  importantText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.error,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontFamily: Typography.family.bold,
  },
  pinnedBanner: {
    backgroundColor: Colors.accentBlueSoft,
    marginHorizontal: -12,
    marginTop: -12,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pinnedText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accentBlue,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontFamily: Typography.family.bold,
  },
  cancelledBanner: {
    backgroundColor: Colors.errorSoft,
    borderRadius: 7,
    paddingVertical: 4,
    paddingHorizontal: 9,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  cancelledLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.error,
    textTransform: 'uppercase',
    fontFamily: Typography.family.bold,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeText: {
    fontSize: 9,
    color: Colors.textTertiary,
    fontFamily: Typography.family.regular,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
    lineHeight: 13 * 1.3,
    fontFamily: Typography.family.bold,
  },
  description: {
    fontSize: 11,
    color: Colors.textTertiary,
    lineHeight: 11 * 1.4,
    fontFamily: Typography.family.regular,
  },
  bottomRow: {
    marginTop: 9,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  authorName: {
    fontSize: 10,
    color: Colors.textTertiary,
    maxWidth: '50%',
    fontFamily: Typography.family.regular,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 8,
    color: 'white',
    fontWeight: '700',
    fontFamily: Typography.family.bold,
    textTransform: 'uppercase',
  },
  alarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  alarmText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: Typography.family.semiBold,
  },
  dueBadge: {
    borderRadius: 7,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  dueBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: Typography.family.bold,
  },
});
