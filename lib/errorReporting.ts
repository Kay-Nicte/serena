/**
 * Centralized error reporting.
 *
 * In development, errors are logged to the console.
 * In production, this can be wired to Sentry or any other service
 * by replacing the `reportError` implementation.
 *
 * To integrate Sentry later:
 *   1. `npx expo install @sentry/react-native`
 *   2. Initialize Sentry in app/_layout.tsx
 *   3. Replace `reportError` body with `Sentry.captureException(error, { extra: context })`
 */

const IS_DEV = __DEV__;

export function reportError(error: unknown, context?: Record<string, unknown>) {
  if (IS_DEV) {
    console.error('[Serenade]', context?.source ?? 'unknown', error);
  }

  // Production: send to error tracking service
  // Sentry.captureException(error, { extra: context });
}
