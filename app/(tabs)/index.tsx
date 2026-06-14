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
  Image,
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
  const { colors: Colors, typography: Typography, isDark } = useTheme();
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
  const lastName = user?.fullName?.split(' ')[1] || '';

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

  const headerLargeTitleOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  if (postsLoading) return <LoadingSpinner />;

  // -------------------------------------------------------------
  // DESKTOP WEB SCREEN LAYOUT — matches reference mockup
  // -------------------------------------------------------------
  if (isDesktopWeb) {
    return (
      <View style={[desktopStyles.container, { backgroundColor: Colors.background }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={desktopStyles.scrollContent}>
          {/* Top Bar Header */}
          <View style={desktopStyles.topBar}>
            <View style={desktopStyles.branding}>
              <Text style={[desktopStyles.brandText, { color: Colors.textPrimary }]}>Company Name</Text>
            </View>

            <View style={desktopStyles.topActions}>
              <Pressable style={[desktopStyles.topIconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,76,92,0.05)' }]}>
                <LucideIcons.Search size={18} color={Colors.textPrimary} />
              </Pressable>
              
              <Pressable
                onPress={() => router.push('/notifications')}
                style={[desktopStyles.topIconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,76,92,0.05)' }]}
              >
                <LucideIcons.Bell size={18} color={Colors.textPrimary} />
                {unreadCount > 0 && <View style={desktopStyles.unreadBadge} />}
              </Pressable>

              <Pressable style={[desktopStyles.topIconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,76,92,0.05)' }]}>
                <LucideIcons.Settings size={18} color={Colors.textPrimary} />
              </Pressable>

              {/* User Widget */}
              <Pressable onPress={() => router.push('/(tabs)/profile')} style={desktopStyles.userWidget}>
                <Avatar firstName={firstName} lastName={lastName} size="sm" />
                <View style={desktopStyles.userWidgetInfo}>
                  <Text style={[desktopStyles.widgetName, { color: Colors.textPrimary }]}>{user?.fullName || 'User'}</Text>
                  <Text style={[desktopStyles.widgetRole, { color: Colors.textSecondary }]}>{user?.role || 'Admin'}</Text>
                </View>
                <LucideIcons.ChevronDown size={14} color={Colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* Breadcrumbs & Control Toolbar */}
          <View style={desktopStyles.toolbar}>
            <View style={desktopStyles.pathGroup}>
              <Text style={[desktopStyles.pathParent, { color: Colors.textSecondary }]}>Dashboard</Text>
              <View style={desktopStyles.pathRow}>
                <LucideIcons.ArrowLeft size={16} color={Colors.textPrimary} style={{ marginRight: 6 }} />
                <Text style={[desktopStyles.pathCurrent, { color: Colors.textPrimary }]}>Classes</Text>
              </View>
            </View>

            <View style={desktopStyles.toolActions}>
              <View style={[desktopStyles.toggleGroup, { borderColor: Colors.borderSubtle }]}>
                <Pressable style={[desktopStyles.toggleBtn, desktopStyles.toggleBtnActive, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,76,92,0.08)' }]}>
                  <LucideIcons.LayoutGrid size={16} color={Colors.textPrimary} />
                </Pressable>
                <Pressable style={desktopStyles.toggleBtn}>
                  <LucideIcons.List size={16} color={Colors.textSecondary} />
                </Pressable>
              </View>

              <Pressable style={[desktopStyles.filterBtn, { borderColor: Colors.borderSubtle }]}>
                <LucideIcons.Filter size={14} color={Colors.textSecondary} />
              </Pressable>

              <Pressable
                onPress={() => router.push('/join')}
                style={[desktopStyles.createBtn, { backgroundColor: '#FFFFFF' }]}
              >
                <LucideIcons.Plus size={14} color="#0F4C5C" style={{ marginRight: 6 }} />
                <Text style={desktopStyles.createBtnText}>CREATE CLASS</Text>
              </Pressable>
            </View>
          </View>

          {/* Featured Courses Row */}
          {todayLectures.length > 0 ? (
            <View style={desktopStyles.featuredRow}>
              {todayLectures.slice(0, 2).map((item) => (
                <View key={item.id} style={desktopStyles.featuredCol}>
                  <ClassCard
                    isFeatured
                    courseCode={item.courseCode}
                    courseName={item.title}
                    description={item.description || 'Class session notice and resource catalog.'}
                    startTime={item.startTime || '10:00'}
                    endTime={item.endTime || '12:00'}
                    venue={item.venue || 'TBD'}
                    onPress={() => router.push({
                      pathname: `/post/${item.id}`,
                      params: { spaceId: item.spaceId, courseId: item.courseId }
                    })}
                  />
                </View>
              ))}
            </View>
          ) : (
            <Card variant="filled" style={desktopStyles.emptyFeatured}>
              <LucideIcons.Calendar size={24} color={Colors.textSecondary} style={{ marginBottom: 8 }} />
              <Text style={[desktopStyles.emptyText, { color: Colors.textSecondary, fontFamily: 'DMSans_500Medium' }]}>No more classes today. Relax!</Text>
            </Card>
          )}

          {/* Section: Other Classes */}
          {todayLectures.length > 2 && (
            <View style={desktopStyles.section}>
              <Text style={[desktopStyles.sectionTitle, { color: Colors.textPrimary }]}>Other classes today</Text>
              
              <View style={desktopStyles.otherGrid}>
                {todayLectures.slice(2).map((item) => (
                  <View key={item.id} style={desktopStyles.otherGridItem}>
                    <ClassCard
                      courseCode={item.courseCode}
                      courseName={item.title}
                      startTime={item.startTime || '10:00'}
                      endTime={item.endTime || '12:00'}
                      venue={item.venue || 'TBD'}
                      onPress={() => router.push({
                        pathname: `/post/${item.id}`,
                        params: { spaceId: item.spaceId, courseId: item.courseId }
                      })}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Extra Spaces & Personal Courses for feature completeness */}
          <View style={desktopStyles.spacesSection}>
            <Text style={[desktopStyles.sectionTitle, { color: Colors.textPrimary, marginBottom: 12 }]}>Academic Spaces & Personal Tracks</Text>
            <View style={desktopStyles.spacesGrid}>
              {spaces.map((space, index) => (
                <View key={space.id} style={desktopStyles.spacesGridItem}>
                  <SpaceTile name={space.name} index={index} onPress={() => router.push(`/space/${space.id}`)} />
                </View>
              ))}
              {personalCourses.slice(0, 3).map(course => (
                <View key={course.id} style={desktopStyles.spacesGridItem}>
                  <PersonalCourseCard course={course} />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // -------------------------------------------------------------
  // NATIVE MOBILE LAYOUT (preserved responsive state)
  // -------------------------------------------------------------
  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={Colors.background} />
      
      {/* App Bar */}
      <Animated.View style={[styles.appBar, { height: headerHeight, paddingTop: insets.top, backgroundColor: Colors.background }]}>
          <View style={styles.appBarTop}>
              <Text style={[styles.appBarTitle, { color: Colors.textPrimary, ...Typography.appTitle }]}>
                  ClassSync
              </Text>
              <View style={styles.appBarActions}>
                  <Pressable
                    onPress={() => router.push('/notifications')}
                    style={[styles.iconButton, { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderSubtle }]}
                  >
                    <LucideIcons.Bell size={18} color={Colors.textPrimary} />
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
              <Text style={[styles.greetingText, { color: Colors.textSecondary, ...Typography.caption1 }]}>{getGreeting()},</Text>
              <Text style={[styles.userNameText, { color: Colors.textPrimary, ...Typography.screenTitle }]}>{firstName} 👋</Text>
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
          paddingTop: 130,
          paddingBottom: 100,
        }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
            {/* Today's Timeline */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: Colors.textPrimary, ...Typography.cardTitle }]}>Today's Timeline</Text>
                <Pressable onPress={() => router.push('/(tabs)/schedule')}>
                  <Text style={[styles.seeAll, { color: Colors.accentSecondary, ...Typography.m3.labelLarge }]}>View Full Schedule</Text>
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
                    <LucideIcons.Calendar size={24} color={Colors.textSecondary} style={{ marginBottom: 8 }} />
                    <Text style={[styles.emptyText, { color: Colors.textSecondary, ...Typography.m3.bodyMedium }]}>No more classes today. Relax!</Text>
                  </Card>
                )}
              </ScrollView>
            </View>

            {/* My Spaces */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Text style={[styles.sectionTitle, { color: Colors.textPrimary, ...Typography.cardTitle }]}>My Academic Spaces</Text>
                  <View style={[styles.countBadge, { backgroundColor: Colors.accentSecondary + '20' }]}>
                    <Text style={[styles.countBadgeText, { color: Colors.accentSecondary }]}>{spaces.length}</Text>
                  </View>
                </View>
                <Pressable onPress={() => router.push('/(tabs)/spaces')}>
                  <LucideIcons.ArrowRight size={20} color={Colors.accentSecondary} />
                </Pressable>
              </View>

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
            </View>

            {/* My Personal Courses */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: Colors.textPrimary, ...Typography.cardTitle }]}>My Personal Courses</Text>
                <Pressable 
                  onPress={() => router.push('/personal/create')}
                  style={[styles.newButton, { backgroundColor: Colors.primary }]}
                >
                  <LucideIcons.Plus size={14} color={Colors.onPrimary} />
                  <Text style={[styles.newButtonText, { color: Colors.onPrimary }]}>New</Text>
                </Pressable>
              </View>
              <View style={styles.noticesContainer}>
                {personalCourses.length > 0 ? (
                  personalCourses.map(course => (
                    <PersonalCourseCard key={course.id} course={course} />
                  ))
                ) : (
                  <Card variant="filled" style={styles.emptyCard}>
                    <LucideIcons.BookOpen size={24} color={Colors.textSecondary} style={{ marginBottom: 8 }} />
                    <Text style={[styles.emptyText, { color: Colors.textSecondary, ...Typography.m3.bodyMedium, textAlign: 'center' }]}>
                      No personal courses yet. Tap '+ New' to create one!
                    </Text>
                  </Card>
                )}
              </View>
            </View>

            {/* Recent Notices Feed */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: Colors.textPrimary, ...Typography.cardTitle }]}>Recent Notices</Text>
              </View>

              <View style={styles.noticesContainer}>
                {recentPosts.filter(p => p.type !== 'lecture').slice(0, 8).map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isCarryover={post.isCarryover}
                    onPress={() => router.push({
                      pathname: `/post/${post.id}`,
                      params: { spaceId: post.spaceId, courseId: post.courseId }
                    })}
                    style={{ marginBottom: 12 }}
                  />
                ))}
              </View>
            </View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const desktopStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 72,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    marginBottom: 20,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'DMSans_700Bold',
    letterSpacing: -0.5,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F56565',
  },
  userWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  userWidgetInfo: {
    marginRight: 4,
  },
  widgetName: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  widgetRole: {
    fontSize: 9,
    fontFamily: 'DMSans_400Regular',
    textTransform: 'uppercase',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pathGroup: {
    flexDirection: 'column',
  },
  pathParent: {
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pathCurrent: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'DMSans_700Bold',
    letterSpacing: -0.8,
  },
  toolActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleGroup: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 2,
  },
  toggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {},
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
      }
    })
  },
  createBtnText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'DMSans_700Bold',
    color: '#0F4C5C',
  },
  featuredRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 28,
  },
  featuredCol: {
    flex: 1,
  },
  emptyFeatured: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    marginBottom: 28,
  },
  emptyText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'DMSans_700Bold',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  otherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  otherGridItem: {
    width: '23.5%',
    minWidth: 220,
  },
  spacesSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 24,
    marginTop: 8,
  },
  spacesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  spacesGridItem: {
    width: '24%',
    minWidth: 180,
  },
});

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
    gap: 12,
  },
  largeTitleContainer: {
    marginTop: 4,
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {},
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  seeAll: {},
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newButtonText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  noticesContainer: {
    paddingHorizontal: 20,
  },
  emptyCard: {
    width: width - 40,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  emptyText: {},
});
