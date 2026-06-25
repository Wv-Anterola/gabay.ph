"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import ReadinessSummary from "./ReadinessSummary";
import ModuleScoreCard from "./ModuleScoreCard";
import WeakTopicList from "./WeakTopicList";
import ReadinessChart from "./ReadinessChart";
import StudyPlan7Day from "./StudyPlan7Day";
import ResultActions from "./ResultActions";
import Disclaimer from "@/app/components/brand/Disclaimer";
import ClayButton from "@/app/components/ui/ClayButton";
import { loadResult } from "@/lib/storage";
import { generateStudyPlan } from "@/lib/studyPlan";
import { trackEvent } from "@/lib/analytics";
import type { DiagnosticResult, ModuleId } from "@/lib/types";

export default function ResultsView() {
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const r = loadResult();
    setResult(r);
    setLoaded(true);
    if (r) {
      trackEvent("results_viewed", { overall_accuracy: r.overall.accuracy });
      trackEvent("study_plan_viewed");
    }
  }, []);

  const plan = useMemo(() => (result ? generateStudyPlan(result) : []), [result]);

  if (!loaded) {
    return (
      <div className="mx-auto max-w-content px-5 py-24 text-center text-ink-muted">Loading…</div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-content px-5 py-20 text-center lg:py-28">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-clay border-2 border-clay-line bg-clay text-berry shadow-clay">
          <ClipboardList aria-hidden className="h-8 w-8" strokeWidth={1.75} />
        </span>
        <h1 className="mt-6 font-display text-h1 font-bold text-ink">No results yet</h1>
        <p className="mx-auto mt-3 max-w-md text-base text-ink-muted">
          Take at least one module of the free diagnostic and your weak-topic report and 7-day study
          plan will appear here.
        </p>
        <div className="mt-7">
          <ClayButton href="/diagnostic" size="lg" variant="primary">
            Take the free UPCAT diagnostic
          </ClayButton>
        </div>
      </div>
    );
  }

  // Weakest module = lowest accuracy among taken modules (for the practice CTA).
  const weakestModule: ModuleId =
    [...result.modules].sort((a, b) => a.accuracy - b.accuracy)[0]?.module ?? "math";

  return (
    <div className="mx-auto max-w-wide space-y-8 px-5 py-12 lg:px-8 lg:py-16">
      <div className="flex items-center justify-between">
        <Link href="/diagnostic" className="text-sm font-semibold text-ink-muted hover:text-berry">
          ← Back to diagnostic
        </Link>
        <span className="tabular rounded-full border-2 border-clay-line bg-clay px-3 py-1 text-xs font-bold text-ink">
          {result.modules.length} module{result.modules.length === 1 ? "" : "s"} taken
        </span>
      </div>

      <ReadinessSummary result={result} />

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-mango-deep">
          Module scores
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {result.modules.map((m) => (
            <ModuleScoreCard key={m.module} score={m} />
          ))}
        </div>
      </section>

      <WeakTopicList weakTopics={result.weakTopics} strengths={result.strengths} />

      <ReadinessChart modules={result.modules} />

      <StudyPlan7Day plan={plan} />

      <ResultActions weakestModule={weakestModule} />

      <Disclaimer />
    </div>
  );
}
