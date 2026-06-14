import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useResponsive } from '../../hooks/useResponsive';
import { useAuthStore } from '../../store/authStore';
import { useRecentPosts } from '../../hooks/usePosts';
import { useSpaces } from '../../hooks/useSpace';
import { useNotifications } from '../../hooks/useNotifications';
import { usePersonalCourseStore } from '../../store/personalCourseStore';
import { Avatar } from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import ClassCard from '../../components/cards/ClassCard';
import SpaceTile from '../../components/cards/SpaceTile';
import PostCard from '../../components/cards/PostCard';
import PersonalCourseCard from '../../components/cards/PersonalCourseCard';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { ErrorState } from '../../components/feedback/ErrorState';

const { width } = Dimensions.get('window');

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors: Colors, typography: Typography } = useTheme();
  const { isDesktop } = useResponsive();
  const isDesktopWeb = Platform.OS === 'web' && isDesktop;
  const { user } = useAuthStore();
  const { unreadCount } = useNotifications();
  const { posts: recentPosts, loading: postsLoading } = useRecentPosts(15);
  const { spaces } = useSpaces();
  const { courses: personalCourses, fetchCourses: fetchPersonalCourses } = usePersonalCourseStore();

  // Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!postsLoading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [postsLoading]);

  // Fetch personal courses when user is available
  useEffect(() => {
    if (user) fetchPersonalCourses(user.uid);
  }, [user]);

  const firstName = user?.fullName?.split(' ')[0] || 'there';

  const today = new Date();
  const todayLectures = recentPosts.filter(
    (p) =>
      p.type === 'lecture' &&
      p.lectureDate &&
      new Date(p.lectureDate).toDateString() === today.toDateString()
  );

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 64],
    extrapolate: 'clamp',
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [60, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerLargeTitleOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  if (postsLoading) return <LoadingSpinner />;

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* M3 Adaptive App Bar */}
      <Animated.View style={[styles.appBar, { height: headerHeight, paddingTop: insets.top, backgroundColor: Colors.background }]}>
          <View style={styles.appBarTop}>
              <Animated.Text style={[styles.appBarTitle, { opacity: headerTitleOpacity, color: Colors.onSurface, ...Typography.m3.titleLarge }]}>
                  ClassSync
              </Animated.Text>
              <View style={styles.appBarActions}>
                  <Pressable
                    onPress={() => router.push('/notifications')}
                    style={styles.iconButton}
                  >
                    <LucideIcons.Bell size={22} color={Colors.onSurface} />
                    {unreadCount > 0 && (
                      <View style={[styles.badge, { backgroundColor: Colors.error, borderColor: Colors.background }]} />
                    )}
                  </Pressable>
                  <Pressable onPress={() => router.push('/(tabs)/profile')}>
                    <Avatar
                      firstName={firstName}
                      lastName={user?.fullName?.split(' ')[1] || ''}
                      size="sm"
                    />
                  </Pressable>
              </View>
          </View>
          <Animated.View style={[styles.largeTitleContainer, { opacity: headerLargeTitleOpacity }]}>
              <Text style={[styles.greetingText, { color: Colors.onSurfaceVariant, ...Typography.m3.bodyLarge, fontSize: 16 }]}>{getGreeting()},</Text>
              <Text style={[styles.userNameText, { color: Colors.onSurface, ...Typography.m3.headlineMedium, fontWeight: 'bold' }]}>{firstName} 👋</Text>
          </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: 130, // Adjust for app bar
          paddingBottom: 100,
        }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
            {/* Today's Timeline */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: Colors.onSurface, ...Typography.m3.titleMedium, fontWeight: '700' }]}>Today's Timeline</Text>
                <Pressable onPress={() => router.push('/(tabs)/schedule')}>
                  <Text style={[styles.seeAll, { color: Colors.primary, ...Typography.m3.labelLarge }]}>View Full Schedule</Text>
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {todayLectures.length > 0 ? (
                  todayLectures.map((item) => (
                    <ClassCard
                      key={item.id}
                      courseCode={item.courseCode}
                      courseName={item.title}
                      startTime={item.startTime || '10:00'}
                      endTime={item.endTime || '12:00'}
                      venue={item.venue || 'TBD'}
                      isCarryover={item.isCarryover}
                      onPress={() => router.push({
                        pathname: `/post/${item.id}`,
                        params: { spaceId: item.spaceId, courseId: item.courseId }
                      })}
                    />
                  ))
                ) : (
                  <Card variant="filled" style={styles.emptyCard}>
                    <LucideIcons.Calendar size={24} color={Colors.onSurfaceVariant} style={{ marginBottom: 8 }} />
                    <Text style={[styles.emptyText, { color: Colors.onSurfaceVariant, ...Typography.m3.bodyMedium }]}>No more classes today. Relax!</Text>
                  </Card>
                )}
              </ScrollView>
            </View>

            {/* My Spaces — Grid on Desktop, Horizontal Scroll on Mobile */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: Colors.onSurface, ...Typography.m3.titleMedium, fontWeight: '700' }]}>My Academic Spaces</Text>
                <Pressable onPress={() => router.push('/(tabs)/spaces')}>
                  <LucideIcons.ArrowRight size={20} color={Colors.primary} />
                </Pressable>
              </View>

              {isDesktopWeb ? (
                <View style={styles.desktopGrid}>
                  {spaces.map((space, index) => (
                    <View key={space.id} style={styles.desktopGridItem}>
                      <SpaceTile
                        name={space.name}
                        index={index}
                        onPress={() => router.push(`/space/${space.id}`)}
                      />
                    </View>
                  ))}
                  <View style={styles.desktopGridItem}>
                    <SpaceTile
                      name="Join Space"
                      isAdd
                      onPress={() => router.push('/join')}
                    />
                  </View>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {spaces.map((space, index) => (
                    <SpaceTile
                      key={space.id}
                      name={space.name}
                      index={index}
                      onPress={() => router.push(`/space/${space.id}`)}
                    />
                  ))}
                  <SpaceTile
                    name="Join Space"
                    isAdd
                    onPress={() => router.push('/join')}
                  />
                </ScrollView>
              )}
            </View>

            {/* My Personal Courses */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: Colors.onSurface, ...Typography.m3.titleMedium, fontWeight: '700' }]}>My Personal Courses</Text>
                <Pressable onPress={() => router.push('/personal/create')}>
                  <Text style={[styles.seeAll, { color: Colors.primary, ...Typography.m3.labelLarge }]}>+ New</Text>
                </Pressable>
              </View>
              <View style={styles.noticesContainer}>
                {personalCourses.length > 0 ? (
                  personalCourses.map(course => (
                    <PersonalCourseCard key={course.id} course={course} />
                  ))
                ) : (
                  <Card variant="filled" style={styles.emptyCard}>
                    <LucideIcons.BookOpen size={24} color={Colors.onSurfaceVariant} style={{ marginBottom: 8 }} />
                    <Text style={[styles.emptyText, { color: Colors.onSurfaceVariant, ...Typography.m3.bodyMedium, textAlign: 'center' }]}>
                      No personal courses yet. Tap '+ New' to create one!
                    </Text>
                  </Card>
                )}
              </View>
            </View>


            {/* Recent Notices Feed — 2-col grid on Desktop */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: Colors.onSurface, ...Typography.m3.titleMedium, fontWeight: '700' }]}>Recent Notices</Text>
              </View>

              <View style={isDesktopWeb ? styles.noticesGrid : styles.noticesContainer}>
                {recentPosts.filter(p => p.type !== 'lecture').slice(0, 8).map((post) => (
                  <View key={post.id} style={isDesktopWeb ? styles.noticesGridItem : undefined}>
                    <PostCard
                      post={post}
                      isCarryover={post.isCarryover}
                      onPress={() => router.push({
                        pathname: `/post/${post.id}`,
                        params: { spaceId: post.spaceId, courseId: post.courseId }
                      })}
                      style={{ marginBottom: 12 }}
                    />
                  </View>
                ))}
              </View>
            </View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  appBarTop: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appBarTitle: {},
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  largeTitleContainer: {
    marginTop: 12,
  },
  greetingText: {},
  userNameText: {},
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {},
  seeAll: {},
  horizontalScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  noticesContainer: {
    paddingHorizontal: 20,
  },
  // Desktop multi-column grid for spaces
  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  desktopGridItem: {
    width: '31%',
    minWidth: 160,
  },
  // Desktop 2-column grid for notices
  noticesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  noticesGridItem: {
    width: '48.5%',
    minWidth: 280,
  },
  emptyCard: {
    width: width - 40,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  emptyText: {},
});
