import { NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";

const MODULES = new Set(["language", "reading", "math", "science"]);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const moduleId = typeof data.module === "string" ? data.module : "";

  if (!MODULES.has(moduleId)) {
    return NextResponse.json({ error: "Unknown module." }, { status: 422 });
  }
  if (typeof data.answers !== "object" || data.answers === null) {
    return NextResponse.json({ error: "Missing answers." }, { status: 422 });
  }

  if (!isDbConfigured() || !prisma) {
    // App still works via localStorage; just report that DB persistence is off.
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        message:
          "Diagnostic session not saved to the database (DATABASE_URL not configured). Your results remain available locally.",
      },
      { status: 200 },
    );
  }

  try {
    const session = await prisma.diagnosticSession.create({
      data: {
        clientId: typeof data.clientId === "string" ? data.clientId : null,
        module: moduleId,
        answers: data.answers as object,
        score: (data.score ?? {}) as object,
        durationMs: typeof data.durationMs === "number" ? Math.round(data.durationMs) : null,
      },
    });
    return NextResponse.json({ ok: true, persisted: true, id: session.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, persisted: false, error: "Could not save the session." },
      { status: 500 },
    );
  }
}
