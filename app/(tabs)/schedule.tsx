import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { addDays, format, isSameDay, startOfToday, eachDayOfInterval } from 'date-fns';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';
import { useRecentPosts } from '../../hooks/usePosts';
import ClassCard from '../../components/cards/ClassCard';
import PostTypeSheet from '../../components/sheets/PostTypeSheet';
import CreatePostSheet from '../../components/sheets/CreatePostSheet';
import { Post, PostType } from '../../types';

const { width } = Dimensions.get('window');

function generateWeekDates(): Date[] {
  const today = startOfToday();
  return Array.from({ length: 14 }, (_, i) => addDays(today, i - 3));
}

export default function ScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { posts, loading } = useRecentPosts(50);

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={styles.title}>Schedule</Text>
          <Text style={styles.subtitle}>{format(selectedDate, 'MMMM yyyy')}</Text>
        </View>

        <View style={styles.headerActions}>
           <View style={styles.searchCircle}>
             <LucideIcons.Search size={18} color="#000" />
           </View>
           {isMonitorOrAssistant ? (
             <Pressable 
               onPress={() => setShowPostTypeSheet(true)}
               style={styles.calendarCircle}
             >
               <LucideIcons.CalendarPlus size={18} color="white" />
             </Pressable>
           ) : (
             <View style={styles.calendarCircle}>
               <LucideIcons.Calendar size={18} color="white" />
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
                  isSelected && styles.dateTileSelected
                ]}
              >
                <Text style={[styles.dayInitial, isSelected && styles.dayInitialSelected]}>
                  {format(date, 'EEEEE')}
                </Text>
                <Text style={[styles.dateNum, isSelected && styles.dateNumSelected]}>
                  {format(date, 'd')}
                </Text>
                {isToday && !isSelected && <View style={styles.todayDot} />}
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
                <Text style={styles.startTimeText}>{lecture.startTime || '--:--'}</Text>
                <View style={styles.timelineLine} />
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
            <View style={styles.emptyIconCircle}>
              <LucideIcons.CalendarX size={32} color={Colors.textTertiary} opacity={0.3} />
            </View>
            <Text style={styles.emptyTitle}>
              {isSameDay(selectedDate, startOfToday()) ? "No classes today" : "Nothing scheduled"}
            </Text>
            <Text style={styles.emptySubtitle}>
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
    backgroundColor: Colors.background,
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
    color: '#000',
    letterSpacing: -1,
    fontFamily: Typography.family.extraBold,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 2,
    fontFamily: Typography.family.regular,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  searchCircle: {
    width: 36,
    height: 36,
    backgroundColor: 'white',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.separatorOpaque,
  },
  calendarCircle: {
    width: 36,
    height: 36,
    backgroundColor: Colors.accentBlue,
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
    backgroundColor: 'transparent',
  },
  dateTileSelected: {
    backgroundColor: 'white',
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
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontFamily: Typography.family.semiBold,
  },
  dayInitialSelected: {
    color: Colors.accentBlue,
  },
  dateNum: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    fontFamily: Typography.family.bold,
  },
  dateNumSelected: {
    color: Colors.accentBlue,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accentBlue,
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
    color: Colors.textSecondary,
    fontFamily: Typography.family.bold,
  },
  timelineLine: {
    flex: 1,
    width: 1,
    backgroundColor: Colors.separatorOpaque,
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
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.separatorOpaque,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Typography.family.bold,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: Typography.family.regular,
  },
});
