import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { collectionGroup, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { proximityService } from './proximityService';
import * as attendanceService from './attendanceService';
import { useAuthStore } from '../store/authStore';
import { useSpaceStore } from '../store/spaceStore';
import { AttendanceSession } from '../types';

export const BACKGROUND_ATTENDANCE_TASK = 'BACKGROUND_ATTENDANCE_SCAN';

// Define the background task
TaskManager.defineTask(BACKGROUND_ATTENDANCE_TASK, async () => {
  const now = new Date();
  console.log(`[BackgroundFetch] Task triggered at ${now.toISOString()}`);

  try {
    const { user } = useAuthStore.getState();
    const { spaces } = useSpaceStore.getState();

    if (!user || spaces.length === 0) {
        console.log('[BackgroundFetch] No user or spaces, skipping.');
        return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const spaceIds = spaces.map(s => s.id);

    // 2. Query for active sessions across all 'attendance' subcollections
    const attendanceQuery = query(
      collectionGroup(db, 'attendance'),
      where('isOpen', '==', true)
    );
    
    const querySnapshot = await getDocs(attendanceQuery);
    const sessions = querySnapshot.docs
        .map(doc => doc.data() as AttendanceSession)
        .filter(session => spaceIds.includes(session.spaceId));

    if (sessions.length === 0) {
        console.log('[BackgroundFetch] No active sessions found.');
        return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    let markedAny = false;

    // 3. Scan for each session's beacon
    for (const session of sessions) {
        try {
            const result = await proximityService.checkProximity(session);
            
            if (result.detected && result.signalStrength !== 'weak') {
                console.log(`[BackgroundFetch] Detected beacon for ${session.courseCode}. Marking attendance...`);
                await attendanceService.markAttendance(
                    session.spaceId,
                    session.courseId,
                    session.id,
                    session.code,
                    user.uid,
                    user.fullName,
                    false, // Carryover check omitted in background for now
                    result.method!,
                    result.reading
                );
                markedAny = true;
            }
        } catch (err) {
            console.error(`[BackgroundFetch] Error scanning for session ${session.id}:`, err);
        }
    }

    return markedAny 
        ? BackgroundFetch.BackgroundFetchResult.NewData 
        : BackgroundFetch.BackgroundFetchResult.NoData;

  } catch (error) {
    console.error('[BackgroundFetch] Task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Helper to register the task
export const registerBackgroundTasks = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_ATTENDANCE_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_ATTENDANCE_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false, // Android only
        startOnBoot: true, // Android only
      });
      console.log(`[BackgroundFetch] Task ${BACKGROUND_ATTENDANCE_TASK} registered.`);
    }
  } catch (err) {
    console.error(`[BackgroundFetch] Registration failed:`, err);
  }
};
