import { NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db";
import {
  failureResponse,
  isPayloadTooLargeError,
  readJsonObject,
  successResponse,
  validateWaitlistPayload,
} from "@/lib/api/persistence";
import { checkRateLimit, rateLimitHeaders } from "@/lib/api/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, "waitlist", { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      failureResponse("rate_limited", "Too many signup attempts. Please try again later."),
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
  const payload = validateWaitlistPayload(body.value);
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
        "Waitlist signups are unavailable while the database is not configured.",
      ),
      { status: 503, headers: rateLimitHeaders(rateLimit) },
    );
  }

  try {
    const signup = await prisma.waitlistSignup.upsert({
      where: { email: payload.value.email },
      update: {
        gradeLevel: payload.value.gradeLevel ?? undefined,
        targetYear: payload.value.targetYear ?? undefined,
        paidInterest: payload.value.paidInterest,
        referralSource: payload.value.referralSource ?? undefined,
      },
      create: {
        email: payload.value.email,
        gradeLevel: payload.value.gradeLevel,
        targetYear: payload.value.targetYear,
        paidInterest: payload.value.paidInterest,
        referralSource: payload.value.referralSource,
      },
    });

    return NextResponse.json(successResponse(signup.id), {
      status: 201,
      headers: rateLimitHeaders(rateLimit),
    });
  } catch (error) {
    console.error("[persistence:waitlist] write failed", error);
    return NextResponse.json(
      failureResponse(
        "persistence_failed",
        "Could not save your signup right now. Please try again later.",
      ),
      { status: 500, headers: rateLimitHeaders(rateLimit) },
    );
  }
}
