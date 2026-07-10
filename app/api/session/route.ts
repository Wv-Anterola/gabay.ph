import { NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db";
import {
  failureResponse,
  isPayloadTooLargeError,
  readJsonObject,
  successResponse,
  toJson,
  validateSessionPayload,
} from "@/lib/api/persistence";
import { checkRateLimit, rateLimitHeaders } from "@/lib/api/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, "session", { limit: 20, windowMs: 60 * 1000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      failureResponse("rate_limited", "Too many diagnostic submissions. Please try again shortly."),
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
  const payload = validateSessionPayload(body.value);
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
        "Diagnostic results remain available in this browser; database persistence is not configured.",
      ),
      { status: 200, headers: rateLimitHeaders(rateLimit) },
    );
  }

  try {
    const session = await prisma.diagnosticSession.create({
      data: {
        clientId: payload.value.clientId,
        module: payload.value.module,
        answers: payload.value.answers,
        score: toJson(payload.value.score),
        durationMs: payload.value.durationMs,
      },
    });
    return NextResponse.json(successResponse(session.id), {
      status: 201,
      headers: rateLimitHeaders(rateLimit),
    });
  } catch (error) {
    console.error("[persistence:session] write failed", error);
    return NextResponse.json(
      failureResponse("persistence_failed", "Could not save the diagnostic session right now."),
      { status: 500, headers: rateLimitHeaders(rateLimit) },
    );
  }
}
