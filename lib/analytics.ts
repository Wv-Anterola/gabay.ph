/**
 * Typed analytics wrapper for Gabay.
 *
 * GA4 is loaded (via @next/third-parties GoogleAnalytics) ONLY after the
 * visitor accepts the cookie consent banner. Until then `window.gtag` does
 * not exist and `trackEvent` is a silent no-op, so calling it anywhere is safe.
 *
 * All product code calls `trackEvent(name, props)` — never `gtag` directly —
 * so the analytics sink can be swapped without touching feature code.
 */

export type AnalyticsEventName =
  | "landing_page_viewed"
  | "cta_click"
  | "diagnostic_started"
  | "module_started"
  | "module_completed"
  | "diagnostic_completed"
  | "results_viewed"
  | "weak_topic_viewed"
  | "study_plan_viewed"
  | "practice_started"
  | "practice_completed"
  | "waitlist_clicked"
  | "waitlist_submitted"
  | "paid_interest_clicked";

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "consent",
      targetOrName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

const CONSENT_KEY = "gabay-consent";

/** Returns "accepted" | "declined" | null (undecided). */
export function getConsent(): "accepted" | "declined" | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === "accepted" || v === "declined" ? v : null;
}

export function setConsent(value: "accepted" | "declined"): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent("gabay-consent-change", { detail: value }));
}

/**
 * Record an analytics event. Safe to call before consent (no-op) and during SSR.
 */
export function trackEvent(name: AnalyticsEventName, props?: AnalyticsProps): void {
  if (typeof window === "undefined") return;
  if (getConsent() !== "accepted") return;
  if (typeof window.gtag !== "function") return;

  const cleaned: Record<string, unknown> = {};
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v !== undefined) cleaned[k] = v;
    }
  }
  window.gtag("event", name, cleaned);
}
