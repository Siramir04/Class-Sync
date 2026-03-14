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
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AttendanceSession, AttendanceRecord, VerificationMethod, ProximityReading } from '../types';
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
    codeExpiresAt: codeExpiresAt,
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
    if (new Date() > new Date(sessionData.codeExpiresAt)) throw new Error('Code expired');
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

/**
 * PHASE 3: Monitor manual override for flagged records.
 * Updates verification method to 'manual' and removes flagging.
 */
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
  
  // Update session status
  await updateDoc(sessionRef, {
    isOpen: false,
    closedAt: serverTimestamp(),
  });

  // Mark others absent
  // 1. Get all course members
  const membersRef = collection(db, `spaces/${spaceId}/courses/${courseId}/members`);
  const membersSnap = await getDocs(membersRef);
  
  // 2. Get present records
  const recordsRef = collection(db, RECORDS_COLLECTION(spaceId, courseId, sessionId));
  const recordsSnap = await getDocs(recordsRef);
  const presentUids = new Set(recordsSnap.docs.map(doc => doc.id));

  // 3. Create absent records for non-present members
  for (const memberDoc of membersSnap.docs) {
    if (!presentUids.has(memberDoc.id)) {
      const memberData = memberDoc.data();
      const record: AttendanceRecord = {
        uid: memberDoc.id,
        fullName: memberData.fullName || 'Unknown Student',
        markedAt: new Date(),
        isPresent: false,
        isCarryover: memberData.isCarryover || false,
        verificationMethod: 'manual', // Default for absent/closed
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
  return snap.docs.map(doc => doc.data() as AttendanceSession);
};

export const subscribeToRecords = (
  spaceId: string, 
  courseId: string, 
  sessionId: string, 
  callback: (records: AttendanceRecord[]) => void
) => {
  const recordsRef = collection(db, RECORDS_COLLECTION(spaceId, courseId, sessionId));
  const q = query(recordsRef, orderBy('markedAt', 'desc'));
  
  return onSnapshot(q, (snap) => {
    const records = snap.docs.map(doc => doc.data() as AttendanceRecord);
    callback(records);
  });
};

export const getUserAttendanceStats = async (uid: string, spaceId: string, courseId: string) => {
  const sessionsRef = collection(db, SESSIONS_COLLECTION(spaceId, courseId));
  const sessionsSnap = await getDocs(sessionsRef);
  const totalSessions = sessionsSnap.docs.filter(d => !d.data().isOpen).length;

  let presentCount = 0;
  for (const sessionDoc of sessionsSnap.docs) {
    if (sessionDoc.data().isOpen) continue;
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
