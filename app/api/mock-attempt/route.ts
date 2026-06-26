import { NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db";
import type { MockExamAttempt, MockExamResult } from "@/lib/types";
import type { Prisma } from "@/generated/prisma/client";

export const runtime = "nodejs";

function dateFromMs(value?: number): Date | null {
  return typeof value === "number" ? new Date(value) : null;
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const attempt = data.attempt as MockExamAttempt | undefined;
  const result = data.result as MockExamResult | undefined;
  const clientId = typeof data.clientId === "string" ? data.clientId : null;

  if (!attempt?.attemptId || !result?.attemptId || attempt.attemptId !== result.attemptId) {
    return NextResponse.json({ error: "Invalid attempt payload." }, { status: 422 });
  }

  if (!isDbConfigured() || !prisma) {
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        message: "Mock attempt not saved to the database (DATABASE_URL not configured).",
      },
      { status: 200 },
    );
  }

  try {
    await prisma.mockAttempt.upsert({
      where: { id: attempt.attemptId },
      update: {
        clientId,
        status: attempt.status,
        submittedAt: dateFromMs(attempt.submittedAt),
        durationSeconds: result.durationSeconds,
        remainingSeconds: attempt.remainingSeconds,
        rawScore: result.overall.correct,
        rawTotal: result.overall.total,
        weightedScore: result.overall.weightedCorrect ?? null,
        weightedTotal: result.overall.weightedTotal ?? null,
        readinessScore: result.overall.readinessScore ?? result.overall.accuracy,
        sectionScores: toJson(result.modules),
        overallScore: toJson(result.overall),
      },
      create: {
        id: attempt.attemptId,
        clientId,
        status: attempt.status,
        startedAt: dateFromMs(attempt.startedAt) ?? new Date(),
        submittedAt: dateFromMs(attempt.submittedAt),
        durationSeconds: result.durationSeconds,
        remainingSeconds: attempt.remainingSeconds,
        rawScore: result.overall.correct,
        rawTotal: result.overall.total,
        weightedScore: result.overall.weightedCorrect ?? null,
        weightedTotal: result.overall.weightedTotal ?? null,
        readinessScore: result.overall.readinessScore ?? result.overall.accuracy,
        sectionScores: toJson(result.modules),
        overallScore: toJson(result.overall),
      },
    });

    await prisma.mockQuestionResponse.deleteMany({
      where: { attemptId: attempt.attemptId },
    });

    if (result.questionReviews.length > 0) {
      await prisma.mockQuestionResponse.createMany({
        data: result.questionReviews.map((review) => ({
          attemptId: attempt.attemptId,
          questionId: review.questionId,
          section: review.module,
          topic: review.topic,
          difficulty: review.difficulty,
          selectedAnswer: review.selectedAnswer ?? null,
          correctAnswer: review.correctAnswer,
          isAnswered: review.isAnswered,
          isCorrect: review.isCorrect,
          isFlagged: review.isFlagged,
          timeSpentSeconds: Math.round(review.timeSpentSeconds),
        })),
      });
    }

    return NextResponse.json({ ok: true, persisted: true, id: attempt.attemptId }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, persisted: false, error: "Could not save the mock attempt." },
      { status: 500 },
    );
  }
}
