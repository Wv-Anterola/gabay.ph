import type { Metadata } from "next";
import { Suspense } from "react";
import ResultsView from "@/app/components/results/ResultsView";

export const metadata: Metadata = {
  title: "Your UPCAT mock exam results",
  description:
    "Your Tero readiness score, section breakdown, answer review, weak-topic report, and study plan.",
};

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-content px-5 py-24 text-center text-ink-muted">Loading…</div>}>
      <ResultsView />
    </Suspense>
  );
}
