import { useMemo } from 'react';
import { usePersonalCourseStore } from '../store/personalCourseStore';
import { useRecentPosts } from './usePosts';

interface MergedEvent {
  id: string;
  type: 'institution' | 'personal';
  title: string;
  subtitle?: string;
  time: string;
  endTime?: string;
  location?: string;
  color?: string;
  dayOfWeek: number;
}

/**
 * Merges institution lecture posts with personal course schedule items
 * into a unified timeline sorted by day-of-week and start time.
 *
 * Institution events are sourced from lecture-type posts (since the
 * existing Course type doesn't have a schedule field). Personal events
 * are sourced from PersonalCourse.schedule arrays.
 */
export const useMergedSchedule = () => {
  const { courses: personalCourses } = usePersonalCourseStore();
  const { posts } = useRecentPosts(50);

  return useMemo(() => {
    const events: MergedEvent[] = [];

    // Institution events — from lecture posts
    posts
      .filter(p => p.type === 'lecture' && p.lectureDate)
      .forEach(post => {
        const lectureDate = new Date(post.lectureDate!);
        events.push({
          id: `inst-${post.id}`,
          type: 'institution',
          title: post.title,
          subtitle: post.courseCode,
          time: post.startTime || '--:--',
          endTime: post.endTime,
          location: post.venue,
          dayOfWeek: lectureDate.getDay(),
        });
      });

    // Personal events — from schedule arrays
    personalCourses.forEach(course => {
      course.schedule.forEach(item => {
        events.push({
          id: `pers-${course.id}-${item.id}`,
          type: 'personal',
          title: course.name,
          time: item.startTime,
          endTime: item.endTime,
          location: item.location,
          color: course.color,
          dayOfWeek: item.dayOfWeek,
        });
      });
    });

    // Sort by day-of-week, then by start time string
    return events.sort((a, b) =>
      a.dayOfWeek - b.dayOfWeek || a.time.localeCompare(b.time)
    );
  }, [posts, personalCourses]);
};

export type { MergedEvent };
