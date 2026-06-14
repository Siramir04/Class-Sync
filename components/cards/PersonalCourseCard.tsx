import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { PersonalCourse } from '../../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

interface PersonalCourseCardProps {
  course: PersonalCourse;
}

/**
 * Personal Course Card — Teal design system
 * bgSurface, borderSubtle, teal accent colors, 16px radius
 */
export default React.memo(function PersonalCourseCard({ course }: PersonalCourseCardProps) {
  const { colors: Colors, typography: Typography } = useTheme();
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  // Find next upcoming schedule item relative to current day
  const today = new Date().getDay();
  const sortedSchedule = [...course.schedule].sort((a, b) => {
    const aDist = (a.dayOfWeek - today + 7) % 7;
    const bDist = (b.dayOfWeek - today + 7) % 7;
    return aDist - bDist;
  });
  const nextClass = sortedSchedule[0];

  const pendingCount = course.assignments.filter(a => !a.isCompleted).length;
  const sessionCount = course.attendance.length;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={() => router.push(`/personal/${course.id}`)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, {
          backgroundColor: Colors.surface,
          borderColor: Colors.borderSubtle,
        }]}
      >
        {/* Top Row: Name + Color Badge */}
        <View style={styles.topRow}>
          <View style={[styles.colorDot, { backgroundColor: course.color }]} />
          <Text
            style={[styles.courseName, { color: Colors.textPrimary, fontFamily: Typography.family.bold }]}
            numberOfLines={1}
          >
            {course.name}
          </Text>
        </View>

        {/* Description */}
        {course.description && (
          <Text
            style={[styles.description, { color: Colors.textSecondary, fontFamily: Typography.family.regular }]}
            numberOfLines={2}
          >
            {course.description}
          </Text>
        )}

        {/* Next Class */}
        {nextClass && (
          <View style={styles.nextClassRow}>
            <LucideIcons.Clock size={13} color={Colors.textTertiary} />
            <Text style={[styles.nextClassText, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>
              Next: {DAYS[nextClass.dayOfWeek]} • {nextClass.startTime} – {nextClass.endTime}
            </Text>
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {pendingCount > 0 && (
            <View style={[styles.statChip, { backgroundColor: Colors.warning + '15' }]}>
              <LucideIcons.List size={12} color={Colors.warning} />
              <Text style={[styles.statText, { color: Colors.warning, fontFamily: Typography.family.semiBold }]}>
                {pendingCount} pending
              </Text>
            </View>
          )}
          <View style={[styles.statChip, { backgroundColor: course.color + '15' }]}>
            <LucideIcons.BookOpen size={12} color={course.color} />
            <Text style={[styles.statText, { color: course.color, fontFamily: Typography.family.semiBold }]}>
              {sessionCount} sessions
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  courseName: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 4,
    lineHeight: 20,
  },
  nextClassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  nextClassText: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
