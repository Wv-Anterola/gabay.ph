"use client";

import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import ClayButton from "@/app/components/ui/ClayButton";
import DashboardPreview from "./DashboardPreview";
import { trackEvent } from "@/lib/analytics";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-wide items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-clay-line bg-clay px-4 py-1.5 text-xs font-semibold text-ink-muted shadow-clay-sm">
            <Sparkles aria-hidden className="h-4 w-4 text-mango-deep" strokeWidth={2} />
            Independent UPCAT preparation tool
          </span>

          <h1 className="mt-5 font-display text-display font-bold text-ink">
            Stop guessing what to study for UPCAT.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
            Tero gives you a free UPCAT mock exam, readiness score, answer review, weak-topic report,
            and 7-day study plan.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ClayButton
              href="/diagnostic"
              size="lg"
              variant="primary"
              onClick={() => trackEvent("cta_click", { location: "hero", cta: "diagnostic" })}
            >
              Take the free UPCAT mock
              <ArrowRight aria-hidden className="h-5 w-5" strokeWidth={2} />
            </ClayButton>

            <ClayButton
              href="/#how-it-works"
              size="lg"
              variant="secondary"
              onClick={() => trackEvent("cta_click", { location: "hero", cta: "how_it_works" })}
            >
              <PlayCircle aria-hidden className="h-5 w-5" strokeWidth={2} />
              See how Tero works
            </ClayButton>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              { k: "4", v: "UPCAT modules" },
              { k: "63", v: "Mock items" },
              { k: "7-day", v: "Study plan" },
            ].map((s) => (
              <div key={s.v} className="rounded-clay border-2 border-clay-line bg-clay px-4 py-3 shadow-clay-sm">
                <dt className="tabular font-display text-xl font-bold text-berry">{s.k}</dt>
                <dd className="text-xs font-medium text-ink-muted">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:animate-float-soft">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
