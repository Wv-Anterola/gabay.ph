"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardList, Eye, History, RotateCcw } from "lucide-react";
import UpgHero from "./UpgHero";
import ModuleScoreCard from "./ModuleScoreCard";
import WeakTopicList from "./WeakTopicList";
import ReadinessChart from "./ReadinessChart";
import StudyPlan7Day from "./StudyPlan7Day";
import ResultActions from "./ResultActions";
import Disclaimer from "@/app/components/brand/Disclaimer";
import ClayButton from "@/app/components/ui/ClayButton";
import Reveal from "@/app/components/shared/Reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  createMockExamAttempt,
  loadLatestMockResult,
  loadMockResult,
  loadResult,
  saveMockAttempt,
  setCurrentMockAttemptId,
} from "@/lib/storage";
import { generateStudyPlan } from "@/lib/studyPlan";
import { ensureUpg, sectionUpgImpact } from "@/lib/upg";
import {
  formatDuration,
  getMockExamTotalSeconds,
  getMockQuestionIdsBySection,
} from "@/lib/mockExam";
import { trackEvent } from "@/lib/analytics";
import type { DiagnosticResult, MockExamResult, ModuleId } from "@/lib/types";

function isMockResult(result: DiagnosticResult): result is MockExamResult {
  return "attemptId" in result && "questionReviews" in result;
}

export default function ResultsView() {
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const attemptId = searchParams.get("attemptId");
    const r = attemptId
      ? loadMockResult(attemptId)
      : loadLatestMockResult() ?? loadResult();
    setResult(r);
    setLoaded(true);
    if (r) {
      trackEvent("results_viewed", { overall_accuracy: r.overall.accuracy });
      trackEvent("study_plan_viewed");
    }
  }, [searchParams]);

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
          Take the free UPCAT mock exam and your readiness score, review, weak-topic report, and
          study plan will appear here.
        </p>
        <div className="mt-7">
          <ClayButton href="/diagnostic" size="lg" variant="primary">
            Take the free UPCAT mock exam
          </ClayButton>
        </div>
      </div>
    );
  }

  // Weakest module = lowest accuracy among taken modules (for the practice CTA).
  const weakestModule: ModuleId =
    [...result.modules].sort((a, b) => a.accuracy - b.accuracy)[0]?.module ?? "math";
  const mockResult = isMockResult(result) ? result : null;
  const upg = mockResult ? ensureUpg(mockResult) : null;

  function retake() {
    const next = createMockExamAttempt(getMockQuestionIdsBySection(), getMockExamTotalSeconds());
    saveMockAttempt(next);
    setCurrentMockAttemptId(next.attemptId);
    router.push("/diagnostic/exam");
  }

  return (
    <div className="mx-auto max-w-wide space-y-8 px-5 py-12 lg:px-8 lg:py-16">
      <div className="flex items-center justify-between">
        <Link
          href="/diagnostic"
          className="text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          ← Back to mock exam
        </Link>
        <Badge variant="secondary" className="tabular">
          {result.modules.length} section{result.modules.length === 1 ? "" : "s"} scored
        </Badge>
      </div>

      {upg ? (
        <Reveal>
          <UpgHero estimate={upg.estimate} result={result} hsAverage={mockResult?.hsAverage} />
        </Reveal>
      ) : null}

      {mockResult ? (
        <Reveal delay={upg ? 80 : 0}>
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Time taken
                  </p>
                  <p className="tabular mt-1 text-lg font-bold text-foreground">
                    {formatDuration(mockResult.durationSeconds)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Correct
                  </p>
                  <p className="tabular mt-1 text-lg font-bold text-foreground">
                    {mockResult.overall.correct}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Incorrect
                  </p>
                  <p className="tabular mt-1 text-lg font-bold text-foreground">
                    {mockResult.overall.total -
                      mockResult.overall.correct -
                      mockResult.overall.unanswered}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Unanswered
                  </p>
                  <p className="tabular mt-1 text-lg font-bold text-foreground">
                    {mockResult.overall.unanswered}
                  </p>
                </div>
              </div>
              <Separator className="my-5" />
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/results/${mockResult.attemptId}/review`}>
                    <Eye strokeWidth={2} />
                    Review answers
                  </Link>
                </Button>
                <Button variant="secondary" onClick={retake}>
                  <RotateCcw strokeWidth={2} />
                  Retake mock exam
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/dashboard">
                    <History strokeWidth={2} />
                    Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      ) : null}

      <section id="section-scores" className="scroll-mt-24">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Section scores
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {result.modules.map((m, i) => (
            <Reveal key={m.module} delay={i * 90} className="h-full">
              <ModuleScoreCard
                score={m}
                upgImpact={mockResult ? sectionUpgImpact(m, result.modules) : undefined}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <WeakTopicList weakTopics={result.weakTopics} strengths={result.strengths} />
      </Reveal>

      <Reveal>
        <ReadinessChart modules={result.modules} />
      </Reveal>

      <Reveal>
        <StudyPlan7Day plan={plan} />
      </Reveal>

      <Reveal>
        <ResultActions weakestModule={weakestModule} />
      </Reveal>

      <Disclaimer />
    </div>
  );
}
