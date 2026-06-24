import {ConnectivityState, RoutingDecision} from '../types/routing';

/**
 * Decides which AI provider to use for a given query.
 *
 * Rules (in priority order):
 * 1. Offline → always on-device
 * 2. Weak connection → prefer on-device (faster, no latency)
 * 3. Strong connection → cloud (more capable)
 *
 * The `forceProvider` override lets power users pin a provider per query.
 */
export function resolveProvider(
  connectivity: ConnectivityState,
  forceProvider?: 'on-device' | 'cloud',
): RoutingDecision {
  if (forceProvider === 'on-device') {
    return {
      provider: 'on-device',
      reason: 'user-forced',
      label: 'Answered locally · on-device AI',
    };
  }

  if (forceProvider === 'cloud') {
    if (!connectivity.isOnline) {
      // Can't honour cloud request while offline — fall back silently
      return {
        provider: 'on-device',
        reason: 'cloud-requested-but-offline',
        label: 'Answered locally · no connection',
      };
    }
    return {
      provider: 'cloud',
      reason: 'user-forced',
      label: 'Answered via cloud AI',
    };
  }

  if (!connectivity.isOnline) {
    return {
      provider: 'on-device',
      reason: 'offline',
      label: 'Answered locally · offline',
    };
  }

  if (connectivity.connectionQuality === 'weak') {
    return {
      provider: 'on-device',
      reason: 'weak-connection',
      label: 'Answered locally · slow connection',
    };
  }

  return {
    provider: 'cloud',
    reason: 'online',
    label: 'Answered via cloud AI',
  };
}

/**
 * Returns true if the input looks like a navigation URL rather than a query.
 * Navigation URLs are sent straight to the WebView, not through the AI router.
 */
export function isNavigationUrl(input: string): boolean {
  return (
    /^https?:\/\//i.test(input) ||
    /^[\w-]+\.[a-z]{2,}(\/.*)?$/i.test(input)
  );
}
