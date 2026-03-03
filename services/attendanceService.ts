import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    writeBatch,
    addDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
    AttendanceSession,
    AttendanceRecord,
    CourseAttendanceSettings,
    StudentAttendanceSummary
} from '../types/attendance';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
const { cacheDirectory, writeAsStringAsync, EncodingType } = FileSystem as any;
import * as Sharing from 'expo-sharing';

/**
 * FIRESTORE SECURITY RULES (Apply manually)
 * 
 * // Attendance sessions — only Monitor/Lecturer can write, members can read
 * match /spaces/{spaceId}/courses/{courseId}/sessions/{sessionId} {
 *   allow read: if request.auth != null;
 *   allow write: if request.auth.uid == resource.data.initiatedBy
 *                || isMonitorOfSpace(spaceId);
 * }
 * 
 * // Attendance records — student can only write their own record
 * match /spaces/{spaceId}/courses/{courseId}/sessions/{sessionId}/records/{studentUid} {
 *   allow read: if request.auth != null;
 *   allow create: if request.auth.uid == studentUid
 *                 && sessionIsActive(spaceId, courseId, sessionId);
 *   allow update, delete: if false; // records are immutable once written
 * }
 */

// --- 4.1 Settings ---

export async function updateCourseAttendanceSettings(courseId: string, spaceId: string, updates: Partial<CourseAttendanceSettings>): Promise<void> {
    const settingsRef = doc(db, 'spaces', spaceId, 'courses', courseId, 'attendanceSettings', 'settings');
    const snap = await getDoc(settingsRef);
    if (!snap.exists()) {
        await setDoc(settingsRef, {
            courseId,
            isEnabled: updates.isEnabled ?? false,
            requireRegNumber: true,
            ...updates
        });
    } else {
        await updateDoc(settingsRef, updates);
    }
}

export async function getAttendanceSettings(courseId: string, spaceId: string): Promise<CourseAttendanceSettings> {
    const settingsRef = doc(db, 'spaces', spaceId, 'courses', courseId, 'attendanceSettings', 'settings');
    const snap = await getDoc(settingsRef);
    if (!snap.exists()) {
        return { courseId, isEnabled: false, requireRegNumber: true };
    }
    return snap.data() as CourseAttendanceSettings;
}

// --- 4.2 Session Management ---

export async function startSession(
    courseId: string,
    spaceId: string,
    initiatorUid: string,
    initiatorName: string,
    courseCode: string,
    courseName: string
): Promise<AttendanceSession> {
    const sessionsRef = collection(db, 'spaces', spaceId, 'courses', courseId, 'sessions');
    const sessionId = doc(sessionsRef).id;

    // Get member count for snapshot
    const membersSnap = await getDocs(collection(db, 'spaces', spaceId, 'courses', courseId, 'members'));

    const qrToken = generateQRToken(sessionId, courseId);
    const expiresAt = new Date(Date.now() + 65000); // 65 seconds buffer

    const sessionData: AttendanceSession = {
        id: sessionId,
        courseId,
        spaceId,
        courseCode,
        courseName,
        initiatedBy: initiatorUid,
        initiatedByName: initiatorName,
        date: serverTimestamp(),
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isActive: true,
        qrToken,
        qrExpiresAt: Timestamp.fromDate(expiresAt),
        totalMembers: membersSnap.size,
        presentCount: 0,
    };

    await setDoc(doc(sessionsRef, sessionId), sessionData);
    return { ...sessionData, id: sessionId };
}

export async function refreshQRToken(sessionId: string, courseId: string, spaceId: string): Promise<string> {
    const sessionRef = doc(db, 'spaces', spaceId, 'courses', courseId, 'sessions', sessionId);
    const newToken = generateQRToken(sessionId, courseId);
    const expiresAt = new Date(Date.now() + 65000);

    await updateDoc(sessionRef, {
        qrToken: newToken,
        qrExpiresAt: Timestamp.fromDate(expiresAt),
    });

    return newToken;
}

