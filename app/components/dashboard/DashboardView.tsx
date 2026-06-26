"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, FileText, RotateCcw } from "lucide-react";
import ClayButton from "@/app/components/ui/ClayButton";
import { formatDuration, getMockExamTotalSeconds, getMockQuestionIdsBySection } from "@/lib/mockExam";
import {
  createMockExamAttempt,
  loadMockAttempts,
  loadMockResult,
  saveMockAttempt,
  setCurrentMockAttemptId,
} from "@/lib/storage";
import type { MockExamAttempt, MockExamResult } from "@/lib/types";

type Row = {
  attempt: MockExamAttempt;
  result: MockExamResult | null;
};

export default function DashboardView() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    setRows(
      loadMockAttempts().map((attempt) => ({
        attempt,
        result: attempt.status === "submitted" ? loadMockResult(attempt.attemptId) : null,
      })),
    );
  }, []);

  function retake() {
    const next = createMockExamAttempt(getMockQuestionIdsBySection(), getMockExamTotalSeconds());
    saveMockAttempt(next);
    setCurrentMockAttemptId(next.attemptId);
    router.push("/diagnostic/exam");
  }

  return (
    <div className="mx-auto max-w-wide px-5 py-12 lg:px-8 lg:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-h1 font-bold text-ink">Dashboard</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Previous attempts stay in this browser. Retake the mock whenever you want.
          </p>
        </div>
        <ClayButton onClick={retake} variant="primary">
          <RotateCcw aria-hidden className="h-4 w-4" strokeWidth={2} />
          Retake mock exam
        </ClayButton>
      </div>

      <section className="mt-8 rounded-clay-lg border-2 border-clay-line bg-cream p-6 shadow-clay">
        <h2 className="text-lg font-bold text-ink">Previous attempts</h2>
        {rows.length === 0 ? (
          <div className="mt-5 rounded-clay border-2 border-clay-line bg-clay px-5 py-4">
            <p className="text-sm text-ink-muted">No attempts yet.</p>
            <div className="mt-4">
              <ClayButton href="/diagnostic" variant="secondary">
                Start the mock exam
              </ClayButton>
            </div>
          </div>
        ) : (
          <ul className="mt-5 divide-y-2 divide-clay-line">
            {rows.map(({ attempt, result }) => (
              <li
                key={attempt.attemptId}
                className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-ink">
                    {attempt.status === "submitted" ? "Submitted" : "In progress"} ·{" "}
                    {new Date(attempt.startedAt).toLocaleDateString()}
                  </p>
                  <p className="tabular mt-1 text-xs text-ink-muted">
                    {result
                      ? `Readiness ${result.overall.readinessScore ?? result.overall.accuracy}/100 · ${formatDuration(result.durationSeconds)}`
                      : `${formatDuration(attempt.remainingSeconds)} remaining`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {attempt.status === "submitted" && result ? (
                    <>
                      <ClayButton href={`/results?attemptId=${attempt.attemptId}`} variant="secondary">
                        <BarChart3 aria-hidden className="h-4 w-4" strokeWidth={2} />
                        View results
                      </ClayButton>
                      <ClayButton href={`/results/${attempt.attemptId}/review`} variant="ghost">
                        <FileText aria-hidden className="h-4 w-4" strokeWidth={2} />
                        Review
                      </ClayButton>
                    </>
                  ) : (
                    <ClayButton
                      onClick={() => {
                        setCurrentMockAttemptId(attempt.attemptId);
                        router.push("/diagnostic/exam");
                      }}
                      variant="secondary"
                    >
                      Resume
                    </ClayButton>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
