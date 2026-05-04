import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  increment,
  runTransaction,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AttendanceSession, AttendanceRecord, VerificationMethod, ProximityReading, CourseAttendanceSettings } from '../types';
import { generateAttendanceCode } from '../utils/generateCode';
import { proximityService } from './proximityService';
import * as Crypto from 'expo-crypto';

const SESSIONS_COLLECTION = (spaceId: string, courseId: string) => 
  `spaces/${spaceId}/courses/${courseId}/attendance`;

const RECORDS_COLLECTION = (spaceId: string, courseId: string, sessionId: string) => 
  `spaces/${spaceId}/courses/${courseId}/attendance/${sessionId}/records`;

export const startSession = async (
  spaceId: string, 
  courseId: string, 
  courseCode: string,
  lectureName: string, 
  openedByUid: string,
  totalMembers: number
): Promise<string> => {
  const sessionId = doc(collection(db, 'dummy')).id;
  const code = generateAttendanceCode();
  const openedAt = new Date();
  const codeExpiresAt = new Date(openedAt.getTime() + 10 * 60 * 1000); // 10 minutes

  // Phase 3: Generate unique BLE service UUID and get Monitor WiFi SSID
  const serviceUUID = Crypto.randomUUID();
  const wifiInfo = await proximityService.getWifiInfo();

  const sessionData: AttendanceSession = {
    id: sessionId,
    spaceId,
    courseId,
    courseCode,
    lectureName,
    lectureDate: openedAt,
    code,
    codeExpiresAt,
    isOpen: true,
    openedAt,
    openedByUid,
    totalMembers,
    presentCount: 0,
    serviceUUID,
    monitorSsid: wifiInfo.ssid || undefined,
    proximityEnabled: true,
  };

  await setDoc(doc(db, SESSIONS_COLLECTION(spaceId, courseId), sessionId), {
    ...sessionData,
    openedAt: serverTimestamp(),
    lectureDate: serverTimestamp(),
    codeExpiresAt: Timestamp.fromDate(codeExpiresAt),
  });

  return sessionId;
};

export const markAttendance = async (
  spaceId: string, 
  courseId: string, 
  sessionId: string, 
  code: string, 
  uid: string,
  fullName: string,
  isCarryover: boolean,
  verificationMethod: VerificationMethod,
  proximityReading?: ProximityReading
): Promise<void> => {
  const sessionRef = doc(db, SESSIONS_COLLECTION(spaceId, courseId), sessionId);
  const recordRef = doc(db, RECORDS_COLLECTION(spaceId, courseId, sessionId), uid);

  await runTransaction(db, async (transaction) => {
    const sessionDoc = await transaction.get(sessionRef);
    if (!sessionDoc.exists()) throw new Error('Session not found');

    const sessionData = sessionDoc.data() as AttendanceSession;
    if (!sessionData.isOpen) throw new Error('Session closed');

    // DEFENSIVE: Compare against Firestore Server-side metadata if available
    // Otherwise, we use the session's codeExpiresAt which is a Timestamp in Firestore
    const expiryDate = (sessionData.codeExpiresAt as any).toDate?.() || new Date(sessionData.codeExpiresAt);

    // Note: To truly fix clock spoofing, we'd need a Cloud Function or a server-time lookup.
    // For now, we at least ensure we're comparing against the Firestore-stored expiry.
    if (new Date() > expiryDate) {
        throw new Error('Code expired');
    }

    if (sessionData.code !== code) throw new Error('Invalid code');

    const recordDoc = await transaction.get(recordRef);
    if (recordDoc.exists()) throw new Error('Already marked');

    const record: AttendanceRecord = {
      uid,
      fullName,
      markedAt: new Date(),
      isPresent: true,
      isCarryover,
      verificationMethod,
      proximityReading: proximityReading || undefined,
      isFlagged: verificationMethod === 'code', // Flag code-only entries
    };

    transaction.set(recordRef, {
      ...record,
      markedAt: serverTimestamp(),
    });
    transaction.update(sessionRef, {
      presentCount: increment(1)
    });
  });
};

export const markPresent = markAttendance;

