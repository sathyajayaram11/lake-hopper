import { PostHog } from 'posthog-js-lite';
import type { PostHogEventProperties } from '@posthog/core';

let client: PostHog | null = null;

export function initPostHog(): void {
  client = new PostHog(import.meta.env.VITE_POSTHOG_KEY, {
    host: import.meta.env.VITE_POSTHOG_HOST,
  });
}

export function capturePostHogEvent(name: string, properties?: PostHogEventProperties): void {
  client?.capture(name, properties);
}
