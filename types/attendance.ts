export interface AttendanceSession {
    id: string;
    courseId: string;
    spaceId: string;
    courseCode: string;
    courseName: string;
    initiatedBy: string;          // uid of Lecturer or Monitor who started it
    initiatedByName: string;
    date: Date | any;             // Firebase Timestamp or Date
    startTime: string;            // "HH:mm"
    endTime?: string;             // set when session is closed
    isActive: boolean;            // true = QR is live, false = session closed
    qrToken: string;              // unique token embedded in QR — changes every 60 seconds
    qrExpiresAt: Date | any;      // when the current token expires
    totalMembers: number;         // snapshot of course member count at session start
    presentCount: number;         // live count of scanned students
}

export interface AttendanceRecord {
    id: string;
    sessionId: string;
    courseId: string;
    spaceId: string;
    studentUid: string;
    studentName: string;
    regNumber: string;            // student's registration number
    markedAt: Date | any;
    method: 'qr_scan';
    isPresent: boolean;
}

export interface StudentAttendanceSummary {
    courseId: string;
    courseCode: string;
    courseName: string;
    studentUid: string;
    totalSessions: number;
    attendedSessions: number;
    attendanceRate: number;       // percentage 0–100
    sessionDates: AttendanceDateEntry[];
}

export interface AttendanceDateEntry {
    date: string;                 // ISO date string "YYYY-MM-DD"
    sessionId: string;
    isPresent: boolean;
}

export interface CourseAttendanceSettings {
    courseId: string;
    isEnabled: boolean;           // master toggle for attendance feature
    requireRegNumber: boolean;    // whether reg number is mandatory on student profile
}
