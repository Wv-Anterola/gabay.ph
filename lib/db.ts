import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 *
 * If DATABASE_URL is not set, `prisma` is null and API routes return a clear
 * "database not configured" error instead of crashing. App pages never import
 * this module, so they run fine without a database.
 */

declare global {
  // eslint-disable-next-line no-var
  var __gabayPrisma: PrismaClient | null | undefined;
}

function createClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  try {
    return new PrismaClient();
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
