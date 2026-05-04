import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Space, Course } from '../types';

interface SpaceState {
    spaces: Space[];
    activeSpaceId: string | null;
    carryoverCourses: Course[];
    setSpaces: (spaces: Space[]) => void;
    setActiveSpaceId: (id: string | null) => void;
    setCarryoverCourses: (courses: Course[]) => void;
    addSpace: (space: Space) => void;
    removeSpace: (spaceId: string) => void;
    cleanup: () => void;
}

export const useSpaceStore = create<SpaceState>()(
    persist(
        (set) => ({
            spaces: [],
            activeSpaceId: null,
            carryoverCourses: [],
            setSpaces: (spaces) => set({ spaces }),
            setActiveSpaceId: (activeSpaceId) => set({ activeSpaceId }),
            setCarryoverCourses: (carryoverCourses) => set({ carryoverCourses }),
            addSpace: (space) =>
                set((state) => ({ spaces: [...state.spaces, space] })),
            removeSpace: (spaceId) =>
                set((state) => ({
                    spaces: state.spaces.filter((s) => s.id !== spaceId),
                })),
            cleanup: () => set({ spaces: [], activeSpaceId: null, carryoverCourses: [] }),
        }),
        {
            name: 'space-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
