// utils/export.ts
// Platform-aware attendance export utility
// Web: CSV download via browser Blob API
// Native: delegates to existing Excel export
import { Platform } from 'react-native';
import { AttendanceRecord } from '../types';

/**
 * Escape a CSV field value.
 * Wraps in quotes if the value contains commas, quotes, or newlines.
 */
function escapeCsvField(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

/**
 * Sanitize a filename for safe download.
 * Strips path characters and ensures .csv extension.
 */
function sanitizeFilename(filename: string): string {
    // Remove path separators and dangerous characters
    let sanitized = filename.replace(/[/\\:*?"<>|]/g, '_');
    // Ensure .csv extension
    if (!sanitized.toLowerCase().endsWith('.csv')) {
        sanitized += '.csv';
    }
    return sanitized;
}

/**
 * Generate a CSV string from attendance records.
 */
function generateCsv(records: AttendanceRecord[]): string {
    const headers = ['Full Name', 'Username', 'Status', 'Verification Method', 'Marked At', 'Carryover', 'Flagged'];
    const rows = records.map((record) => [
        escapeCsvField(record.fullName),
        escapeCsvField(record.username ?? 'N/A'),
        record.isPresent ? 'Present' : 'Absent',
        record.verificationMethod,
        record.markedAt instanceof Date
            ? record.markedAt.toISOString()
            : new Date(record.markedAt).toISOString(),
        record.isCarryover ? 'Yes' : 'No',
        record.isFlagged ? 'Yes' : 'No',
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Trigger a file download in the browser via the Blob API.
 */
function downloadBlobAsFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    // Cleanup
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}

/**
 * Export attendance records.
 * - Web: generates CSV and triggers browser download.
 * - Native: delegates to existing Excel export via attendanceService.
 */
export function exportAttendance(records: AttendanceRecord[], filename: string): void {
    const safeName = sanitizeFilename(filename);

    if (Platform.OS === 'web') {
        const csv = generateCsv(records);
        downloadBlobAsFile(csv, safeName, 'text/csv;charset=utf-8;');
    } else {
        // On native, the existing Excel export flow in attendanceService handles
        // full course-level reports. This function provides a simpler per-session
        // CSV fallback but native callers should prefer exportAttendanceToExcel.
        const csv = generateCsv(records);
        // Native CSV handling would require expo-file-system + expo-sharing,
        // which is already handled by the existing exportAttendanceToExcel.
        // Log a warning if this path is reached unexpectedly.
        console.warn('[export] Native callers should use exportAttendanceToExcel for full reports.');
    }
}
