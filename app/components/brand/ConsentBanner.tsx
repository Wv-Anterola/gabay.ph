"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ShieldCheck, Cookie } from "lucide-react";
import { getConsent, setConsent } from "@/lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Cookie consent banner. GA4 is mounted only after the visitor accepts,
 * so no analytics cookies are set without consent (PH Data Privacy Act).
 */
export default function ConsentBanner() {
  // null = undecided (show banner), otherwise a stored choice.
  const [choice, setChoice] = useState<"accepted" | "declined" | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setChoice(getConsent());
    setReady(true);
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as "accepted" | "declined";
      setChoice(detail);
    };
    window.addEventListener("tero-consent-change", onChange);
    return () => window.removeEventListener("tero-consent-change", onChange);
  }, []);

  function decide(value: "accepted" | "declined") {
    setConsent(value);
    setChoice(value);
  }

  return (
    <>
      {choice === "accepted" && GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}

      {ready && choice === null ? (
        <div
          role="dialog"
          aria-label="Cookie consent"
          aria-live="polite"
          className="fixed inset-x-0 bottom-0 z-[1000] flex justify-center p-4"
        >
          <div className="flex w-full max-w-content flex-col gap-4 rounded-clay border border-clay-line bg-clay px-6 py-5 shadow-clay-lg sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cream text-berry shadow-clay-sm">
                <Cookie aria-hidden className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <p className="text-sm leading-relaxed text-ink">
                Tero uses privacy-respecting analytics to understand how students use the
                mock exam. We only load Google Analytics if you accept. Read more in our{" "}
                <Link href="/privacy" className="font-semibold text-berry underline underline-offset-2">
                  Privacy &amp; Disclaimer
                </Link>
                .
              </p>
            </div>
            <div className="flex shrink-0 gap-3 sm:ml-auto">
              <button
                type="button"
                onClick={() => decide("declined")}
                className="clay-press min-h-[44px] rounded-full border border-clay-line bg-cream px-5 text-sm font-semibold text-ink hover:bg-clay-deep"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => decide("accepted")}
                className="clay-press inline-flex min-h-[44px] items-center gap-2 rounded-full bg-berry px-5 text-sm font-semibold text-white shadow-clay-berry hover:bg-berry-deep"
              >
                <ShieldCheck aria-hidden className="h-4 w-4" strokeWidth={2} />
                Accept
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
