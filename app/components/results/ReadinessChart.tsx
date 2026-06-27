import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

/**
 * Accessible horizontal bar chart of module accuracy. Each bar carries a
 * numeric label and a readiness badge, so meaning never depends on color alone.
 */
export default function ReadinessChart({ modules }: { modules: ModuleScore[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Topic &amp; module breakdown</CardTitle>
        <CardDescription>
          How you did across each UPCAT module. Longer bars mean higher accuracy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-5">
          {modules.map((m) => (
            <li key={m.module}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-foreground">{m.name}</span>
                <div className="flex items-center gap-2">
                  <span className="tabular text-sm font-bold text-foreground">{m.accuracy}%</span>
                  <Badge variant={LEVEL_BADGE[m.level]}>{READINESS_LABEL[m.level]}</Badge>
                </div>
              </div>
              <Progress
                value={m.accuracy}
                className="mt-2 h-3"
                indicatorClassName={LEVEL_BAR[m.level]}
                aria-label={`${m.name}: ${m.accuracy} percent, ${m.level.replace("_", " ")}`}
              />

              {/* Per-topic mini rows */}
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {m.topics.map((t) => (
                  <li
                    key={t.topic}
                    className="flex items-center justify-between rounded-md border border-border bg-secondary/50 px-3 py-1.5"
                  >
                    <span className="truncate text-xs text-muted-foreground">{t.topic}</span>
                    <span className="tabular text-xs font-semibold text-foreground">
                      {t.accuracy}%
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
