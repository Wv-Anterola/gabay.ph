import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MODULE_ICON, MODULE_ACCENT } from "@/app/components/shared/moduleVisuals";
import { READINESS_LABEL } from "@/lib/scoring";
import type { ModuleScore, ReadinessLevel } from "@/lib/types";

const LEVEL_BADGE: Record<ReadinessLevel, "teal" | "mango" | "berry"> = {
  strong: "teal",
  steady: "mango",
  needs_work: "berry",
};

// Monochrome strength ramp: deep maroon → wine → dusty rose (value, not hue).
const LEVEL_BAR: Record<ReadinessLevel, string> = {
  strong: "bg-state-strong",
  steady: "bg-state-steady",
  needs_work: "bg-state-weak",
};

export default function ModuleScoreCard({ score }: { score: ModuleScore }) {
  const Icon = MODULE_ICON[score.module];
  return (
    <Card className="h-full">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${MODULE_ACCENT[score.module]}`}
          >
            <Icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-foreground">{score.name}</h3>
            <p className="tabular text-xs text-muted-foreground">
              {score.correct}/{score.total} correct
            </p>
          </div>
        </div>

        <p className="tabular mt-4 text-3xl font-bold text-foreground">
          {score.accuracy}
          <span className="text-base font-semibold text-muted-foreground">%</span>
        </p>
        <Progress
          value={score.accuracy}
          className="mt-2"
          indicatorClassName={LEVEL_BAR[score.level]}
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant={LEVEL_BADGE[score.level]}>{READINESS_LABEL[score.level]}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
