// hooks/usePushNotificationsSafe.ts
// Web-safe wrapper for usePushNotifications.
// Returns no-op values on web to prevent native module crashes.
import { useState } from 'react';
import { isNative } from '../utils/platform';

interface PushNotificationResult {
    expoPushToken: string | null;
}

/**
 * Web-safe push notifications hook.
 * On native: dynamically loads and delegates to the real usePushNotifications hook.
 * On web: returns null token immediately (no-op).
 */
export function usePushNotificationsSafe(): PushNotificationResult {
    const [nativeResult, setNativeResult] = useState<PushNotificationResult>({
        expoPushToken: null,
    });

    if (isNative) {
        // Dynamic require prevents web bundler from resolving expo-notifications
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { usePushNotifications } = require('./usePushNotifications') as {
            usePushNotifications: () => PushNotificationResult;
        };
        return usePushNotifications();
    }

    return nativeResult;
}
