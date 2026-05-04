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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';
import { useRecentPosts } from '../../hooks/usePosts';
import { useSpaces } from '../../hooks/useSpace';
import { useNotifications } from '../../hooks/useNotifications';
import { Avatar } from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import ClassCard from '../../components/cards/ClassCard';
import SpaceTile from '../../components/cards/SpaceTile';
import PostCard from '../../components/cards/PostCard';

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
  const { user } = useAuthStore();
  const { unreadCount } = useNotifications();
  const { posts: recentPosts, loading: postsLoading } = useRecentPosts(15);
  const { spaces } = useSpaces();

  // Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [postsLoading]);

  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const todayDateStr = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* M3 Adaptive App Bar */}
      <Animated.View style={[styles.appBar, { height: headerHeight, paddingTop: insets.top }]}>
          <View style={styles.appBarTop}>
              <Animated.Text style={[styles.appBarTitle, { opacity: headerTitleOpacity }]}>
                  ClassSync
              </Animated.Text>
              <View style={styles.appBarActions}>
                  <Pressable
                    onPress={() => router.push('/notifications')}
                    style={styles.iconButton}
                  >
                    <LucideIcons.Bell size={22} color={Colors.onSurface} />
                    {unreadCount > 0 && (
                      <View style={styles.badge} />
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
              <Text style={styles.greetingText}>{getGreeting()},</Text>
              <Text style={styles.userNameText}>{firstName} 👋</Text>
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
                <Text style={styles.sectionTitle}>Today's Timeline</Text>
                <Pressable onPress={() => router.push('/(tabs)/schedule')}>
                  <Text style={styles.seeAll}>View Full Schedule</Text>
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
                      onPress={() => router.push(`/post/${item.id}`)}
                    />
                  ))
                ) : (
                  <Card variant="filled" style={styles.emptyCard}>
                    <LucideIcons.CalendarCheck2 size={24} color={Colors.onSurfaceVariant} style={{ marginBottom: 8 }} />
                    <Text style={styles.emptyText}>No more classes today. Relax!</Text>
                  </Card>
                )}
              </ScrollView>
            </View>

            {/* My Spaces Tonal Grid */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Academic Spaces</Text>
                <Pressable onPress={() => router.push('/(tabs)/spaces')}>
                  <LucideIcons.ArrowRight size={20} color={Colors.primary} />
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

            {/* Recent Notices Feed */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Notices</Text>
              </View>

              <View style={styles.noticesContainer}>
                {recentPosts.filter(p => p.type !== 'lecture').slice(0, 8).map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isCarryover={post.isCarryover}
                    onPress={() => router.push(`/post/${post.id}`)}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  appBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  appBarTop: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appBarTitle: {
    ...Typography.m3.titleLarge,
    color: Colors.onSurface,
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  largeTitleContainer: {
    marginTop: 12,
  },
  greetingText: {
    ...Typography.m3.bodyLarge,
    color: Colors.onSurfaceVariant,
    fontSize: 16,
  },
  userNameText: {
    ...Typography.m3.headlineMedium,
    color: Colors.onSurface,
    fontWeight: 'bold',
  },
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
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.background,
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
  sectionTitle: {
    ...Typography.m3.titleMedium,
    color: Colors.onSurface,
    fontWeight: '700',
  },
  seeAll: {
    ...Typography.m3.labelLarge,
    color: Colors.primary,
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
    borderRadius: 28,
  },
  emptyText: {
    ...Typography.m3.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
});
