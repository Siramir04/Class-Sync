// utils/validation.ts
// Reusable validation utilities for ClassSync

export const Validation = {
    /**
     * Basic email validation
     */
    email: (email: string): boolean => 
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    
    /**
     * Username validation: 3-20 characters, alphanumeric and underscore only
     */
    username: (username: string): boolean => 
        /^[a-zA-Z0-9_]{3,20}$/.test(username),
    
    /**
     * Entry year validation: must be between 2020 and 2030
     */
    entryYear: (year: string): boolean => {
        const num = parseInt(year, 10);
        return !isNaN(num) && num >= 2020 && num <= 2030;
    },
    
    /**
     * Space code validation: 1-20 characters
     */
    spaceCode: (code: string): boolean => 
        code.length > 0 && code.length <= 20,
    
    /**
     * Password validation: minimum 6 characters
     */
    password: (password: string): boolean => 
        password.length >= 6,
    
    /**
     * File size validation
     */
    fileSize: (bytes: number, maxMB: number = 25): boolean => 
        bytes <= maxMB * 1024 * 1024,
    
    /**
     * MIME type validation
     */
    fileType: (mimeType: string, allowed: string[] = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/heic',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]): boolean => allowed.includes(mimeType),
};
