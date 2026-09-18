import { PostHog } from 'posthog-js-lite';
import type { PostHogEventProperties } from '@posthog/core';

let client: PostHog | null = null;

export function initPostHog(): void {
  client = new PostHog(import.meta.env.VITE_POSTHOG_KEY, {
    host: import.meta.env.VITE_POSTHOG_HOST,
    // Our own event volume is low (a handful of named events per run, not
    // high-frequency telemetry), and a short run could end before the
    // library's default batching (flushAt: 20 / flushInterval: 10s) ever
    // sends anything. flushAt: 1 forces an immediate send per event, which
    // is what "live, not batched" (Section 3.1) actually requires.
    flushAt: 1,
  });
}

export function capturePostHogEvent(name: string, properties?: PostHogEventProperties): void {
  client?.capture(name, properties);
}
