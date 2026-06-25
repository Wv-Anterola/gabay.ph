import ProgressRing from "@/app/components/ui/ProgressRing";
import ReadinessPill from "@/app/components/shared/ReadinessPill";
import { READINESS_BLURB } from "@/lib/scoring";
import { READINESS_RING_TONE } from "@/app/components/shared/moduleVisuals";
import type { DiagnosticResult } from "@/lib/types";

export default function ReadinessSummary({ result }: { result: DiagnosticResult }) {
  const { overall } = result;
  return (
    <section className="rounded-clay-xl border-2 border-clay-line bg-clay p-7 shadow-clay-lg lg:p-9">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <ProgressRing
          value={overall.accuracy}
          tone={READINESS_RING_TONE[overall.level]}
          size={120}
          stroke={13}
          label="Overall readiness"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              Your readiness signal
            </p>
            <ReadinessPill level={overall.level} />
          </div>
          <h1 className="mt-2 font-display text-h1 font-bold text-ink">
            You answered {overall.correct} of {overall.total} correctly.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-muted">
            {READINESS_BLURB[overall.level]}
          </p>
          {overall.unanswered > 0 ? (
            <p className="tabular mt-2 text-sm text-ink-faint">
              {overall.unanswered} question{overall.unanswered === 1 ? "" : "s"} left unanswered
              (counted as not correct).
            </p>
          ) : null}
        </div>
      </div>

      <p className="mt-6 rounded-clay border-2 border-clay-line bg-cream px-5 py-3 text-sm font-medium text-ink">
        This is not an admissions prediction. It is a study guide based on your answers.
      </p>
    </section>
  );
}
