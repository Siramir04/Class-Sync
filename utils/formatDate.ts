import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, isPast, differenceInDays } from 'date-fns';

/**
 * Format a date for display in posts and cards.
 */
export function formatPostDate(date: Date): string {
    if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
    if (isYesterday(date)) return `Yesterday at ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, yyyy · h:mm a');
}

/**
 * Format a relative time label (e.g. "2 hours ago").
 */
export function formatRelativeTime(date: Date): string {
    return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format a date for the schedule view.
 */
export function formatScheduleDate(date: Date): string {
    return format(date, 'EEEE, MMMM d');
}

/**
 * Format time string for display.
 */
export function formatTime(time: string): string {
    return time;
}

/**
 * Get full day name and date string.
 */
export function getTodayLabel(): string {
    return format(new Date(), 'EEEE, MMMM d');
}

/**
 * Format a date as short day label for schedule strip.
 */
export function formatDayAbbrev(date: Date): string {
    return format(date, 'EEE');
}

/**
 * Format date number.
 */
export function formatDateNumber(date: Date): string {
    return format(date, 'd');
}
