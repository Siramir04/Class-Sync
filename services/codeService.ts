// codeService.ts — Structured code generation & validation

/**
 * Generates a space code from university, department, and entry year.
 * Format: "FUTB-CSC-23"
 * Takes the first 4 chars of university (uppercase), first 3 chars of department (uppercase),
 * and last 2 digits of entry year.
 */
export function generateSpaceCode(
    university: string,
    department: string,
    entryYear: string
): string {
    const uniSegment = university
        .trim()
        .replace(/\s+/g, '-')
        .toUpperCase()
        .slice(0, 4);
    const deptSegment = department
        .trim()
        .replace(/\s+/g, '-')
        .toUpperCase()
        .slice(0, 3);
    const yearSegment = entryYear.trim().slice(-2);

    return `${uniSegment}-${deptSegment}-${yearSegment}`;
}

/**
 * Generates a full course code by appending the courseCode to the space code.
 * Format: "FUTB-CSC-23-COS101"
 */
export function generateCourseCode(
    university: string,
    department: string,
    entryYear: string,
    courseCode: string
): string {
    const spaceCode = generateSpaceCode(university, department, entryYear);
    const codeSegment = courseCode.trim().replace(/\s+/g, '-').toUpperCase();
    return `${spaceCode}-${codeSegment}`;
}

/**
 * Validates a space code format. Expected: 2-5 uppercase segments separated by hyphens.
 * e.g. "FUTB-CSC-23"
 */
export function validateSpaceCode(code: string): boolean {
    const regex = /^[A-Z0-9]{2,5}(-[A-Z0-9]{2,5}){1,4}$/;
    return regex.test(code.trim());
}

/**
 * Validates a course code format. Expected: space code + course code segment.
 * e.g. "FUTB-CSC-23-COS101"
 */
export function validateCourseCode(code: string): boolean {
    const regex = /^[A-Z0-9]{2,5}(-[A-Z0-9]{2,10}){2,5}$/;
    return regex.test(code.trim());
}
