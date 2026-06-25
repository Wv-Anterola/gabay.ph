import ProgressRing from "@/app/components/ui/ProgressRing";
import ReadinessPill from "@/app/components/shared/ReadinessPill";
import { MODULE_ICON, MODULE_ACCENT, READINESS_RING_TONE } from "@/app/components/shared/moduleVisuals";
import type { ModuleScore } from "@/lib/types";

export default function ModuleScoreCard({ score }: { score: ModuleScore }) {
  const Icon = MODULE_ICON[score.module];
  return (
    <div className="rounded-clay-lg border-2 border-clay-line bg-cream p-6 shadow-clay">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-clay-sm ${MODULE_ACCENT[score.module]}`}
          >
            <Icon aria-hidden className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <div>
            <h3 className="text-base font-bold text-ink">{score.name}</h3>
            <p className="tabular text-xs text-ink-muted">
              {score.correct}/{score.total} correct
            </p>
          </div>
        </div>
        <ProgressRing
          value={score.accuracy}
          tone={READINESS_RING_TONE[score.level]}
          size={64}
          stroke={8}
          label={`${score.name} readiness`}
        />
      </div>

      <div className="mt-4">
        <ReadinessPill level={score.level} />
      </div>
    </div>
  );
}
