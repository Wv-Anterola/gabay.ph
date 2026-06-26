import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

/**
 * Prisma Client singleton — Prisma Postgres via the @prisma/adapter-pg driver adapter.
 *
 * If DATABASE_URL is not set, `prisma` is null and API routes return a clear
 * "database not configured" error instead of crashing. App pages never import
 * this module, so they run fine without a database.
 *
 * Server-side only. Never import this from a client component.
 */

declare global {
  // eslint-disable-next-line no-var
  var __gabayPrisma: PrismaClient | null | undefined;
}

function createClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  try {
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({ adapter });
  } catch {
    return null;
  }
}

export const prisma: PrismaClient | null =
  globalThis.__gabayPrisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__gabayPrisma = prisma;
}

export function isDbConfigured(): boolean {
  return prisma !== null;
}
