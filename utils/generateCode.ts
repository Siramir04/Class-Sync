import * as Crypto from 'expo-crypto';

/**
 * Generates a cryptographically secure 6-digit attendance code.
 * Uses expo-crypto.getRandomBytesAsync to ensure uniform distribution and prevent prediction.
 */
export async function generateAttendanceCode(): Promise<string> {
    // 6 digits = 000000 to 999999
    // rejection sampling to avoid modulo bias
    const maxUint32 = 4294967295;
    const limit = maxUint32 - (maxUint32 % 1000000);
    
    let code: number;
    let bytes: Uint8Array;
    
    do {
        bytes = await Crypto.getRandomBytesAsync(4);
        // Combine 4 bytes into a single 32-bit unsigned integer
        code = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
    } while (code >= limit);
    
    return (code % 1000000).toString().padStart(6, '0');
}
