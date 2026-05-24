"use client";

import { init, track } from "@plausible-analytics/tracker";

const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

let initialized = false;

export function isPlausibleEnabled(): boolean {
  return Boolean(domain);
}

/** Inizializza Plausible (idempotente). Solo client. */
export function initPlausible(): void {
  if (!domain || initialized || typeof window === "undefined") return;

  init({
    domain,
    autoCapturePageviews: true,
    captureOnLocalhost: process.env.NODE_ENV === "development",
    bindToWindow: true,
  });
  initialized = true;
}

export type PlausibleEvent =
  | "signup"
  | "note_upload"
  | "note_download";

export function trackPlausibleEvent(
  name: PlausibleEvent,
  props?: Record<string, string>,
): void {
  if (!domain || typeof window === "undefined") return;
  if (!initialized) initPlausible();
  track(name, props ? { props } : {});
}