export const verifyAttendanceRecord = async (
  spaceId: string,
  courseId: string,
  sessionId: string,
  uid: string
): Promise<void> => {
  const recordRef = doc(db, RECORDS_COLLECTION(spaceId, courseId, sessionId), uid);
  await updateDoc(recordRef, {
    verificationMethod: 'manual',
    isFlagged: false,
  });
};

export const closeSession = async (spaceId: string, courseId: string, sessionId: string): Promise<void> => {
  const sessionRef = doc(db, SESSIONS_COLLECTION(spaceId, courseId), sessionId);
  
  // STOP BLE BROADCAST BEFORE CLOSING (Safety first)
  const sessionDoc = await getDoc(sessionRef);
  if (sessionDoc.exists()) {
      const data = sessionDoc.data() as AttendanceSession;
      if (data.serviceUUID) {
          await proximityService.stopBeaconBroadcast(data.serviceUUID).catch(() => {});
      }
  }

  await updateDoc(sessionRef, {
    isOpen: false,
    closedAt: serverTimestamp(),
  });

  const membersRef = collection(db, `spaces/${spaceId}/courses/${courseId}/members`);
  const membersSnap = await getDocs(membersRef);
  
  const recordsRef = collection(db, RECORDS_COLLECTION(spaceId, courseId, sessionId));
  const recordsSnap = await getDocs(recordsRef);
  const presentUids = new Set(recordsSnap.docs.map(doc => doc.id));

  for (const memberDoc of membersSnap.docs) {
    if (!presentUids.has(memberDoc.id)) {
      const memberData = memberDoc.data();
      const record: AttendanceRecord = {
        uid: memberDoc.id,
        fullName: memberData.fullName || 'Unknown Student',
        markedAt: new Date(),
        isPresent: false,
        isCarryover: memberData.isCarryover || false,
        verificationMethod: 'manual',
        isFlagged: false,
      };
      await setDoc(doc(db, RECORDS_COLLECTION(spaceId, courseId, sessionId), memberDoc.id), {
        ...record,
        markedAt: serverTimestamp(),
      });
    }
  }
};

export const getSessionHistory = async (spaceId: string, courseId: string) => {
  const sessionsRef = collection(db, SESSIONS_COLLECTION(spaceId, courseId));
  const q = query(sessionsRef, orderBy('lectureDate', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      lectureDate: doc.data().lectureDate?.toDate?.() || new Date(doc.data().lectureDate),
      codeExpiresAt: doc.data().codeExpiresAt?.toDate?.() || new Date(doc.data().codeExpiresAt),
    } as AttendanceSession));
};

export const getSessionsByCourse = getSessionHistory;

export const subscribeToRecords = (
  spaceId: string, 
  courseId: string, 
  sessionId: string, 
  callback: (records: AttendanceRecord[]) => void
) => {
  const recordsRef = collection(db, RECORDS_COLLECTION(spaceId, courseId, sessionId));
  const q = query(recordsRef, orderBy('markedAt', 'desc'));
  
  return onSnapshot(q, (snap) => {
    const records = snap.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id,
        markedAt: doc.data().markedAt?.toDate?.() || new Date(doc.data().markedAt)
    } as AttendanceRecord));
    callback(records);
  });
};

export const getUserAttendanceStats = async (uid: string, spaceId: string, courseId: string) => {
  const sessionsRef = collection(db, SESSIONS_COLLECTION(spaceId, courseId));
  const sessionsSnap = await getDocs(sessionsRef);
  
  const closedSessions = sessionsSnap.docs.filter(d => !d.data().isOpen);
  const totalSessions = closedSessions.length;

  let presentCount = 0;
  for (const sessionDoc of closedSessions) {
    const recordRef = doc(db, RECORDS_COLLECTION(spaceId, courseId, sessionDoc.id), uid);
    const recordSnap = await getDoc(recordRef);
    if (recordSnap.exists() && recordSnap.data().isPresent) {
      presentCount++;
    }
  }

  const percentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;
  return {
    present: presentCount,
    absent: totalSessions - presentCount,
    total: totalSessions,
    percentage: Math.round(percentage),
  };
};

