import { CheckCircle2, MinusCircle, AlertCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ClayBadge from "@/app/components/ui/ClayBadge";
import { READINESS_LABEL } from "@/lib/scoring";
import type { ReadinessLevel } from "@/lib/types";

const ICON: Record<ReadinessLevel, LucideIcon> = {
  strong: CheckCircle2,
  steady: MinusCircle,
  needs_work: AlertCircle,
};

const TONE: Record<ReadinessLevel, "strong" | "steady" | "weak"> = {
  strong: "strong",
  steady: "steady",
  needs_work: "weak",
};

/**
 * Readiness shown as icon + text + color together (never color alone),
 * satisfying the color-not-only accessibility rule.
 */
export default function ReadinessPill({ level }: { level: ReadinessLevel }) {
  const Icon = ICON[level];
  return (
    <ClayBadge tone={TONE[level]}>
      <Icon aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
      {READINESS_LABEL[level]}
    </ClayBadge>
  );
}
