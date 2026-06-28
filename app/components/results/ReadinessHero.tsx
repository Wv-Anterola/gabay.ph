"use client";

import { ArrowRight, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { READINESS_LABEL } from "@/lib/scoring";
import { formatUpg } from "@/lib/upg";
import type { DiagnosticResult, ReadinessLevel, UpgEstimate } from "@/lib/types";

const LEVEL_TONE: Record<ReadinessLevel, "teal" | "mango" | "berry"> = {
  strong: "teal",
  steady: "mango",
  needs_work: "berry",
};

/**
 * Results header. The estimated UPG is KEPT but deliberately de-emphasized — it
 * sits in the supporting metric row, not as a doom headline, and we never surface
 * the "Failed" / "below the appeal line" admission-standing labels. The headline
 * and subline are encouraging and always point forward to how to improve.
 */
const LEVEL_HEADLINE: Record<ReadinessLevel, string> = {
  strong: "You're in great shape.",
  steady: "You've got a solid base to build on.",
  needs_work: "This is your starting line — and that's a good thing.",
};

const LEVEL_SUBLINE: Record<ReadinessLevel, string> = {
  strong:
    "You're already answering most of these correctly. Keep your strong areas warm and the plan below will help you hold this line.",
  steady:
    "You know more than you think. A few focused sessions on the topics below can move your estimate in the right direction.",
  needs_work:
    "Every strong UPCAT score started exactly here. Work through the plan below to improve your estimate — one small session at a time.",
};

function scrollToDetails() {
  document.getElementById("section-scores")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function ReadinessHero({
  result,
  estimate,
}: {
  result: DiagnosticResult;
  estimate?: UpgEstimate;
}) {
  const { overall } = result;
  const level = overall.level;
  const readinessScore = overall.readinessScore ?? overall.weightedAccuracy ?? overall.accuracy;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-7 lg:p-9">
        <div className="grid gap-8 sm:grid-cols-[1fr_auto]">
          {/* Encouraging headline */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Your readiness signal
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-foreground lg:text-4xl">
              {LEVEL_HEADLINE[level]}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              {LEVEL_SUBLINE[level]}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant={LEVEL_TONE[level]}>{READINESS_LABEL[level]}</Badge>
            </div>
          </div>

          {/* Supporting sub-metrics — UPG is kept here, not as the headline. */}
          <div className="flex flex-wrap gap-8 sm:flex-col sm:gap-5 sm:border-l sm:border-border sm:pl-8">
            {estimate ? (
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Estimated UPG</p>
                <p className="tabular mt-0.5 text-3xl font-bold text-foreground">
                  {formatUpg(estimate.pointEstimate)}
                </p>
                <p className="tabular mt-0.5 text-xs text-muted-foreground">
                  {formatUpg(estimate.lowerBound)}–{formatUpg(estimate.upperBound)} · lower is better
                </p>
              </div>
            ) : null}
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Readiness</p>
              <p className="tabular mt-0.5 text-3xl font-bold text-foreground">
                {readinessScore}
                <span className="text-base font-semibold text-muted-foreground">/100</span>
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Correct</p>
              <p className="tabular mt-0.5 text-3xl font-bold text-foreground">
                {overall.correct}
                <span className="text-base font-semibold text-muted-foreground">
                  /{overall.total}
                </span>
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="rounded-full" onClick={scrollToDetails}>
            <ArrowRight />
            See how to improve it
          </Button>
          <Button variant="ghost" onClick={() => window.print()}>
            <Download />
            Download report
          </Button>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Your estimated UPG is based on your mock performance, not an official UP calculation. The
          weak topics and study plan below are where you can improve it fastest.
        </p>
      </CardContent>
    </Card>
  );
}
