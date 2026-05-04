// utils/registerBackgroundTasksSafe.ts
// Web-safe wrapper for registerBackgroundTasks.
// No-ops on web to prevent native module crashes (expo-task-manager, expo-background-fetch).
import { isNative } from './platform';

/**
 * Register background tasks only on native platforms.
 * On web: no-op — background fetch is not supported in browsers.
 */
export async function registerBackgroundTasksSafe(): Promise<void> {
    if (!isNative) return;

    // Dynamic require prevents web bundler from resolving expo-task-manager
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { registerBackgroundTasks } = require('../services/backgroundTask') as {
        registerBackgroundTasks: () => Promise<void>;
    };
    await registerBackgroundTasks();
}
