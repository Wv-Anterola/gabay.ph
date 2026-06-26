import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const signups = await prisma.waitlistSignup.count();
  console.log(`✅ Connected — ${signups} waitlist signup(s) in the database.`);
}

main()
  .catch((e) => {
    console.error("❌ Prisma verification failed:\n", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
