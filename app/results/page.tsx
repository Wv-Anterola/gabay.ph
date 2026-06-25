import type { Metadata } from "next";
import ResultsView from "@/app/components/results/ResultsView";

export const metadata: Metadata = {
  title: "Your UPCAT readiness results",
  description:
    "Your weak-topic report, module readiness signals, and a 7-day UPCAT study plan based on your diagnostic answers.",
};

export default function ResultsPage() {
  return <ResultsView />;
}
