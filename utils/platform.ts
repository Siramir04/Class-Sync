// utils/platform.ts
// Platform detection and feature gating for ClassSync web companion
import { Platform } from 'react-native';

/** True when running in a web browser (expo start --web) */
export const isWeb: boolean = Platform.OS === 'web';

/** True when running on a native device (iOS or Android) */
export const isNative: boolean = !isWeb;

/**
 * Feature availability flags based on platform.
 * Used to gate native-only features and show web fallback UI.
 */
export const FeatureGate = {
    // Native-only features
    bleAttendance: isNative,
    qrScan: isNative,
    pushNotifications: isNative,
    excelExport: isNative,
    fileUpload: isNative,
    biometricAuth: isNative,

    // Universal features (available on both web and native)
    coreData: true,
} as const;
