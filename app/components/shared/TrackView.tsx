"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import type { AnalyticsEventName, AnalyticsProps } from "@/lib/analytics";

/**
 * Fires a single analytics event once on mount. Drop into any server page
 * to record a "_viewed" event without making the whole page a client component.
 */
export default function TrackView({
  event,
  props,
}: {
  event: AnalyticsEventName;
  props?: AnalyticsProps;
}) {
  useEffect(() => {
    trackEvent(event, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
  return null;
}