export const getSessionRecords = async (spaceId: string, courseId: string, sessionId: string) => {
  const recordsRef = collection(db, RECORDS_COLLECTION(spaceId, courseId, sessionId));
  const snap = await getDocs(recordsRef);
  return snap.docs.map(doc => ({
    ...doc.data(),
    uid: doc.id,
    markedAt: doc.data().markedAt?.toDate() ?? new Date(),
  } as AttendanceRecord));
};

import * as XLSX from 'xlsx';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export const exportAttendanceToExcel = async (
  courseId: string, 
  spaceId: string, 
  courseName: string, 
  courseCode: string
) => {
  try {
    const sessions = await getSessionsByCourse(spaceId, courseId);
    const closedSessions = sessions.filter(s => !s.isOpen).sort((a, b) => 
      a.lectureDate.getTime() - b.lectureDate.getTime()
    );

    if (closedSessions.length === 0) {
      throw new Error('No closed sessions found to export.');
    }

    const membersRef = collection(db, `spaces/${spaceId}/courses/${courseId}/members`);
    const membersSnap = await getDocs(membersRef);
    
    const data: any[] = [];
    
    const header = ['Full Name', 'Username'];
    closedSessions.forEach(s => {
      header.push(s.lectureDate.toLocaleDateString());
    });
    header.push('Total Present');
    data.push(header);

    for (const mDoc of membersSnap.docs) {
      const userSnap = await getDoc(doc(db, 'users', mDoc.id));
      const userData = userSnap.data();
      if (!userData || userData.role !== 'student') continue;

      const row = [userData.fullName, userData.username || 'N/A'];
      let presentCount = 0;

      for (const session of closedSessions) {
        const recordSnap = await getDoc(doc(db, `spaces/${spaceId}/courses/${courseId}/attendance/${session.id}/records`, mDoc.id));
        const isPresent = recordSnap.exists() && recordSnap.data().isPresent;
        row.push(isPresent ? 'P' : 'A');
        if (isPresent) presentCount++;
      }

      row.push(presentCount.toString());
      data.push(row);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const fileName = `Attendance_${courseCode}_${new Date().getTime()}.xlsx`;
    const uri = (FileSystem.cacheDirectory || '') + fileName;

    await FileSystem.writeAsStringAsync(uri, wbout, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await Sharing.shareAsync(uri);

  } catch (error) {
    console.error('Excel Export Error:', error);
    throw error;
  }
};

export const refreshQRToken = async (sessionId: string, courseId: string, spaceId: string) => {
  const sessionRef = doc(db, SESSIONS_COLLECTION(spaceId, courseId), sessionId);
  const newToken = Crypto.randomUUID().slice(0, 8).toUpperCase();
  const expiresAt = new Date(Date.now() + 65 * 1000);
  
  await updateDoc(sessionRef, {
    code: newToken,
    codeExpiresAt: Timestamp.fromDate(expiresAt),
  });
  return { newToken, expiresAt };
};

export const validateQRToken = (scannedToken: string, sessionId: string, expiresAt: Date): boolean => {
  if (!scannedToken) return false;
  return new Date() < expiresAt;
};

export const hasStudentScanned = async (sessionId: string, courseId: string, spaceId: string, uid: string) => {
  const recordRef = doc(db, RECORDS_COLLECTION(spaceId, courseId, sessionId), uid);
  const snap = await getDoc(recordRef);
  return snap.exists();
};

export const getAttendanceSettings = async (courseId: string, spaceId: string): Promise<CourseAttendanceSettings> => {
  const settingsRef = doc(db, `spaces/${spaceId}/courses/${courseId}/settings`, 'attendance');
  const snap = await getDoc(settingsRef);
  if (snap.exists()) {
    return snap.data() as CourseAttendanceSettings;
  }
  return { courseId, isEnabled: false };
};

export const updateCourseAttendanceSettings = async (
  courseId: string, 
  spaceId: string, 
  settings: Partial<CourseAttendanceSettings>
) => {
  const settingsRef = doc(db, `spaces/${spaceId}/courses/${courseId}/settings`, 'attendance');
  await setDoc(settingsRef, settings, { merge: true });
};
