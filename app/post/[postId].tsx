import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Alert,
  Platform,
  Share,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
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
    const insets = useSafeAreaInsets();
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

    if (loading) return <LoadingSpinner fullScreen />;
    if (!post) return null;

    const isCancelled = post.type === 'cancellation' || post.lectureStatus === 'cancelled';
    const dueDateInfo = post.dueDate ? countdownLabel(new Date(post.dueDate)) : null;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
           <Pressable onPress={() => router.back()} style={styles.headerButton}>
             <LucideIcons.ChevronLeft size={24} color="#000" />
           </Pressable>

           <View style={styles.headerTitleContainer}>
             <Text style={styles.headerTitle}>{post.courseCode}</Text>
             <Text style={styles.headerSubtitle}>{typeLabels[post.type]}</Text>
           </View>

           <View style={styles.headerActions}>
             <Pressable onPress={handleShare} style={styles.iconCircle}>
               <LucideIcons.Share size={18} color="#000" />
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
               style={styles.iconCircle}
             >
               <LucideIcons.MoreHorizontal size={18} color="#000" />
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
                  <View style={styles.importantBadge}>
                    <LucideIcons.AlertCircle size={10} color="white" />
                    <Text style={styles.importantBadgeText}>IMPORTANT</Text>
                  </View>
                )}
             </View>
             <Text style={styles.mainTitle}>{post.title}</Text>
             
             <View style={styles.authorRow}>
                <View style={styles.authorAvatar}>
                  <Text style={styles.avatarText}>{post.authorName.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.authorName}>{post.authorName}</Text>
                  <Text style={styles.postMeta}>
                    {post.authorRole.charAt(0).toUpperCase() + post.authorRole.slice(1)} · {formatRelativeTime(post.createdAt)}
                  </Text>
                </View>
             </View>
          </View>

          {isCancelled && (
            <View style={styles.cancelledBanner}>
               <LucideIcons.AlertTriangle size={18} color="white" />
               <Text style={styles.cancelledText}>This lecture has been cancelled.</Text>
            </View>
          )}

          <View style={styles.content}>
             {(post.venue || post.lectureDate || post.startTime || post.dueDate) && (
               <View style={styles.infoGrid}>
                 <Text style={styles.sectionLabel}>Schedule & Details</Text>
                 <View style={styles.detailsGroup}>
                    {post.venue && (
                      <View style={styles.detailItem}>
                        <View style={[styles.detailIcon, { backgroundColor: '#EFF6FF' }]}>
                          <LucideIcons.MapPin size={16} color={Colors.accentBlue} />
                        </View>
                        <View>
                          <Text style={styles.detailLabel}>Location</Text>
                          <Text style={styles.detailValue}>{post.venue}</Text>
                        </View>
                      </View>
                    )}
                    {(post.lectureDate || post.dueDate) && (
                      <View style={styles.detailItem}>
                        <View style={[styles.detailIcon, { backgroundColor: '#F0FDF4' }]}>
                          <LucideIcons.Calendar size={16} color={Colors.success} />
                        </View>
                        <View>
                          <Text style={styles.detailLabel}>{post.type === 'assignment' ? 'Due Date' : 'Date'}</Text>
                          <Text style={styles.detailValue}>
                            {formatPostDate(new Date(post.type === 'assignment' ? post.dueDate! : post.lectureDate!))}
                          </Text>
                        </View>
                      </View>
                    )}
                    {post.startTime && (
                      <View style={styles.detailItem}>
                        <View style={[styles.detailIcon, { backgroundColor: '#FEF3C7' }]}>
                          <LucideIcons.Clock size={16} color={Colors.warning} />
                        </View>
                        <View>
                          <Text style={styles.detailLabel}>Time</Text>
                          <Text style={styles.detailValue}>{post.startTime} {post.endTime ? `– ${post.endTime}` : ''}</Text>
                        </View>
                      </View>
                    )}
                 </View>
               </View>
             )}

             {post.type === 'lecture' && !isCancelled && (
               <Pressable 
                 onPress={() => setAlarmSheetVisible(true)}
                 style={styles.actionRow}
               >
                 <View style={[styles.detailIcon, { backgroundColor: isAlarmSet(post.id) ? 'rgba(0,122,255,0.1)' : '#F2F2F7' }]}>
                    <LucideIcons.Bell size={16} color={isAlarmSet(post.id) ? Colors.accentBlue : Colors.textTertiary} />
                 </View>
                 <Text style={styles.actionLabel}>Lecture Alarm</Text>
                 <Text style={[styles.actionValue, isAlarmSet(post.id) && { color: Colors.accentBlue }]}>
                   {isAlarmSet(post.id) ? 'Active' : 'Set alarm'}
                 </Text>
                 <LucideIcons.ChevronRight size={16} color={Colors.separatorOpaque} />
               </Pressable>
             )}

             {isMonitor && post.isImportant && (
               <Pressable onPress={() => setReceiptsVisible(true)} style={styles.actionRow}>
                 <View style={[styles.detailIcon, { backgroundColor: '#EFF6FF' }]}>
                    <LucideIcons.Users size={16} color={Colors.accentBlue} />
                 </View>
                 <Text style={styles.actionLabel}>Read Receipts</Text>
                 <Text style={styles.actionValue}>{post.readCount || 0}/{memberCount}</Text>
                 <LucideIcons.ChevronRight size={16} color={Colors.separatorOpaque} />
               </Pressable>
             )}

             {post.description && (
               <View style={styles.descriptionBlock}>
                 <Text style={styles.sectionLabel}>Description</Text>
                 <Text style={styles.descriptionText}>{post.description}</Text>
               </View>
             )}

             {post.topics && (
               <View style={styles.descriptionBlock}>
                 <Text style={styles.sectionLabel}>Test Topics</Text>
                 <Text style={styles.topicsText}>{post.topics}</Text>
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
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
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
    color: '#000',
    fontFamily: Typography.family.extraBold,
  },
  headerSubtitle: {
    fontSize: 10,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: Typography.family.semiBold,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconCircle: {
    width: 34,
    height: 34,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.error,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  importantBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Typography.family.extraBold,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000',
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 24,
    fontFamily: Typography.family.extraBold,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.separatorOpaque,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
    fontFamily: Typography.family.bold,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    fontFamily: Typography.family.semiBold,
  },
  postMeta: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 1,
    fontFamily: Typography.family.regular,
  },
  cancelledBanner: {
    backgroundColor: Colors.error,
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
    fontFamily: Typography.family.bold,
  },
  content: {
    paddingHorizontal: 22,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    fontFamily: Typography.family.semiBold,
  },
  detailsGroup: {
    backgroundColor: '#F9F9FB',
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
    color: Colors.textTertiary,
    fontFamily: Typography.family.regular,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    fontFamily: Typography.family.bold,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
    gap: 12,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    fontFamily: Typography.family.semiBold,
  },
  actionValue: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginRight: 4,
    fontFamily: Typography.family.regular,
  },
  descriptionBlock: {
    marginTop: 24,
  },
  descriptionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
    fontFamily: Typography.family.regular,
  },
  topicsText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontFamily: Typography.family.medium,
  },
});
