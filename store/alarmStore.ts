import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AlarmState {
  alarms: Record<string, string>;   // postId → calendarEventId
  setAlarm: (postId: string, eventId: string) => void;
  removeAlarm: (postId: string) => void;
  isAlarmSet: (postId: string) => boolean;
}

export const useAlarmStore = create<AlarmState>()(
  persist(
    (set, get) => ({
      alarms: {},
      setAlarm: (postId, eventId) => 
        set((state) => ({
          alarms: { ...state.alarms, [postId]: eventId }
        })),
      removeAlarm: (postId) =>
        set((state) => {
          const newAlarms = { ...state.alarms };
          delete newAlarms[postId];
          return { alarms: newAlarms };
        }),
      isAlarmSet: (postId) => !!get().alarms[postId],
    }),
    {
      name: 'alarm-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
