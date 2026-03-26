import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';
import { useCourses } from '../../hooks/useCourses';
import { getPostsBySpace, createPost } from '../../services/postService';
import { getSpaceById, subscribeToSpaceMembers } from '../../services/spaceService';
import { useSpaceRole } from '../../hooks/useSpaceRole';
import { Avatar } from '../../components/ui/Avatar';
import PostCard from '../../components/cards/PostCard';
import PostTypeSheet from '../../components/sheets/PostTypeSheet';
import CreatePostSheet, { CreatePostData } from '../../components/sheets/CreatePostSheet';
import { Post, PostType, Space, AttendanceSession, CourseMember } from '../../types';

const { width } = Dimensions.get('window');

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
    const { user } = useAuthStore();
    const { courses } = useCourses(spaceId || null);

    const [space, setSpace] = useState<Space | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [members, setMembers] = useState<CourseMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCourseId, setActiveCourseId] = useState<string>('All');
    const [activeTypeFilter, setActiveTypeFilter] = useState<string>('All');
    const [showPostTypeSheet, setShowPostTypeSheet] = useState(false);
    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [selectedPostType, setSelectedPostType] = useState<PostType>('lecture');
    const [createLoading, setCreateLoading] = useState(false);
    const [activeSessions, setActiveSessions] = useState<AttendanceSession[]>([]);

    const { 
        role, 
        isMonitor, 
        isAssistant, 
        isLecturer, 
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
        try {
            const [spaceData, postsData] = await Promise.all([
                getSpaceById(spaceId!),
                getPostsBySpace(spaceId!),
            ]);
            setSpace(spaceData);
            setPosts(postsData);
        } catch (error) {
            console.error('Error loading space:', error);
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
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setCreateLoading(false);
        }
    };

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header Section */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
           <Pressable onPress={() => router.back()} style={styles.backButton}>
             <LucideIcons.ChevronLeft size={24} color="#000" />
           </Pressable>

           <View style={styles.titleContainer}>
             <Text style={styles.spaceName}>{activeCourseId !== 'All' ? courses.find(c => c.id === activeCourseId)?.courseCode : space?.spaceCode}</Text>
             <Text style={styles.spaceSubtitle} numberOfLines={1}>
               {activeCourseId !== 'All' ? courses.find(c => c.id === activeCourseId)?.courseName : space?.name}
             </Text>
           </View>

           <View style={styles.headerActions}>
             <Pressable style={styles.iconCircle}>
               <LucideIcons.Cloud size={18} color="#000" />
             </Pressable>
             <Pressable 
               onPress={() => router.push(`/space/manage?spaceId=${spaceId}`)}
               style={styles.iconCircle}
             >
               <LucideIcons.Info size={18} color="#000" />
             </Pressable>
           </View>
        </View>

        {/* Course Filters */}
        <View style={styles.courseFilters}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
              <Pressable 
                onPress={() => setActiveCourseId('All')}
                style={[styles.coursePill, activeCourseId === 'All' && styles.coursePillActive]}
              >
                <Text style={[styles.coursePillText, activeCourseId === 'All' && styles.coursePillTextActive]}>General</Text>
              </Pressable>
              {courses.map(course => (
                 <Pressable 
                   key={course.id}
                   onPress={() => setActiveCourseId(course.id)}
                   style={[styles.coursePill, activeCourseId === course.id && styles.coursePillActive]}
                 >
                   <Text style={[styles.coursePillText, activeCourseId === course.id && styles.coursePillTextActive]}>{course.courseCode}</Text>
                 </Pressable>
              ))}
           </ScrollView>
        </View>

        {/* Member Strip */}
        <View style={styles.memberStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memberStripContent}>
            {members.map((member, idx) => (
              <View key={member.uid || idx} style={styles.memberAvatar}>
                <Avatar 
                  firstName={member.fullName?.split(' ')[0] || '?'} 
                  lastName={member.fullName?.split(' ')[1] || ''} 
                  size="sm" 
                />
                <Text style={styles.memberName} numberOfLines={1}>
                  {member.fullName?.split(' ')[0]}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Type Filters */}
        <View style={styles.typeFilters}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
             {postTypeFilters.map(filter => (
               <Pressable 
                 key={filter} 
                 onPress={() => setActiveTypeFilter(filter)}
                 style={[styles.typePill, activeTypeFilter === filter && styles.typePillActive]}
               >
                 <Text style={[styles.typePillText, activeTypeFilter === filter && styles.typePillTextActive]}>{filter}</Text>
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
          renderItem={({ item }) => (
            <PostCard 
              post={item} 
              onPress={() => router.push(`/post/${item.id}?spaceId=${spaceId}`)}
              style={{ marginBottom: 10 }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyFeed}>
              <LucideIcons.Newspaper size={40} color={Colors.textTertiary} opacity={0.2} />
              <Text style={styles.emptyFeedText}>No updates found for this filter.</Text>
            </View>
          }
        />

        {/* Create FAB */}
        {canPost && (
          <Pressable 
            onPress={() => setShowPostTypeSheet(true)}
            style={({ pressed }) => [
              styles.fab,
              pressed && { transform: [{ scale: 0.92 }], opacity: 0.9 }
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
    backgroundColor: Colors.background,
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
    color: '#000',
    letterSpacing: -0.3,
    fontFamily: Typography.family.extraBold,
  },
  spaceSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: Typography.family.regular,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconCircle: {
    width: 34,
    height: 34,
    backgroundColor: 'white',
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.separatorOpaque,
  },
  courseFilters: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  coursePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.separatorOpaque,
  },
  coursePillActive: {
    backgroundColor: Colors.accentBlue,
    borderColor: Colors.accentBlue,
  },
  coursePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    fontFamily: Typography.family.bold,
  },
  coursePillTextActive: {
    color: 'white',
  },
  memberStrip: {
    paddingVertical: 14,
    backgroundColor: Colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
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
    color: Colors.textTertiary,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: Typography.family.semiBold,
  },
  typeFilters: {
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  typePillActive: {
    backgroundColor: '#EFF6FF',
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
    fontFamily: Typography.family.medium,
  },
  typePillTextActive: {
    color: Colors.accentBlue,
    fontWeight: '700',
  },
  emptyFeed: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyFeedText: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 12,
    fontFamily: Typography.family.regular,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.accentBlue,
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
