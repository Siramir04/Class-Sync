import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Share,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { getPostById, deletePost, markPostAsRead, updatePostImportantStatus } from '../../services/postService';
import Tag, { getPostTypeVariant } from '../../components/ui/Tag';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { ErrorState } from '../../components/feedback/ErrorState';
import { logger } from '../../utils/logger';
import { Post, PostType } from '../../types';
import { formatPostDate, formatRelativeTime } from '../../utils/formatDate';
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
    const insets = useSafeAreaInsets();
    const { colors: Colors, typography: Typography } = useTheme();
    const { user } = useAuthStore();

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
        setError(null);
        try {
            const data = await getPostById(spaceId!, courseId!, postId!);
            setPost(data);

            if (data?.isImportant && user && data.authorUid !== user.uid) {
                await markPostAsRead(spaceId!, courseId!, postId!, user.uid, user.fullName);
            }
        } catch (err) {
            logger.error('Error loading post:', err);
            setError('Failed to load post details');
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
        } catch (err) {
            logger.error('Failed to update importance:', err);
            Alert.alert('Error', 'Failed to update post status');
        }
    };

    const handleDelete = () => {
        Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deletePost(spaceId!, courseId!, postId!);
                        router.back();
                    } catch (err) {
                        logger.error('Failed to delete post:', err);
                        Alert.alert('Error', 'Failed to delete post');
                    }
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
        } catch (err) {
            logger.error('Failed to share post:', err);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState message={error} onRetry={loadPost} />;
    if (!post) return null;

    const isCancelled = post.type === 'cancellation' || post.lectureStatus === 'cancelled';

    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: Colors.background, borderBottomColor: Colors.separator }]}>
           <Pressable onPress={() => router.back()} style={styles.headerButton}>
             <LucideIcons.ChevronLeft size={24} color={Colors.onSurface} />
           </Pressable>

           <View style={styles.headerTitleContainer}>
             <Text style={[styles.headerTitle, { color: Colors.onSurface, fontFamily: Typography.family.extraBold }]}>{post.courseCode}</Text>
             <Text style={[styles.headerSubtitle, { color: Colors.textTertiary, fontFamily: Typography.family.semiBold }]}>{typeLabels[post.type]}</Text>
           </View>

           <View style={styles.headerActions}>
             <Pressable onPress={handleShare} style={[styles.iconCircle, { backgroundColor: Colors.surface }]}>
               <LucideIcons.Share size={18} color={Colors.onSurface} />
             </Pressable>
             <Pressable 
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
               style={[styles.iconCircle, { backgroundColor: Colors.surface }]}
             >
               <LucideIcons.MoreHorizontal size={18} color={Colors.onSurface} />
             </Pressable>
           </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
          <View style={styles.hero}>
             <View style={styles.badgeRow}>
                <Tag label={typeLabels[post.type]} variant={getPostTypeVariant(post.type)} />
                {post.isImportant && (
                  <View style={[styles.importantBadge, { backgroundColor: Colors.error }]}>
                    <LucideIcons.AlertCircle size={10} color="white" />
                    <Text style={[styles.importantBadgeText, { fontFamily: Typography.family.extraBold }]}>IMPORTANT</Text>
                  </View>
                )}
             </View>
             <Text style={[styles.mainTitle, { color: Colors.onSurface, fontFamily: Typography.family.extraBold }]}>{post.title}</Text>
             
             <View style={styles.authorRow}>
                <View style={[styles.authorAvatar, { backgroundColor: Colors.surface, borderColor: Colors.separatorOpaque }]}>
                  <Text style={[styles.avatarText, { color: Colors.textSecondary, fontFamily: Typography.family.bold }]}>{post.authorName.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={[styles.authorName, { color: Colors.onSurface, fontFamily: Typography.family.semiBold }]}>{post.authorName}</Text>
                  <Text style={[styles.postMeta, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>
                    {post.authorRole.charAt(0).toUpperCase() + post.authorRole.slice(1)} · {formatRelativeTime(post.createdAt)}
                  </Text>
                </View>
             </View>
          </View>

          {isCancelled && (
            <View style={[styles.cancelledBanner, { backgroundColor: Colors.error }]}>
               <LucideIcons.AlertTriangle size={18} color="white" />
               <Text style={[styles.cancelledText, { fontFamily: Typography.family.bold }]}>This lecture has been cancelled.</Text>
            </View>
          )}

          <View style={styles.content}>
             {(post.venue || post.lectureDate || post.startTime || post.dueDate) && (
               <View style={styles.infoGrid}>
                 <Text style={[styles.sectionLabel, { color: Colors.textTertiary, fontFamily: Typography.family.semiBold }]}>Schedule & Details</Text>
                 <View style={[styles.detailsGroup, { backgroundColor: Colors.isDark ? 'rgba(255,255,255,0.05)' : '#F9F9FB' }]}>
                    {post.venue && (
                      <View style={styles.detailItem}>
                        <View style={[styles.detailIcon, { backgroundColor: Colors.isDark ? 'rgba(0,122,255,0.2)' : '#EFF6FF' }]}>
                          <LucideIcons.MapPin size={16} color={Colors.accentBlue} />
                        </View>
                        <View>
                          <Text style={[styles.detailLabel, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>Location</Text>
                          <Text style={[styles.detailValue, { color: Colors.onSurface, fontFamily: Typography.family.bold }]}>{post.venue}</Text>
                        </View>
                      </View>
                    )}
                    {(post.lectureDate || post.dueDate) && (
                      <View style={styles.detailItem}>
                        <View style={[styles.detailIcon, { backgroundColor: Colors.isDark ? 'rgba(52,199,89,0.2)' : '#F0FDF4' }]}>
                          <LucideIcons.Calendar size={16} color={Colors.success} />
                        </View>
                        <View>
                          <Text style={[styles.detailLabel, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>{post.type === 'assignment' ? 'Due Date' : 'Date'}</Text>
                          <Text style={[styles.detailValue, { color: Colors.onSurface, fontFamily: Typography.family.bold }]}>
                            {formatPostDate(new Date(post.type === 'assignment' ? post.dueDate! : post.lectureDate!))}
                          </Text>
                        </View>
                      </View>
                    )}
                    {post.startTime && (
                      <View style={styles.detailItem}>
                        <View style={[styles.detailIcon, { backgroundColor: Colors.isDark ? 'rgba(255,204,0,0.2)' : '#FEF3C7' }]}>
                          <LucideIcons.Clock size={16} color={Colors.warning} />
                        </View>
                        <View>
                          <Text style={[styles.detailLabel, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>Time</Text>
                          <Text style={[styles.detailValue, { color: Colors.onSurface, fontFamily: Typography.family.bold }]}>{post.startTime} {post.endTime ? `– ${post.endTime}` : ''}</Text>
                        </View>
                      </View>
                    )}
                 </View>
               </View>
             )}

             {post.type === 'lecture' && !isCancelled && (
               <Pressable 
                 onPress={() => setAlarmSheetVisible(true)}
                 style={[styles.actionRow, { borderBottomColor: Colors.separator }]}
               >
                 <View style={[styles.detailIcon, { backgroundColor: isAlarmSet(post.id) ? 'rgba(0,122,255,0.1)' : Colors.surface }]}>
                    <LucideIcons.Bell size={16} color={isAlarmSet(post.id) ? Colors.accentBlue : Colors.textTertiary} />
                 </View>
                 <Text style={[styles.actionLabel, { color: Colors.onSurface, fontFamily: Typography.family.semiBold }]}>Lecture Alarm</Text>
                 <Text style={[styles.actionValue, { color: Colors.textTertiary, fontFamily: Typography.family.regular }, isAlarmSet(post.id) && { color: Colors.accentBlue }]}>
                   {isAlarmSet(post.id) ? 'Active' : 'Set alarm'}
                 </Text>
                 <LucideIcons.ChevronRight size={16} color={Colors.separatorOpaque} />
               </Pressable>
             )}

             {isMonitor && post.isImportant && (
               <Pressable onPress={() => setReceiptsVisible(true)} style={[styles.actionRow, { borderBottomColor: Colors.separator }]}>
                 <View style={[styles.detailIcon, { backgroundColor: Colors.isDark ? 'rgba(0,122,255,0.2)' : '#EFF6FF' }]}>
                    <LucideIcons.Users size={16} color={Colors.accentBlue} />
                 </View>
                 <Text style={[styles.actionLabel, { color: Colors.onSurface, fontFamily: Typography.family.semiBold }]}>Read Receipts</Text>
                 <Text style={[styles.actionValue, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>{post.readCount || 0}/{memberCount}</Text>
                 <LucideIcons.ChevronRight size={16} color={Colors.separatorOpaque} />
               </Pressable>
             )}

             {post.description && (
               <View style={styles.descriptionBlock}>
                 <Text style={[styles.sectionLabel, { color: Colors.textTertiary, fontFamily: Typography.family.semiBold }]}>Description</Text>
                 <Text style={[styles.descriptionText, { color: Colors.textPrimary, fontFamily: Typography.family.regular }]}>{post.description}</Text>
               </View>
             )}

             {post.topics && (
               <View style={styles.descriptionBlock}>
                 <Text style={[styles.sectionLabel, { color: Colors.textTertiary, fontFamily: Typography.family.semiBold }]}>Test Topics</Text>
                 <Text style={[styles.topicsText, { color: Colors.textSecondary, fontFamily: Typography.family.medium }]}>{post.topics}</Text>
               </View>
             )}
          </View>
        </ScrollView>

        <AlarmSheet 
          visible={alarmSheetVisible}
          onClose={() => setAlarmSheetVisible(false)}
          post={post}
        />

        <ReadReceiptsSheet
          visible={receiptsVisible}
          onClose={() => setReceiptsVisible(false)}
          postId={postId!}
          spaceId={spaceId!}
          courseId={courseId!}
          memberCount={memberCount}
        />
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  headerButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 32,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  importantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  importantBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '800',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
  },
  postMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 22,
    borderRadius: 12,
    gap: 10,
    marginBottom: 24,
  },
  cancelledText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 22,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  detailsGroup: {
    borderRadius: 20,
    padding: 16,
    gap: 16,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 11,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  actionValue: {
    fontSize: 14,
    marginRight: 4,
  },
  descriptionBlock: {
    marginTop: 24,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  topicsText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
