import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { addDays, format, isSameDay, startOfToday } from 'date-fns';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { useRecentPosts } from '../../hooks/usePosts';
import ClassCard from '../../components/cards/ClassCard';
import PostTypeSheet from '../../components/sheets/PostTypeSheet';
import CreatePostSheet from '../../components/sheets/CreatePostSheet';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { ErrorState } from '../../components/feedback/ErrorState';
import { PostType } from '../../types';

const { width } = Dimensions.get('window');

function generateWeekDates(): Date[] {
  const today = startOfToday();
  return Array.from({ length: 14 }, (_, i) => addDays(today, i - 3));
}

export default function ScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors: Colors, typography: Typography } = useTheme();
  const { user } = useAuthStore();
  const { posts, loading, error, refetch } = useRecentPosts(50);

  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [showPostTypeSheet, setShowPostTypeSheet] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<PostType>('lecture');

  const weekDates = generateWeekDates();
  const dateScrollRef = useRef<ScrollView>(null);

  const isMonitorOrAssistant =
    user?.role === 'monitor' || user?.role === 'assistant_monitor';

  // Filter lectures for selected date
  const dayLectures = posts.filter(
    (p) =>
      p.type === 'lecture' &&
      p.lectureDate &&
      isSameDay(new Date(p.lectureDate), selectedDate)
  );

  // Sort by start time
  dayLectures.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  useEffect(() => {
    // Auto-scroll to selected date on mount
    setTimeout(() => {
      const index = weekDates.findIndex(d => isSameDay(d, selectedDate));
      if (index !== -1 && dateScrollRef.current) {
        dateScrollRef.current.scrollTo({ x: index * 52 - (width / 2 - 26), animated: true });
      }
    }, 500);
  }, [selectedDate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message="Failed to load schedule" onRetry={refetch} />;

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={[styles.title, { color: Colors.onSurface, fontFamily: Typography.family.extraBold }]}>Schedule</Text>
          <Text style={[styles.subtitle, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>{format(selectedDate, 'MMMM yyyy')}</Text>
        </View>

        <View style={styles.headerActions}>
           <View style={[styles.searchCircle, { backgroundColor: Colors.surface, borderColor: Colors.separatorOpaque }]}>
             <LucideIcons.Search size={18} color={Colors.onSurface} />
           </View>
           {isMonitorOrAssistant ? (
             <Pressable 
               onPress={() => setShowPostTypeSheet(true)}
               style={[styles.calendarCircle, { backgroundColor: Colors.accentBlue }]}
             >
               <LucideIcons.CalendarPlus size={18} color={Colors.white} />
             </Pressable>
           ) : (
             <View style={[styles.calendarCircle, { backgroundColor: Colors.accentBlue }]}>
               <LucideIcons.Calendar size={18} color={Colors.white} />
             </View>
           )}
        </View>
      </View>

      {/* Date Strip */}
      <View style={styles.dateStrip}>
        <ScrollView
          ref={dateScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateStripContent}
        >
          {weekDates.map((date, idx) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, startOfToday());
            return (
              <Pressable
                key={idx}
                onPress={() => setSelectedDate(date)}
                style={[
                  styles.dateTile,
                  { backgroundColor: Colors.transparent },
                  isSelected && [styles.dateTileSelected, { backgroundColor: Colors.surface }]
                ]}
              >
                <Text style={[
                  styles.dayInitial, 
                  { color: Colors.textTertiary, fontFamily: Typography.family.semiBold },
                  isSelected && { color: Colors.accentBlue }
                ]}>
                  {format(date, 'EEEEE')}
                </Text>
                <Text style={[
                  styles.dateNum, 
                  { color: Colors.onSurface, fontFamily: Typography.family.bold },
                  isSelected && { color: Colors.accentBlue }
                ]}>
                  {format(date, 'd')}
                </Text>
                {isToday && !isSelected && <View style={[styles.todayDot, { backgroundColor: Colors.accentBlue }]} />}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 104 }}
      >
        {dayLectures.length > 0 ? (
          dayLectures.map((lecture) => (
            <View key={lecture.id} style={styles.timelineRow}>
              <View style={styles.timeColumn}>
                <Text style={[styles.startTimeText, { color: Colors.textSecondary, fontFamily: Typography.family.bold }]}>{lecture.startTime || '--:--'}</Text>
                <View style={[styles.timelineLine, { backgroundColor: Colors.separatorOpaque }]} />
              </View>
              <View style={styles.cardColumn}>
                <ClassCard
                  courseCode={lecture.courseCode}
                  courseName={lecture.title}
                  startTime={lecture.startTime || ''}
                  endTime={lecture.endTime || ''}
                  venue={lecture.venue || 'TBD'}
                  isCarryover={lecture.isCarryover}
                  onPress={() => router.push(`/post/${lecture.id}`)}
                  style={{ width: '100%' }}
                />
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { backgroundColor: Colors.surface, borderColor: Colors.separatorOpaque }]}>
              <LucideIcons.CalendarX size={32} color={Colors.textTertiary} opacity={0.3} />
            </View>
            <Text style={[styles.emptyTitle, { color: Colors.onSurface, fontFamily: Typography.family.bold }]}>
              {isSameDay(selectedDate, startOfToday()) ? "No classes today" : "Nothing scheduled"}
            </Text>
            <Text style={[styles.emptySubtitle, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>
              Enjoy your free day or check another date.
            </Text>
          </View>
        )}
      </ScrollView>

      <PostTypeSheet
        visible={showPostTypeSheet}
        onClose={() => setShowPostTypeSheet(false)}
        onSelect={(type) => {
          setSelectedPostType(type);
          setShowCreateSheet(true);
        }}
        filterToLecture
      />

      <CreatePostSheet
        visible={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        postType={selectedPostType}
        onSubmit={() => setShowCreateSheet(false)}
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
    paddingHorizontal: 22,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  searchCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  calendarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateStrip: {
    marginBottom: 24,
  },
  dateStripContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dateTile: {
    width: 44,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTileSelected: {
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      }
    })
  },
  dayInitial: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 16,
    fontWeight: '700',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    minHeight: 120,
  },
  timeColumn: {
    width: 44,
    alignItems: 'center',
    paddingTop: 14,
  },
  startTimeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timelineLine: {
    flex: 1,
    width: 1,
    marginTop: 8,
    marginBottom: -120, // To connect to next row
  },
  cardColumn: {
    flex: 1,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
