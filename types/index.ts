export type UserRole = 'student' | 'monitor' | 'assistant_monitor' | 'lecturer';

export interface User {
    uid: string;
    fullName: string;
    email: string;
    university: string;
    role: UserRole;
    username: string;
    createdAt: Date;
    fcmToken?: string;
    deviceId?: string; // Phase 1: Anti-fraud device binding

    // Denormalized enrollment for Spark-optimized feed queries
    primarySpaceId?: string;
    enrolledCourses: Array<{
        courseId: string;
        spaceId: string;
        enrolledAt: Date;
        autoJoined: boolean;
    }>;
    
    carryoverEnrollments: Array<{
        courseId: string;
        spaceId: string;
        enrolledAt: Date;
        status: 'active' | 'dropped' | 'muted';
    }>;
    
    preferences: {
        autoJoinNewCourses: boolean; // Default: true
        dataSaver: boolean;          // NEW: Task 6 - Prevent auto-downloads on mobile data
        notificationPrefs: Record<string, boolean>; // global or per course/space
    };
}

export interface Space {
    id: string;
    name: string;
    university: string;
    department: string;
    programme: string;
    entryYear: string;
    spaceCode: string;
    monitorUid: string;
    assistantMonitorUid?: string;
    memberCount: number;
    createdAt: Date;
}

export interface CourseMember {
    uid: string;
    fullName?: string;
    role: UserRole;
    joinedAt: Date;
    isCarryover: boolean;
    accepted: boolean;
    acceptDeadline?: Date;
}

export interface Course {
    id: string;
    spaceId: string;
    courseName: string;
    courseCode: string;
    fullCode: string;
    lecturerUid?: string;
    lecturerName?: string;
    isCarryover?: boolean;
    accepted?: boolean;
    allowCarryover?: boolean; // NEW: Enable/Disable carryover joining
    isGeneral?: boolean;      // NEW: If true, posts appear in all feeds in this space
    createdAt: Date;
}

export type PostType = 'lecture' | 'assignment' | 'test' | 'note' | 'announcement' | 'cancellation' | 'attendance';
export type LectureStatus = 'scheduled' | 'cancelled' | 'rescheduled';

export interface Post {
    id: string;
    spaceId: string;
    courseId: string | 'GENERAL'; // Updated to support Space-wide notifications
    courseCode: string;
    type: PostType;
    title: string;
    description?: string;
    authorUid: string;
    authorName: string;
    authorRole: UserRole;
    createdAt: Date;
    lectureDate?: Date;
    startTime?: string;
    endTime?: string;
    venue?: string;
    lectureStatus?: LectureStatus;
    dueDate?: Date;
    marks?: number;
    topics?: string;
    linkedPostId?: string;
    isCarryover?: boolean;
    isImportant?: boolean;
    isPinned?: boolean;
    readCount?: number;
}

export interface AppNotification {
    id: string;
    uid: string;
    title: string;
    body: string;
    postId?: string;
    spaceId?: string;
    courseId?: string;
    type: PostType | 'course_added' | 'course_auto_added' | 'lecturer_assigned';
    isRead: boolean;
    isCarryover: boolean;
    createdAt: Date;
}

export interface AlarmSetting {
  postId: string;
  courseCode: string;
  venueName: string;
  lectureDate: Date;
  startTime: string;       // "10:00 AM"
  leadMinutes: number;     // default 30
  alarmId?: string;        // returned by expo-calendar after creation
}

// Phase 3: Proximity Attendance Verification Types

// How attendance was verified
export type VerificationMethod = 'ble' | 'wifi' | 'code' | 'manual';

// Signal strength reading
export interface ProximityReading {
  method: VerificationMethod;
  rssi?: number;           // BLE signal strength in dBm (e.g. -65)
  ssid?: string;           // WiFi network name
  bssid?: string;          // WiFi router unique ID
  matchedMonitorBssid?: boolean;
}

// BLE session beacon data
export interface AttendanceBeacon {
  sessionId: string;
  spaceId: string;
  courseId: string;
  serviceUUID: string;    // unique UUID per session
  startedAt: Date;
}

// Student-side proximity scan result
export interface ProximityScanResult {
  detected: boolean;
  method?: VerificationMethod;
  rssi?: number;
  signalStrength?: 'strong' | 'medium' | 'weak';  // derived from RSSI
  reading?: ProximityReading;
}

export interface AttendanceSession {
  id: string;
  spaceId: string;
  courseId: string;
  courseCode: string;
  courseName?: string;       // Added for compatibility
  lectureName: string;
  lectureDate: Date;
  code: string;              // 6-digit code or QR token
  codeExpiresAt: Date;       // when the current code/token expires
  qrToken?: string;          // Alias for code in some screens
  qrExpiresAt?: Date;        // Alias for codeExpiresAt in some screens
  isOpen: boolean;
  isActive?: boolean;        // Alias for isOpen
  openedAt: Date;
  closedAt?: Date;
  openedByUid: string;
  totalMembers: number;
  presentCount: number;
  serviceUUID: string;       // unique BLE UUID for this session
  monitorSsid?: string;      // Monitor's WiFi network name at session start
  proximityEnabled: boolean; // whether proximity verification is active
}

export interface AttendanceRecord {
  uid: string;
  fullName: string;
  username?: string;
  markedAt: Date;
  isPresent: boolean;
  isCarryover: boolean;
  verificationMethod: VerificationMethod;
  proximityReading?: ProximityReading;
  isFlagged?: boolean;
}

export interface CourseAttendanceSettings {
  courseId: string;
  isEnabled: boolean;
  requireRegNumber?: boolean;
}

export type AttendanceStatus = 'present' | 'absent' | 'not_taken'

export interface CourseMaterial {
  id: string;
  courseId: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedByUid: string;
  uploadedByName: string;
  isPinned: boolean;
  storagePath?: string;
}

export interface ReadReceipt {
  uid: string;
  fullName: string;
  readAt: Date;
}

/**
 * Optimized Feed structure for client-side aggregation
 */
export interface FeedPost extends Post {
    isCarryover: boolean;
    spaceName: string;
    courseCode: string;
}
