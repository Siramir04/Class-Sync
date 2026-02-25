import { useEffect, useState } from 'react';
import { subscribeToCourses, getCoursesBySpace } from '../services/courseService';
import { Course } from '../types';

/**
 * Hook to subscribe to courses in a space in real-time.
 */
export function useCourses(spaceId: string | null) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!spaceId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = subscribeToCourses(spaceId, (fetchedCourses) => {
            setCourses(fetchedCourses);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [spaceId]);

    return { courses, loading };
}
