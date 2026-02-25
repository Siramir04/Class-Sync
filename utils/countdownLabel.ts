import { differenceInDays, differenceInHours, isPast, isToday, isTomorrow } from 'date-fns';

/**
 * Generate a countdown label for due dates.
 * Returns a label and severity level for styling.
 */
export function countdownLabel(dueDate: Date): { label: string; severity: 'normal' | 'warning' | 'danger' } {
    const now = new Date();

    if (isPast(dueDate) && !isToday(dueDate)) {
        return { label: 'Overdue', severity: 'danger' };
    }

    if (isToday(dueDate)) {
        const hoursLeft = differenceInHours(dueDate, now);
        if (hoursLeft <= 0) return { label: 'Overdue', severity: 'danger' };
        return { label: `Due in ${hoursLeft} hour${hoursLeft === 1 ? '' : 's'}`, severity: 'danger' };
    }

    if (isTomorrow(dueDate)) {
        return { label: 'Due Tomorrow', severity: 'warning' };
    }

    const daysLeft = differenceInDays(dueDate, now);

    if (daysLeft <= 3) {
        return { label: `Due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`, severity: 'warning' };
    }

    return { label: `Due in ${daysLeft} days`, severity: 'normal' };
}
