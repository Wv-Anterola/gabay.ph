import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Waitlist signups — idempotent via the unique `email` upsert.
  const signups = [
    {
      email: "maria.santos@example.com",
      gradeLevel: "Grade 12",
      targetYear: "2027",
      paidInterest: true,
      referralSource: "facebook",
    },
    {
      email: "juan.delacruz@example.com",
      gradeLevel: "Grade 11",
      targetYear: "2028",
      paidInterest: false,
      referralSource: "tiktok",
    },
    {
      email: "ana.reyes@example.com",
      gradeLevel: "Gap year",
      targetYear: "2027",
      paidInterest: true,
      referralSource: "friend",
    },
  ];
  for (const s of signups) {
    await prisma.waitlistSignup.upsert({ where: { email: s.email }, update: s, create: s });
  }

  // A sample diagnostic session — only when the table is still empty,
  // so re-running the seed does not pile up duplicate rows.
  if ((await prisma.diagnosticSession.count()) === 0) {
    await prisma.diagnosticSession.create({
      data: {
        clientId: "seed-client",
        module: "math",
        answers: { q1: "a", q2: "c", q3: "b" },
        score: { correct: 2, total: 3, accuracy: 0.67, topics: { algebra: 1, geometry: 1 } },
        durationMs: 240000,
      },
    });
  }

  // A sample analytics event — likewise guarded for idempotency.
  if ((await prisma.analyticsEvent.count()) === 0) {
    await prisma.analyticsEvent.create({
      data: { name: "diagnostic_completed", clientId: "seed-client", props: { module: "math" } },
    });
  }

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
