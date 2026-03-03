export type UserRole = 'student' | 'monitor' | 'assistant_monitor' | 'lecturer';

export interface User {
    uid: string;
    fullName: string;
    email: string;
    university: string;
    role: UserRole;
    regNumber?: string;
    createdAt: Date;
    fcmToken?: string;
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
    createdAt: Date;
}

export type PostType = 'lecture' | 'assignment' | 'test' | 'note' | 'announcement' | 'cancellation' | 'attendance';
export type LectureStatus = 'scheduled' | 'cancelled' | 'rescheduled';

export interface Post {
    id: string;
    spaceId: string;
    courseId: string;
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
