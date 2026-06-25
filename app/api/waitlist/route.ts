import { NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 422 },
    );
  }

  if (!isDbConfigured() || !prisma) {
    // Clear, non-crashing response when DATABASE_URL is not set.
    return NextResponse.json(
      {
        error:
          "The waitlist database is not configured yet. Set DATABASE_URL to enable signups.",
      },
      { status: 503 },
    );
  }

  try {
    const signup = await prisma.waitlistSignup.upsert({
      where: { email },
      update: {
        gradeLevel: typeof data.gradeLevel === "string" ? data.gradeLevel : undefined,
        targetYear: typeof data.targetYear === "string" ? data.targetYear : undefined,
        paidInterest: data.paidInterest === true,
        referralSource:
          typeof data.referralSource === "string" ? data.referralSource : undefined,
      },
      create: {
        email,
        gradeLevel: typeof data.gradeLevel === "string" ? data.gradeLevel : null,
        targetYear: typeof data.targetYear === "string" ? data.targetYear : null,
        paidInterest: data.paidInterest === true,
        referralSource:
          typeof data.referralSource === "string" ? data.referralSource : null,
      },
    });

    return NextResponse.json({ ok: true, id: signup.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not save your signup right now. Please try again later." },
      { status: 500 },
    );
  }
}
