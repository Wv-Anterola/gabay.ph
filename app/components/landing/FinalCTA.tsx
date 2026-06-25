"use client";

import { ArrowRight } from "lucide-react";
import ClayButton from "@/app/components/ui/ClayButton";
import { trackEvent } from "@/lib/analytics";

export default function FinalCTA() {
  return (
    <section className="mx-auto max-w-wide px-5 py-16 lg:px-8 lg:py-24">
      <div className="relative overflow-hidden rounded-clay-xl border-2 border-berry-deep bg-berry px-8 py-14 text-center shadow-clay-lg lg:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-mango/20 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-teal/25 blur-2xl"
        />
        <h2 className="relative font-display text-h1 font-bold text-white">
          Stop guessing. Start with a free UPCAT diagnostic.
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-lg leading-relaxed text-cream/90">
          Take the diagnostic, see your weak topics, and get a 7-day study plan in minutes. No
          payment, no pressure.
        </p>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
          <ClayButton
            href="/diagnostic"
            size="lg"
            variant="primary"
            onClick={() => trackEvent("cta_click", { location: "final_cta", cta: "diagnostic" })}
          >
            Take the free UPCAT diagnostic
            <ArrowRight aria-hidden className="h-5 w-5" strokeWidth={2} />
          </ClayButton>
          <ClayButton
            href="/waitlist"
            size="lg"
            variant="secondary"
            className="!bg-cream"
            onClick={() => trackEvent("cta_click", { location: "final_cta", cta: "waitlist" })}
          >
            Join the waitlist
          </ClayButton>
        </div>
        <p className="relative mt-6 text-xs font-semibold uppercase tracking-wide text-cream/70">
          Built for UPCAT first. More CETs coming later.
        </p>
      </div>
    </section>
  );
}
