import { NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import {
  failureResponse,
  isPayloadTooLargeError,
  readJsonObject,
  successResponse,
  validateMockAttemptPayload,
} from "@/lib/api/persistence";
import { checkRateLimit, rateLimitHeaders } from "@/lib/api/rate-limit";

export const runtime = "nodejs";

function dateFromMs(value?: number): Date | null {
  return typeof value === "number" ? new Date(value) : null;
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, "mock-attempt", { limit: 10, windowMs: 5 * 60 * 1000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      failureResponse("rate_limited", "Too many mock submissions. Please try again later."),
      { status: 429, headers: rateLimitHeaders(rateLimit) },
    );
  }

  const body = await readJsonObject(request);
  if ("error" in body) {
    return NextResponse.json(
      failureResponse(
        isPayloadTooLargeError(body.error) ? "payload_too_large" : "invalid_json",
        body.error,
      ),
      {
        status: isPayloadTooLargeError(body.error) ? 413 : 400,
        headers: rateLimitHeaders(rateLimit),
      },
    );
  }
  const payload = validateMockAttemptPayload(body.value);
  if ("error" in payload) {
    return NextResponse.json(failureResponse("invalid_payload", payload.error), {
      status: 422,
      headers: rateLimitHeaders(rateLimit),
    });
  }

  if (!isDbConfigured() || !prisma) {
    return NextResponse.json(
      failureResponse(
        "database_unavailable",
        "Mock results remain available in this browser; database persistence is not configured.",
      ),
      { status: 200, headers: rateLimitHeaders(rateLimit) },
    );
  }

  try {
    const { attempt, result, clientId } = payload.value;
    await prisma.$transaction(async (tx) => {
      await tx.mockAttempt.upsert({
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

      await tx.mockQuestionResponse.deleteMany({
        where: { attemptId: attempt.attemptId },
      });
      await tx.mockQuestionResponse.createMany({
        data: result.questionReviews.map((review) => ({
          attemptId: attempt.attemptId,
          questionId: review.questionId,
          section: review.module,
          topic: review.topic,
          difficulty: review.difficulty,
          selectedAnswer: review.selectedAnswer,
          correctAnswer: review.correctAnswer,
          isAnswered: review.isAnswered,
          isCorrect: review.isCorrect,
          isFlagged: review.isFlagged,
          timeSpentSeconds: review.timeSpentSeconds,
        })),
      });
    });

    return NextResponse.json(successResponse(attempt.attemptId), {
      status: 201,
      headers: rateLimitHeaders(rateLimit),
    });
  } catch (error) {
    console.error("[persistence:mock-attempt] write failed", error);
    return NextResponse.json(
      failureResponse("persistence_failed", "Could not save the mock attempt right now."),
      { status: 500, headers: rateLimitHeaders(rateLimit) },
    );
  }
}
