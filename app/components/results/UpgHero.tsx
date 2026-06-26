"use client";

import { ArrowRight, ChevronDown, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ADMISSION_STANDING_BLURB,
  ADMISSION_STANDING_LABEL,
  ADMISSION_STANDING_TONE,
  UPG_BAND_TONE,
  UPG_DESCRIPTION_LABEL,
  UPG_MAX,
  UPG_MIN,
  confidenceLabel,
  formatUpg,
} from "@/lib/upg";
import type { DiagnosticResult, UpgEstimate } from "@/lib/types";

function scrollToDetails() {
  document.getElementById("section-scores")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Bluebook-style score card: estimated UPG is the headline, with readiness and
 * correct count as supporting sub-metrics, outline actions, and a collapsible
 * standing note at the bottom. Clean white surface, on-brand accents.
 */
export default function UpgHero({
  estimate,
  result,
  hsAverage,
}: {
  estimate: UpgEstimate;
  result: DiagnosticResult;
  hsAverage?: number;
}) {
  const { overall } = result;
  const readinessScore = overall.readinessScore ?? overall.weightedAccuracy ?? overall.accuracy;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-7 lg:p-9">
        <div className="grid gap-8 sm:grid-cols-[1fr_auto]">
          {/* Headline UPG */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Estimated UPG
            </p>
            <p className="tabular mt-1 font-display text-6xl font-bold leading-none text-foreground lg:text-7xl">
              {formatUpg(estimate.pointEstimate)}
            </p>
            <p className="tabular mt-2 text-sm text-muted-foreground">
              Range {formatUpg(estimate.lowerBound)} – {formatUpg(estimate.upperBound)} · scale{" "}
              {formatUpg(UPG_MIN)}–{formatUpg(UPG_MAX)} (lower is better)
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant={ADMISSION_STANDING_TONE[estimate.admissionStanding]}>
                {ADMISSION_STANDING_LABEL[estimate.admissionStanding]}
              </Badge>
              <Badge variant={UPG_BAND_TONE[estimate.readinessBand]}>
                {UPG_DESCRIPTION_LABEL[estimate.readinessBand]}
              </Badge>
              <Badge variant="outline">{confidenceLabel(estimate.confidence)}</Badge>
            </div>
          </div>

          {/* Supporting sub-metrics */}
          <div className="flex gap-8 sm:flex-col sm:gap-5 sm:border-l sm:border-border sm:pl-8">
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
            See score details
          </Button>
          <Button variant="ghost" onClick={() => window.print()}>
            <Download />
            Download report
          </Button>
        </div>
      </CardContent>

      {/* Collapsible standing note (Bluebook's expandable footer) */}
      <Collapsible>
        <Separator />
        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 px-7 py-5 text-left transition-colors hover:bg-muted/50 lg:px-9">
          <p className="text-sm font-semibold text-foreground">
            {ADMISSION_STANDING_LABEL[estimate.admissionStanding]} — what this means
          </p>
          <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="space-y-2 px-7 pb-6 text-sm leading-relaxed text-muted-foreground lg:px-9">
            <p>{ADMISSION_STANDING_BLURB[estimate.admissionStanding]}</p>
            {hsAverage !== undefined ? (
              <p>
                Blended with your high school average of {hsAverage.toFixed(1)} (40% HS · 60% mock).
              </p>
            ) : null}
            <p className="text-xs leading-relaxed text-muted-foreground">
              This is an estimated readiness score based on your mock performance, not an official
              University of the Philippines UPG. UP admits roughly 10–15% of applicants.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
