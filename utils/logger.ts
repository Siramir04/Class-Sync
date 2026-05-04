// utils/logger.ts
// Production-safe logger. No-ops in release builds.

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = __DEV__;

const noop = () => {};

export const logger = {
  debug: isDev ? (...args: unknown[]) => console.log('[DEBUG]', ...args) : noop,
  info: isDev ? (...args: unknown[]) => console.info('[INFO]', ...args) : noop,
  warn: (...args: unknown[]) => console.warn('[WARN]', ...args), // Keep in prod for critical warnings
  error: (...args: unknown[]) => console.error('[ERROR]', ...args), // Always log errors
};
