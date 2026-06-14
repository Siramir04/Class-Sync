import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { personalCourseService } from '../services/personalCourseService';
import { PersonalCourse } from '../types';

interface PersonalCourseState {
  courses: PersonalCourse[];
  activeCourse: PersonalCourse | null;
  isLoading: boolean;
  error: string | null;

  fetchCourses: (ownerId: string) => Promise<void>;
  setActiveCourse: (course: PersonalCourse | null) => void;
  createCourse: (data: Parameters<typeof personalCourseService.create>[0]) => Promise<string>;
  archiveCourse: (courseId: string) => Promise<void>;
  markAttendance: (courseId: string, record: Parameters<typeof personalCourseService.markAttendance>[1]) => Promise<void>;
  addAssignment: (courseId: string, assignment: Parameters<typeof personalCourseService.addAssignment>[1]) => Promise<void>;
  toggleAssignment: (courseId: string, assignmentId: string) => Promise<void>;
  addMaterial: (courseId: string, material: Parameters<typeof personalCourseService.addMaterial>[1]) => Promise<void>;
  cleanup: () => void;
}

export const usePersonalCourseStore = create<PersonalCourseState>()(
  persist(
    (set, get) => ({
      courses: [],
      activeCourse: null,
      isLoading: false,
      error: null,

      fetchCourses: async (ownerId) => {
        set({ isLoading: true, error: null });
        try {
          const courses = await personalCourseService.getByOwner(ownerId);
          set({ courses, isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      setActiveCourse: (course) => set({ activeCourse: course }),

      createCourse: async (data) => {
        const id = await personalCourseService.create(data);
        const newCourse = await personalCourseService.getById(id);
        if (newCourse) {
          set({ courses: [newCourse, ...get().courses] });
        }
        return id;
      },

      archiveCourse: async (courseId) => {
        await personalCourseService.archive(courseId);
        set({
          courses: get().courses.filter(c => c.id !== courseId),
          activeCourse: get().activeCourse?.id === courseId ? null : get().activeCourse,
        });
      },

      markAttendance: async (courseId, record) => {
        await personalCourseService.markAttendance(courseId, record);
        const updated = await personalCourseService.getById(courseId);
        if (updated) {
          set({
            courses: get().courses.map(c => c.id === courseId ? updated : c),
            activeCourse: get().activeCourse?.id === courseId ? updated : get().activeCourse,
          });
        }
      },

      addAssignment: async (courseId, assignment) => {
        await personalCourseService.addAssignment(courseId, assignment);
        const updated = await personalCourseService.getById(courseId);
        if (updated) {
          set({
            courses: get().courses.map(c => c.id === courseId ? updated : c),
            activeCourse: get().activeCourse?.id === courseId ? updated : get().activeCourse,
          });
        }
      },

      toggleAssignment: async (courseId, assignmentId) => {
        await personalCourseService.toggleAssignmentComplete(courseId, assignmentId);
        const updated = await personalCourseService.getById(courseId);
        if (updated) {
          set({
            courses: get().courses.map(c => c.id === courseId ? updated : c),
            activeCourse: get().activeCourse?.id === courseId ? updated : get().activeCourse,
          });
        }
      },

      addMaterial: async (courseId, material) => {
        await personalCourseService.addMaterial(courseId, material);
        const updated = await personalCourseService.getById(courseId);
        if (updated) {
          set({
            courses: get().courses.map(c => c.id === courseId ? updated : c),
            activeCourse: get().activeCourse?.id === courseId ? updated : get().activeCourse,
          });
        }
      },

      cleanup: () => set({ courses: [], activeCourse: null, isLoading: false, error: null }),
    }),
    {
      name: 'personal-courses-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
