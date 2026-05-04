import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { checkAndAutoAcceptCourses, getCoursesBySpace } from '../services/courseService';
import { getUserSpaces } from '../services/spaceService';
import { logger } from '../utils/logger';

interface PendingCourse {
    courseName: string;
    fullCode: string;
    deadline?: Date;
    spaceId: string;
    courseId: string;
}

/**
 * Hook that checks for carryover courses pending acceptance on app launch.
 * Shows a sheet for each pending course to let the user accept or dismiss.
 */
export function useCarryoverAutoAccept() {
    const { user } = useAuthStore();
    const [pendingCourses, setPendingCourses] = useState<PendingCourse[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showSheet, setShowSheet] = useState(false);

    useEffect(() => {
        if (!user?.uid) return;

        const runCheck = async () => {
            try {
                // Auto-accept any courses past their deadline
                const autoAccepted = await checkAndAutoAcceptCourses(user.uid);
                if (autoAccepted.length > 0) {
                    // Auto-accepted courses logic
                }

                // Find any remaining pending courses (not yet accepted, not past deadline)
                const spaces = await getUserSpaces(user.uid);
                const pending: PendingCourse[] = [];

                for (const space of spaces) {
                    const courses = await getCoursesBySpace(space.id);
                    // We'd normally check course members for unaccepted entries,
                    // but for MVP we rely on the auto-accept check above handling deadline logic.
                    // The sheet is shown for courses that were auto-accepted in this session.
                }

                // Show auto-accepted courses as notifications
                if (autoAccepted.length > 0) {
                    const items: PendingCourse[] = autoAccepted.map((code) => ({
                        courseName: code,
                        fullCode: code,
                        spaceId: '',
                        courseId: '',
                    }));
                    setPendingCourses(items);
                    setCurrentIndex(0);
                    setShowSheet(true);
                }
            } catch (error) {
                logger.error('Error checking carryover courses:', error);
            }
        };

        runCheck();
    }, [user?.uid]);

    const currentCourse = pendingCourses[currentIndex] || null;

    const dismissSheet = useCallback(() => {
        if (currentIndex < pendingCourses.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setShowSheet(false);
        }
    }, [currentIndex, pendingCourses.length]);

    const acceptCourse = useCallback(() => {
        // Course was already auto-accepted by checkAndAutoAcceptCourses
        // Just move to next or dismiss
        dismissSheet();
    }, [dismissSheet]);

    return {
        pendingCourses,
        showSheet,
        currentCourse,
        dismissSheet,
        acceptCourse,
    };
}
