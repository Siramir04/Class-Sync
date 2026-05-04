import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  FlatList,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { useCourses } from '../../hooks/useCourses';
import { getPostsBySpace, createPost } from '../../services/postService';
import { getSpaceById, subscribeToSpaceMembers } from '../../services/spaceService';
import { useSpaceRole } from '../../hooks/useSpaceRole';
import { Avatar } from '../../components/ui/Avatar';
import PostCard from '../../components/cards/PostCard';
import PostTypeSheet from '../../components/sheets/PostTypeSheet';
import CreatePostSheet, { CreatePostData } from '../../components/sheets/CreatePostSheet';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { ErrorState } from '../../components/feedback/ErrorState';
import { logger } from '../../utils/logger';
import { Post, PostType, Space, CourseMember } from '../../types';

const postTypeFilters = ['All', 'Lectures', 'Assignments', 'Tests', 'Notes'] as const;
const postTypeMap: Record<string, PostType | undefined> = {
    All: undefined,
    Lectures: 'lecture',
    Assignments: 'assignment',
    Tests: 'test',
    Notes: 'note',
};

export default function SpaceFeedScreen() {
    const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors: Colors, typography: Typography } = useTheme();
    const { user } = useAuthStore();
    const { courses } = useCourses(spaceId || null);

    const [space, setSpace] = useState<Space | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [members, setMembers] = useState<CourseMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCourseId, setActiveCourseId] = useState<string>('All');
    const [activeTypeFilter, setActiveTypeFilter] = useState<string>('All');
    const [showPostTypeSheet, setShowPostTypeSheet] = useState(false);
    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [selectedPostType, setSelectedPostType] = useState<PostType>('lecture');
    const [createLoading, setCreateLoading] = useState(false);

    const { 
        role, 
        isMonitor, 
    } = useSpaceRole(spaceId!);
    const canPost = !!role;

    useEffect(() => {
        if (!spaceId) return;
        loadData();
        const unsubMembers = subscribeToSpaceMembers(spaceId, setMembers);
        return () => unsubMembers();
    }, [spaceId]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [spaceData, postsData] = await Promise.all([
                getSpaceById(spaceId!),
                getPostsBySpace(spaceId!),
            ]);
            setSpace(spaceData);
            setPosts(postsData);
        } catch (err) {
            logger.error('Error loading space:', err);
            setError('Failed to load space data');
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            const courseMatch = activeCourseId === 'All' || post.courseId === activeCourseId;
            const typeMatch = activeTypeFilter === 'All' || post.type === postTypeMap[activeTypeFilter];
            return courseMatch && typeMatch;
        });
    }, [posts, activeCourseId, activeTypeFilter]);

    const handleCreatePost = async (data: CreatePostData) => {
        if (!spaceId || !user) return;
        const selectedCourse = activeCourseId !== 'All' 
            ? courses.find(c => c.id === activeCourseId) 
            : courses[0];

        if (!selectedCourse) return;

        setCreateLoading(true);
        try {
            await createPost(spaceId, selectedCourse.id, {
                spaceId,
                courseId: selectedCourse.id,
                courseCode: selectedCourse.courseCode,
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
            loadData();
        } catch (err) {
            logger.error('Error creating post:', err);
        } finally {
            setCreateLoading(false);
        }
    };

    const renderPost = useCallback(({ item }: { item: Post }) => (
        <PostCard 
            post={item} 
            onPress={() => router.push(`/post/${item.id}?spaceId=${spaceId}`)}
            style={{ marginBottom: 10 }}
        />
    ), [router, spaceId]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState message={error} onRetry={loadData} />;

    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header Section */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
           <Pressable onPress={() => router.back()} style={styles.backButton}>
             <LucideIcons.ChevronLeft size={24} color={Colors.onSurface} />
           </Pressable>

           <View style={styles.titleContainer}>
             <Text style={[styles.spaceName, { color: Colors.onSurface, fontFamily: Typography.family.extraBold }]}>{activeCourseId !== 'All' ? courses.find(c => c.id === activeCourseId)?.courseCode : space?.spaceCode}</Text>
             <Text style={[styles.spaceSubtitle, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]} numberOfLines={1}>
               {activeCourseId !== 'All' ? courses.find(c => c.id === activeCourseId)?.courseName : space?.name}
             </Text>
           </View>

           <View style={styles.headerActions}>
             <Pressable style={[styles.iconCircle, { backgroundColor: Colors.surface, borderColor: Colors.separatorOpaque }]}>
               <LucideIcons.Cloud size={18} color={Colors.onSurface} />
             </Pressable>
             <Pressable 
               onPress={() => router.push(`/space/manage?spaceId=${spaceId}`)}
               style={[styles.iconCircle, { backgroundColor: Colors.surface, borderColor: Colors.separatorOpaque }]}
             >
               <LucideIcons.Info size={18} color={Colors.onSurface} />
             </Pressable>
           </View>
        </View>

        {/* Course Filters */}
        <View style={[styles.courseFilters, { borderBottomColor: Colors.separator }]}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
              <Pressable 
                onPress={() => setActiveCourseId('All')}
                style={[styles.coursePill, { backgroundColor: Colors.surface, borderColor: Colors.separatorOpaque }, activeCourseId === 'All' && [styles.coursePillActive, { backgroundColor: Colors.accentBlue, borderColor: Colors.accentBlue }]]}
              >
                <Text style={[styles.coursePillText, { color: Colors.textSecondary, fontFamily: Typography.family.bold }, activeCourseId === 'All' && { color: Colors.white }]}>General</Text>
              </Pressable>
              {courses.map(course => (
                 <Pressable 
                   key={course.id}
                   onPress={() => setActiveCourseId(course.id)}
                   style={[styles.coursePill, { backgroundColor: Colors.surface, borderColor: Colors.separatorOpaque }, activeCourseId === course.id && [styles.coursePillActive, { backgroundColor: Colors.accentBlue, borderColor: Colors.accentBlue }]]}
                 >
                   <Text style={[styles.coursePillText, { color: Colors.textSecondary, fontFamily: Typography.family.bold }, activeCourseId === course.id && { color: Colors.white }]}>{course.courseCode}</Text>
                 </Pressable>
              ))}
           </ScrollView>
        </View>

        {/* Member Strip */}
        <View style={[styles.memberStrip, { backgroundColor: Colors.background, borderBottomColor: Colors.separator }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memberStripContent}>
            {members.map((member, idx) => (
              <View key={member.uid || idx} style={styles.memberAvatar}>
                <Avatar 
                  firstName={member.fullName?.split(' ')[0] || '?'} 
                  lastName={member.fullName?.split(' ')[1] || ''} 
                  size="sm" 
                />
                <Text style={[styles.memberName, { color: Colors.textTertiary, fontFamily: Typography.family.semiBold }]} numberOfLines={1}>
                  {member.fullName?.split(' ')[0]}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Type Filters */}
        <View style={[styles.typeFilters, { backgroundColor: Colors.surface, borderBottomColor: Colors.separator }]}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
             {postTypeFilters.map(filter => (
               <Pressable 
                 key={filter} 
                 onPress={() => setActiveTypeFilter(filter)}
                 style={[styles.typePill, activeTypeFilter === filter && [styles.typePillActive, { backgroundColor: Colors.isDark ? 'rgba(255,255,255,0.1)' : '#EFF6FF' }]]}
               >
                 <Text style={[styles.typePillText, { color: Colors.textTertiary, fontFamily: Typography.family.medium }, activeTypeFilter === filter && { color: Colors.accentBlue, fontWeight: '700' }]}>{filter}</Text>
               </Pressable>
             ))}
           </ScrollView>
        </View>

        {/* Post Feed */}
        <FlatList 
          data={filteredPosts}
          keyExtractor={item => item.id}
          contentContainerStyle={{ 
            paddingHorizontal: 16, 
            paddingTop: 10,
            paddingBottom: 120 // Space for tab bar and FAB
          }}
          renderItem={renderPost}
          ListEmptyComponent={
            <View style={styles.emptyFeed}>
              <LucideIcons.Newspaper size={40} color={Colors.textTertiary} opacity={0.2} />
              <Text style={[styles.emptyFeedText, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>No updates found for this filter.</Text>
            </View>
          }
        />

        {/* Create FAB */}
        {canPost && (
          <Pressable 
            onPress={() => setShowPostTypeSheet(true)}
            style={({ pressed }) => [
              styles.fab,
              { backgroundColor: Colors.accentBlue },
              pressed && { transform: [{ scale: 0.92 }], opacity: 0.9 },
              Platform.select({
                ios: {
                  shadowColor: Colors.accentBlue,
                }
              })
            ]}
          >
            <LucideIcons.Plus size={28} color="white" />
          </Pressable>
        )}

        <PostTypeSheet
            visible={showPostTypeSheet}
            onClose={() => setShowPostTypeSheet(false)}
            onSelect={(type) => {
                if (type === 'attendance') {
                    const course = activeCourseId !== 'All'
                        ? courses.find(c => c.id === activeCourseId)
                        : courses[0];

                    if (course) {
                        router.push(`/attendance/session/new?courseId=${course.id}&spaceId=${spaceId}&courseCode=${course.courseCode}&courseName=${encodeURIComponent(course.courseName)}`);
                    }
                } else {
                    setSelectedPostType(type);
                    setShowCreateSheet(true);
                }
            }}
            isStudent={role === 'student'}
        />

        <CreatePostSheet
            visible={showCreateSheet}
            onClose={() => setShowCreateSheet(false)}
            postType={selectedPostType}
            courseCode={activeCourseId !== 'All' ? courses.find(c => c.id === activeCourseId)?.courseCode || '' : courses[0]?.courseCode || ''}
            onSubmit={handleCreatePost}
            loading={createLoading}
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
    marginBottom: 10,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  spaceName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  spaceSubtitle: {
    fontSize: 11,
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
    borderWidth: 1,
  },
  courseFilters: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  coursePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  coursePillActive: {},
  coursePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  coursePillTextActive: {},
  memberStrip: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  memberStripContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  memberAvatar: {
    alignItems: 'center',
    width: 44,
  },
  memberName: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  typeFilters: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  typePillActive: {},
  typePillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  typePillTextActive: {},
  emptyFeed: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyFeedText: {
    fontSize: 13,
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      }
    })
  },
});
