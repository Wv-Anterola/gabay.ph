"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Clock, RotateCcw } from "lucide-react";
import ClayButton from "@/app/components/ui/ClayButton";
import { MODULES } from "@/lib/questions";
import {
  createMockExamAttempt,
  getCurrentMockAttempt,
  loadLatestMockResult,
  saveMockAttempt,
  setCurrentMockAttemptId,
} from "@/lib/storage";
import {
  MOCK_EXAM_SECTION_ORDER,
  formatDuration,
  getMockExamQuestionCount,
  getMockExamTotalSeconds,
  getMockQuestionIdsBySection,
} from "@/lib/mockExam";
import { trackEvent } from "@/lib/analytics";
import type { MockExamAttempt, MockExamResult } from "@/lib/types";

export default function MockExamStart() {
  const router = useRouter();
  const [attempt, setAttempt] = useState<MockExamAttempt | null>(null);
  const [latestResult, setLatestResult] = useState<MockExamResult | null>(null);
  const totalSeconds = getMockExamTotalSeconds();

  useEffect(() => {
    setAttempt(getCurrentMockAttempt());
    setLatestResult(loadLatestMockResult());
  }, []);

  function startNew() {
    const next = createMockExamAttempt(getMockQuestionIdsBySection(), totalSeconds);
    saveMockAttempt(next);
    setCurrentMockAttemptId(next.attemptId);
    trackEvent("diagnostic_started", {
      attempt_id: next.attemptId,
      question_count: getMockExamQuestionCount(),
    });
    router.push("/diagnostic/exam");
  }

  function resume() {
    if (!attempt) return;
    setCurrentMockAttemptId(attempt.attemptId);
    router.push("/diagnostic/exam");
  }

  return (
    <div className="mx-auto max-w-wide px-5 py-12 lg:px-8 lg:py-16">
      <section className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-mango-deep">
            Free UPCAT mock exam
          </p>
          <h1 className="mt-3 font-display text-h1 font-bold text-ink">
            Complete one full mock, then get your estimated UPG.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
            Tero uses the current 63-question bank across Language, Reading, Math, and Science.
            When you finish, see your readiness score, weak topics, and an estimated UPG range.
            Your progress saves automatically — answers, flags, section, question, and remaining
            time.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {attempt?.status === "in_progress" ? (
              <ClayButton onClick={resume} size="lg" variant="primary">
                Resume mock exam
                <ArrowRight aria-hidden className="h-5 w-5" strokeWidth={2} />
              </ClayButton>
            ) : null}
            <ClayButton onClick={startNew} size="lg" variant={attempt ? "secondary" : "primary"}>
              {attempt ? (
                <RotateCcw aria-hidden className="h-5 w-5" strokeWidth={2} />
              ) : (
                <ArrowRight aria-hidden className="h-5 w-5" strokeWidth={2} />
              )}
              {attempt ? "Start over" : "Start mock exam & estimate my UPG"}
            </ClayButton>
            {latestResult ? (
              <ClayButton href={`/results?attemptId=${latestResult.attemptId}`} size="lg" variant="secondary">
                <BarChart3 aria-hidden className="h-5 w-5" strokeWidth={2} />
                View latest results & UPG
              </ClayButton>
            ) : null}
          </div>

          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-ink-faint">
            Estimated UPG is based on your mock exam performance and is not an official UP
            calculation.
          </p>
        </div>

        <aside className="rounded-clay-lg border border-clay-line bg-cream p-6 shadow-clay">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold text-ink">Mock exam format</p>
            <span className="tabular inline-flex items-center gap-1.5 rounded-xl bg-clay px-2.5 py-1 text-xs font-bold text-ink-muted">
              <Clock aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
              {formatDuration(totalSeconds)}
            </span>
          </div>
          <ul className="mt-5 space-y-3">
            {MOCK_EXAM_SECTION_ORDER.map((module, index) => (
              <li
                key={module}
                className="flex items-center justify-between rounded-clay border border-clay-line bg-clay px-4 py-3"
              >
                <div>
                  <p className="text-sm font-bold text-ink">
                    {index + 1}. {MODULES[module].name}
                  </p>
                  <p className="text-xs text-ink-muted">{MODULES[module].blurb}</p>
                </div>
                <span className="tabular text-sm font-bold text-berry">
                  {MODULES[module].itemCount}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  );
}
