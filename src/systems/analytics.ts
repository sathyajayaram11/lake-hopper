import type { PostHogEventProperties } from '@posthog/core';
import type { EventBus } from '../core/events/bus';
import type { EventCatalog } from '../core/events/catalog';
import { capturePostHogEvent } from '../core/net/posthog';

const ANALYTICS_EVENTS: (keyof EventCatalog)[] = [
  'app_opened',
  'login_completed',
  'run_started',
  'player_stumbled',
  'player_caught',
];

export function initAnalyticsSystem(deps: { bus: EventBus }): void {
  for (const eventName of ANALYTICS_EVENTS) {
    deps.bus.on(eventName, (payload) => {
      capturePostHogEvent(eventName, payload as unknown as PostHogEventProperties);
    });
  }
}