export async function closeSession(sessionId: string, courseId: string, spaceId: string): Promise<void> {
    const sessionRef = doc(db, 'spaces', spaceId, 'courses', courseId, 'sessions', sessionId);
    await updateDoc(sessionRef, {
        isActive: false,
        endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
}

export async function getSessionsByCourse(courseId: string, spaceId: string): Promise<AttendanceSession[]> {
    const sessionsRef = collection(db, 'spaces', spaceId, 'courses', courseId, 'sessions');
    const q = query(sessionsRef, orderBy('date', 'desc'));
    const snap = await getDocs(q);

    return snap.docs.map(d => ({
        ...d.data(),
        id: d.id,
        date: d.data().date?.toDate() ?? new Date(),
        qrExpiresAt: d.data().qrExpiresAt?.toDate() ?? new Date(),
    } as AttendanceSession));
}

export async function getActiveSession(courseId: string, spaceId: string): Promise<AttendanceSession | null> {
    const sessionsRef = collection(db, 'spaces', spaceId, 'courses', courseId, 'sessions');
    const q = query(sessionsRef, where('isActive', '==', true), limit(1));
    const snap = await getDocs(q);

    if (snap.empty) return null;
    const d = snap.docs[0];
    return {
        ...d.data(),
        id: d.id,
        date: d.data().date?.toDate() ?? new Date(),
        qrExpiresAt: d.data().qrExpiresAt?.toDate() ?? new Date(),
    } as AttendanceSession;
}

export async function getSessionRecords(sessionId: string, courseId: string, spaceId: string): Promise<AttendanceRecord[]> {
    const recordsRef = collection(db, 'spaces', spaceId, 'courses', courseId, 'sessions', sessionId, 'records');
    const snap = await getDocs(recordsRef);

    return snap.docs.map(d => ({
        ...d.data(),
        id: d.id,
        markedAt: d.data().markedAt?.toDate() ?? new Date(),
    } as AttendanceRecord));
}

// --- 4.3 QR Token Logic ---

export function generateQRToken(sessionId: string, courseId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${sessionId}::${courseId}::${timestamp}::${random}`;
}

export function validateQRToken(scannedToken: string, sessionId: string, qrExpiresAt: Date): boolean {
    const parts = scannedToken.split('::');
    if (parts.length !== 4) return false;

    const tokenSessionId = parts[0];
    if (tokenSessionId !== sessionId) return false;

    if (new Date() > qrExpiresAt) return false;

    return true;
}

// --- 4.4 Student Scanning ---

export async function hasStudentScanned(sessionId: string, courseId: string, spaceId: string, studentUid: string): Promise<boolean> {
    const recordRef = doc(db, 'spaces', spaceId, 'courses', courseId, 'sessions', sessionId, 'records', studentUid);
    const snap = await getDoc(recordRef);
    return snap.exists();
}

export async function markPresent(
    sessionId: string,
    courseId: string,
    spaceId: string,
    studentUid: string,
    studentName: string,
    regNumber: string
): Promise<void> {
    // 1. Check if session is active
    const sessionRef = doc(db, 'spaces', spaceId, 'courses', courseId, 'sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    if (!sessionSnap.exists() || !sessionSnap.data().isActive) {
        throw new Error('Session is no longer active');
    }

    // 2. Check if student already scanned
    if (await hasStudentScanned(sessionId, courseId, spaceId, studentUid)) {
        throw new Error('You have already been marked present for this session');
    }

    // 3. Verify course membership
    const memberRef = doc(db, 'spaces', spaceId, 'courses', courseId, 'members', studentUid);
    const memberSnap = await getDoc(memberRef);
    if (!memberSnap.exists()) {
        throw new Error('You are not a member of this course');
    }

    // 4. Anti-spoofing: Lecturer cannot mark themselves
    if (studentUid === sessionSnap.data().initiatedBy) {
        throw new Error('Lecturers cannot mark themselves present');
    }

    const batch = writeBatch(db);

    // Create record
    const recordRef = doc(db, 'spaces', spaceId, 'courses', courseId, 'sessions', sessionId, 'records', studentUid);
    batch.set(recordRef, {
        sessionId,
        courseId,
        spaceId,
        studentUid,
        studentName,
        regNumber,
        markedAt: serverTimestamp(),
        method: 'qr_scan',
        isPresent: true,
    } as AttendanceRecord);

    // Increment session count
    batch.update(sessionRef, {
        presentCount: (sessionSnap.data().presentCount || 0) + 1
    });

    await batch.commit();
}

// --- 4.5 Student Summary ---

export async function getStudentAttendanceSummary(
    courseId: string,
    spaceId: string,
    studentUid: string
): Promise<StudentAttendanceSummary | null> {
    // 1. Get all closed sessions for the course
    const sessionsRef = collection(db, 'spaces', spaceId, 'courses', courseId, 'sessions');
    const q = query(sessionsRef, where('isActive', '==', false));
    const sessionsSnap = await getDocs(q);

    if (sessionsSnap.empty) return null;

    const totalSessions = sessionsSnap.size;
    let attendedCount = 0;
    const sessionDates: any[] = [];

    // 2. Fetch course data for name/code
    const courseRef = doc(db, 'spaces', spaceId, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    const courseData = courseSnap.data();

    // 3. For each session, check if student has a record
    for (const sDoc of sessionsSnap.docs) {
        const recordSnap = await getDoc(doc(db, 'spaces', spaceId, 'courses', courseId, 'sessions', sDoc.id, 'records', studentUid));
        const isPresent = recordSnap.exists();
        if (isPresent) attendedCount++;

        sessionDates.push({
            date: sDoc.data().date?.toDate().toISOString().split('T')[0],
            sessionId: sDoc.id,
            isPresent
        });
    }

    return {
        courseId,
        courseCode: courseData?.fullCode || '',
        courseName: courseData?.courseName || '',
        studentUid,
        totalSessions,
        attendedSessions: attendedCount,
        attendanceRate: totalSessions > 0 ? (attendedCount / totalSessions) * 100 : 0,
        sessionDates
    };
}

export async function getAllCourseAttendanceSummaries(spaceId: string, studentUid: string): Promise<StudentAttendanceSummary[]> {
    // Implementation would iterate through user's courses
    // For MVP, we'll fetch summaries for enabled courses
    const coursesSnap = await getDocs(collection(db, 'spaces', spaceId, 'courses'));
    const summaries: StudentAttendanceSummary[] = [];

    for (const cDoc of coursesSnap.docs) {
        const settings = await getAttendanceSettings(cDoc.id, spaceId);
        if (settings.isEnabled) {
            const summary = await getStudentAttendanceSummary(cDoc.id, spaceId, studentUid);
            if (summary) summaries.push(summary);
        }
    }
    return summaries;
}

// --- 4.6 Excel Export ---

export async function exportAttendanceToExcel(
    courseId: string,
    spaceId: string,
    courseName: string,
    courseCode: string
): Promise<void> {
    try {
        // 1. Get all students in the course
        const membersSnap = await getDocs(collection(db, 'spaces', spaceId, 'courses', courseId, 'members'));

        // 2. Get all sessions
        const sessions = await getSessionsByCourse(courseId, spaceId);
        sessions.reverse(); // Chronological order

        // 3. Header row
        const dates = sessions.map(s => s.date instanceof Date ? s.date.toLocaleDateString() : 'N/A');
        const header = ['Reg Number', 'Student Name', ...dates, 'Total Present', 'Total Sessions', 'Attendance %'];

        const dataRows: any[][] = [header];

        // 4. Fill student data
        for (const mDoc of membersSnap.docs) {
            const mData = mDoc.data();
            // Fetch student profile for name/reg if needed (assuming stored in member doc for simplicity here)
            // Actually, we should fetch from users collection to be safe
            const userSnap = await getDoc(doc(db, 'users', mDoc.id));
            const userData = userSnap.data();

            if (!userData) continue;

            const row = [userData.regNumber || '—', userData.fullName || '—'];
            let presentCount = 0;

            for (const session of sessions) {
                const recordSnap = await getDoc(doc(db, 'spaces', spaceId, 'courses', courseId, 'sessions', session.id, 'records', mDoc.id));
                const present = recordSnap.exists();
                if (present) presentCount++;
                row.push(present ? 'P' : '-');
            }

            row.push(presentCount);
            row.push(sessions.length);
            const rate = sessions.length > 0 ? (presentCount / sessions.length) * 100 : 0;
            row.push(`${rate.toFixed(1)}%`);

            dataRows.push(row);
        }

        // 5. Create workbook
        const ws = XLSX.utils.aoa_to_sheet(dataRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `${courseCode} Attendance`);

        // 6. Generate file
        const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        const uri = `${FileSystem.cacheDirectory}ClassSync_${courseCode}_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`;

        await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 });

        // 7. Share
        await Sharing.shareAsync(uri);

    } catch (error) {
        console.error('Export failed:', error);
        throw error;
    }
}
