import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Dimensions,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { useRecentPosts } from '../../hooks/usePosts';
import { useSpaces } from '../../hooks/useSpace';
import { useNotifications } from '../../hooks/useNotifications';
import { Avatar } from '../../components/ui/Avatar';
import ClassCard from '../../components/cards/ClassCard';
import SpaceTile from '../../components/cards/SpaceTile';
import PostCard from '../../components/cards/PostCard';
import { getTodayLabel } from '../../utils/formatDate';

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
  const { posts: recentPosts, loading: postsLoading } = useRecentPosts(10);
  const { spaces } = useSpaces();

  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const todayDateStr = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  // Filter today's lectures
  const today = new Date();
  const todayLectures = recentPosts.filter(
    (p) =>
      p.type === 'lecture' &&
      p.lectureDate &&
      new Date(p.lectureDate).toDateString() === today.toDateString()
  );

  const notifications = unreadCount > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingTop: insets.top + 12,
          paddingBottom: 104, // Space for tab bar
        }}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingLabel}>{getGreeting()}</Text>
            <Text style={styles.userName}>{firstName} 👋</Text>
            <Text style={styles.dateLabel}>{todayDateStr}</Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable 
              onPress={() => router.push('/notifications')}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && { opacity: 0.7 }
              ]}
            >
              <LucideIcons.Bell size={15} color="#000" />
              {notifications && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </Pressable>

            <Pressable 
              onPress={() => router.push('/(tabs)/profile')}
              style={({ pressed }) => [
                pressed && { opacity: 0.7 }
              ]}
            >
              <Avatar 
                firstName={firstName} 
                lastName={user?.fullName?.split(' ')[1] || ''} 
                size="sm" 
              />
            </Pressable>
          </View>
        </View>

        {/* Today's Classes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Classes</Text>
            <Pressable onPress={() => router.push('/(tabs)/schedule')}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalContent}
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
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No classes scheduled for today.</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* My Spaces */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Spaces</Text>
            <Pressable onPress={() => router.push('/(tabs)/spaces')}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalContent}
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
              name="Add Space" 
              isAdd 
              onPress={() => router.push('/join')} 
            />
          </ScrollView>
        </View>

        {/* Recent Notices */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Notices</Text>
            {/* "See all" on notices? Prompt says see all for Recent Notices too. */}
            <Pressable>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          <View style={styles.noticesList}>
            {recentPosts.slice(0, 5).map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isCarryover={post.isCarryover}
                onPress={() => router.push(`/post/${post.id}`)}
                style={{ marginBottom: 8 }}
              />
            ))}
          </View>
        </View>
      </ScrollView>
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
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  greetingLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 1,
    fontFamily: Typography.family.regular,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5,
    fontFamily: Typography.family.bold,
  },
  dateLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
    fontFamily: Typography.family.regular,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    backgroundColor: 'white',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Colors.separatorOpaque,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 13,
    height: 13,
    backgroundColor: Colors.error,
    borderRadius: 6.5,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 7,
    fontWeight: '700',
    color: 'white',
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    fontFamily: Typography.family.bold,
  },
  seeAll: {
    fontSize: 11,
    color: Colors.accentBlue,
    fontWeight: '500',
    fontFamily: Typography.family.medium,
  },
  horizontalContent: {
    paddingHorizontal: 14,
    gap: 9,
  },
  noticesList: {
    paddingHorizontal: 14,
  },
  emptyStateContainer: {
    width: width - 28,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.separatorOpaque,
  },
  emptyStateText: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontFamily: Typography.family.regular,
  },
});
