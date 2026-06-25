"use client";

import { Target, Sparkles, RotateCcw } from "lucide-react";
import ClayButton from "@/app/components/ui/ClayButton";
import { trackEvent } from "@/lib/analytics";
import type { ModuleId } from "@/lib/types";

export default function ResultActions({ weakestModule }: { weakestModule: ModuleId }) {
  return (
    <section className="rounded-clay-lg border-2 border-berry-deep bg-berry p-7 text-center shadow-clay-lg lg:p-9">
      <h2 className="font-display text-h2 font-bold text-white">Ready to close your gaps?</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-cream/90">
        Practice your weakest topics now, or tell us you want more practice sets and we&rsquo;ll keep
        you posted.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <ClayButton
          href={`/practice/${weakestModule}`}
          size="lg"
          variant="primary"
          onClick={() =>
            trackEvent("practice_started", { module: weakestModule, from: "results_actions" })
          }
        >
          <Target aria-hidden className="h-5 w-5" strokeWidth={2} />
          Practice my weak areas
        </ClayButton>
        <ClayButton
          href="/waitlist"
          size="lg"
          variant="secondary"
          className="!bg-cream"
          onClick={() => trackEvent("cta_click", { location: "results", cta: "more_practice" })}
        >
          <Sparkles aria-hidden className="h-5 w-5" strokeWidth={2} />
          I want more practice
        </ClayButton>
      </div>
      <div className="mt-5">
        <ClayButton
          href="/diagnostic"
          variant="ghost"
          className="!text-cream/80 hover:!bg-berry-deep"
        >
          <RotateCcw aria-hidden className="h-4 w-4" strokeWidth={2} />
          Take another module
        </ClayButton>
      </div>
    </section>
  );
}
