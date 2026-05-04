// hooks/useCarryoverAutoAcceptSafe.ts
// Web-safe wrapper for useCarryoverAutoAccept.
// Returns no-op values on web to prevent native module crashes.
import { useState, useCallback } from 'react';
import { isNative } from '../utils/platform';

interface PendingCourse {
    courseName: string;
    fullCode: string;
    deadline?: Date;
    spaceId: string;
    courseId: string;
}

interface CarryoverAutoAcceptResult {
    pendingCourses: PendingCourse[];
    showSheet: boolean;
    currentCourse: PendingCourse | null;
    dismissSheet: () => void;
    acceptCourse: () => void;
}

/**
 * Web-safe carryover auto-accept hook.
 * On native: dynamically loads and delegates to the real hook.
 * On web: returns empty/no-op values immediately.
 */
export function useCarryoverAutoAcceptSafe(): CarryoverAutoAcceptResult {
    const noOp = useCallback(() => {}, []);
    const [webDefault] = useState<CarryoverAutoAcceptResult>({
        pendingCourses: [],
        showSheet: false,
        currentCourse: null,
        dismissSheet: noOp,
        acceptCourse: noOp,
    });

    if (isNative) {
        // Dynamic require prevents web bundler from resolving native service imports
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { useCarryoverAutoAccept } = require('./useCarryoverAutoAccept') as {
            useCarryoverAutoAccept: () => CarryoverAutoAcceptResult;
        };
        return useCarryoverAutoAccept();
    }

    return webDefault;
}
