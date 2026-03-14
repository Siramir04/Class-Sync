import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { subMinutes } from 'date-fns';
import { AlarmSetting } from '../types';

export const requestCalendarPermission = async (): Promise<boolean> => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (Platform.OS === 'ios') {
    await Calendar.requestRemindersPermissionsAsync();
  }
  return status === 'granted';
};

export const getOrCreateClassSyncCalendar = async (): Promise<string> => {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const existing = calendars.find(c => c.title === 'ClassSync');
  if (existing) return existing.id;

  const defaultCalendar = await Calendar.getDefaultCalendarAsync();
  const calendarId = await Calendar.createCalendarAsync({
    title: 'ClassSync',
    color: '#2563EB',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: defaultCalendar.source?.id,
    source: defaultCalendar.source,
    name: 'ClassSync',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
  return calendarId;
};

export const setClassAlarm = async (alarm: AlarmSetting): Promise<string> => {
  const hasPermission = await requestCalendarPermission();
  if (!hasPermission) throw new Error('Calendar permission denied');

  const calendarId = await getOrCreateClassSyncCalendar();

  // Parse lecture datetime
  // Expected format: "10:00 AM" or "02:30 PM"
  const timeRegex = /(\d{1,2}):(\d{2})\s?(AM|PM)/i;
  const match = alarm.startTime.match(timeRegex);
  
  if (!match) throw new Error('Invalid start time format');

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3].toUpperCase();

  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  
  const lectureDateTime = new Date(alarm.lectureDate);
  lectureDateTime.setHours(hours, minutes, 0, 0);

  const alarmTime = subMinutes(lectureDateTime, alarm.leadMinutes);

  const eventId = await Calendar.createEventAsync(calendarId, {
    title: `📚 ${alarm.courseCode}`,
    notes: `ClassSync — ${alarm.venueName}`,
    startDate: alarmTime,
    endDate: lectureDateTime,
    alarms: [{ relativeOffset: 0 }],    // alarm at event start = lead time before lecture
    timeZone: 'Africa/Lagos',
  });

  return eventId;
};

export const removeClassAlarm = async (eventId: string): Promise<void> => {
  try {
    await Calendar.deleteEventAsync(eventId);
  } catch (error) {
    console.error('Failed to remove alarm:', error);
  }
};
