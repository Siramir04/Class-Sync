import {
  collection, doc, setDoc, getDoc, getDocs, query, where, orderBy,
  updateDoc, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  PersonalCourse, PersonalScheduleItem, PersonalAssignment,
  PersonalMaterial, PersonalAttendanceRecord
} from '../types';

const COLLECTION = 'personalCourses';

// Helper: Firestore Timestamp → Date
const toDate = (field: unknown): Date => {
  if (field instanceof Timestamp) return field.toDate();
  if (field && typeof field === 'object' && 'toDate' in field) return (field as Timestamp).toDate();
  return new Date(field as string);
};

// Helper: Convert raw Firestore data to typed PersonalCourse
const toCourse = (id: string, data: Record<string, any>): PersonalCourse => ({
  id,
  ownerId: data.ownerId,
  name: data.name,
  description: data.description,
  color: data.color,
  icon: data.icon,
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
  isArchived: Boolean(data.isArchived),
  schedule: (data.schedule || []).map((s: any) => ({ ...s })),
  assignments: (data.assignments || []).map((a: any) => ({
    ...a,
    dueDate: toDate(a.dueDate),
    createdAt: toDate(a.createdAt),
  })),
  materials: (data.materials || []).map((m: any) => ({
    ...m,
    createdAt: toDate(m.createdAt),
  })),
  attendance: (data.attendance || []).map((a: any) => ({
    ...a,
    date: toDate(a.date),
  })),
});

export const personalCourseService = {
  // CREATE
  create: async (
    data: Omit<PersonalCourse, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>
  ): Promise<string> => {
    const ref = doc(collection(db, COLLECTION));
    const now = serverTimestamp();
    await setDoc(ref, {
      ...data,
      id: ref.id,
      createdAt: now,
      updatedAt: now,
      isArchived: false,
    });
    return ref.id;
  },

  // READ ALL (by owner, non-archived, newest first)
  getByOwner: async (ownerId: string): Promise<PersonalCourse[]> => {
    const q = query(
      collection(db, COLLECTION),
      where('ownerId', '==', ownerId),
      where('isArchived', '==', false),
      orderBy('updatedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => toCourse(d.id, d.data()));
  },

  // READ ONE
  getById: async (courseId: string): Promise<PersonalCourse | null> => {
    const snap = await getDoc(doc(db, COLLECTION, courseId));
    if (!snap.exists()) return null;
    return toCourse(snap.id, snap.data());
  },

  // UPDATE (partial)
  update: async (
    courseId: string,
    updates: Partial<Omit<PersonalCourse, 'id' | 'ownerId'>>
  ): Promise<void> => {
    await updateDoc(doc(db, COLLECTION, courseId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // ARCHIVE (soft delete)
  archive: async (courseId: string): Promise<void> => {
    await updateDoc(doc(db, COLLECTION, courseId), {
      isArchived: true,
      updatedAt: serverTimestamp(),
    });
  },

  // ── ATTENDANCE ──────────────────────────────────────────────

  markAttendance: async (
    courseId: string,
    record: Omit<PersonalAttendanceRecord, 'selfMarked'>
  ): Promise<void> => {
    const courseRef = doc(db, COLLECTION, courseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) throw new Error('Course not found');

    const data = courseSnap.data();
    const attendance = (data.attendance || []) as PersonalAttendanceRecord[];
    const existingIndex = attendance.findIndex(a => a.id === record.id);

    const newRecord: PersonalAttendanceRecord = { ...record, selfMarked: true };

    if (existingIndex >= 0) {
      attendance[existingIndex] = newRecord;
    } else {
      attendance.push(newRecord);
    }

    await updateDoc(courseRef, {
      attendance,
      updatedAt: serverTimestamp(),
    });
  },

  // ── ASSIGNMENTS ─────────────────────────────────────────────

  addAssignment: async (
    courseId: string,
    assignment: Omit<PersonalAssignment, 'id' | 'createdAt'>
  ): Promise<void> => {
    const courseRef = doc(db, COLLECTION, courseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) throw new Error('Course not found');

    const data = courseSnap.data();
    const assignments = (data.assignments || []) as PersonalAssignment[];
    assignments.push({
      ...assignment,
      id: Math.random().toString(36).slice(2),
      createdAt: new Date(),
    });

    await updateDoc(courseRef, { assignments, updatedAt: serverTimestamp() });
  },

  toggleAssignmentComplete: async (
    courseId: string,
    assignmentId: string
  ): Promise<void> => {
    const courseRef = doc(db, COLLECTION, courseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) throw new Error('Course not found');

    const data = courseSnap.data();
    const assignments = (data.assignments || []) as PersonalAssignment[];
    const idx = assignments.findIndex(a => a.id === assignmentId);
    if (idx >= 0) {
      assignments[idx].isCompleted = !assignments[idx].isCompleted;
      await updateDoc(courseRef, { assignments, updatedAt: serverTimestamp() });
    }
  },

  // ── MATERIALS ───────────────────────────────────────────────

  addMaterial: async (
    courseId: string,
    material: Omit<PersonalMaterial, 'id' | 'createdAt'>
  ): Promise<void> => {
    const courseRef = doc(db, COLLECTION, courseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) throw new Error('Course not found');

    const data = courseSnap.data();
    const materials = (data.materials || []) as PersonalMaterial[];
    materials.push({
      ...material,
      id: Math.random().toString(36).slice(2),
      createdAt: new Date(),
    });

    await updateDoc(courseRef, { materials, updatedAt: serverTimestamp() });
  },
};
