# ClassSync Identity & RBAC Documentation

This document outlines the identity system and Role-Based Access Control (RBAC) architecture implemented in ClassSync v2.5+.

## 1. Identity System: Username-Based Migration

ClassSync has transitioned from using legacy registration numbers (`regNumber`) to a global **Username** system. 

### Key Characteristics:
- **Identifier**: `username` (Global across the app).
- **UID**: Firebase Auth UID (Internal).
- **User Record**: Stored in Firestore `/users/{uid}`.
- **Unified Attendance**: All attendance records (`AttendanceRecord`) now map student entries via their `uid` while surfacing their `username` for display and export.

---

## 2. Role-Based Access Control (RBAC)

ClassSync uses a **Space-Level Permission Model**. A user's role is defined per Space they join, stored in `/spaces/{spaceId}/members/{uid}`.

### The Four Core Roles:

#### 1. Monitor (Space Owner / Class Rep)
The most powerful role in a Space. Owns the space and handles all administration.
- **Space Management**: Create space, edit space info, delete space (exclusive).
- **Membership**: Add/Remove members, promote Students to Asst. Monitors.
- **Attendance**: Toggle attendance per course, start/stop live sessions, export reports to Excel.
- **Content**: Create/Pin/Delete any post (lectures, assignments, tests, announcements).

#### 2. Assistant Monitor (Co-Admin)
Helps the Monitor manage the space but with safety restrictions.
- **Space Management**: View settings, manage members (except the Monitor). **Cannot** delete the space or transfer ownership.
- **Attendance**: Can start/stop live sessions and view reports.
- **Content**: Create/Pin/Delete any post.

#### 3. Lecturer
A specialized role focused on content delivery for specifically assigned courses.
- **Course Focus**: Only sees administration options for courses assigned to them.
- **Content**: Can create posts and upload materials ONLY for their courses.
- **Attendance**: Can view/start attendance for their assigned courses.
- **Restrictions**: Cannot manage space members or global space settings.

#### 4. Student (Consumer)
The primary user of the platform.
- **Content**: Can view all posts, download materials, and set alarms.
- **Attendance**: Can join attendance sessions via QR scan or 6-digit code.
- **Interaction**: Can create "Note" type posts (if enabled by Monitor) or share resources in specific course feeds.
- **Restrictions**: Cannot see any management or reporting screens.

---

## 3. Technical Implementation: `useSpaceRole` Hook

Permissions are enforced in the UI via a centralized React Hook:

```typescript
const { 
  role, 
  canManageSpace, 
  canStartAttendance, 
  canUploadMaterials, 
  isMonitor 
} = useSpaceRole(spaceId);
```

### Permission Logic Table:

| Action | Monitor | Asst. Monitor | Lecturer | Student |
| :--- | :---: | :---: | :---: | :---: |
| Delete Space | ✅ | ❌ | ❌ | ❌ |
| Start Attendance | ✅ | ✅ | ✅ (Own Course) | ❌ |
| Remove Member | ✅ | ✅ | ❌ | ❌ |
| Create Post | ✅ | ✅ | ✅ (Own Course) | ✅ (Notes) |
| Pin Post | ✅ | ✅ | ✅ (Own) | ❌ |
| Export Excel | ✅ | ✅ | ✅ (Own Course) | ❌ |

---

## 4. UI Enforcement Standards

- **Badge System**: All posts show a role-colored badge for transparency:
  - **Monitor**: `#1A3C6E` (Dark Navy)
  - **Asst. Monitor**: `#64748B` (Slate)
  - **Lecturer**: `#10B981` (Green)
- **Conditional Layouts**: Management buttons (Settings icon, "Plus" button for attendance) are hidden or disabled dynamically based on the hook's return value.

---

> [!NOTE]
> **Data Integrity**: When a student joins a session, a corresponding `AttendanceRecord` is created in `/spaces/{spaceId}/courses/{courseId}/attendance/{sessionId}/records/{uid}`. This ensures that even if a student changes their display name, the attendance history remains linked to their account.
