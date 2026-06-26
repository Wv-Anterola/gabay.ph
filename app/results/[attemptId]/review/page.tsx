import type { Metadata } from "next";
import AnswerReviewView from "@/app/components/results/AnswerReviewView";

export const metadata: Metadata = {
  title: "Review UPCAT mock exam answers",
  description: "Review your Tero mock exam answers, explanations, topics, difficulty, and time spent.",
};

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  return <AnswerReviewView attemptId={attemptId} />;
}
