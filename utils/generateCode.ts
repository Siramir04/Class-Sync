/**
 * generateCode.ts — Re-exports from codeService for convenience.
 */
export { generateSpaceCode, generateCourseCode } from '../services/codeService';

export function generateAttendanceCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
