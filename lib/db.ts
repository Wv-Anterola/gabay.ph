/**
 * Backwards-compatible re-export.
 *
 * The Prisma Client singleton now lives in `lib/prisma.ts` (Prisma Postgres via
 * the @prisma/adapter-pg driver adapter). Existing imports from "@/lib/db" keep
 * working unchanged.
 */
export { prisma, isDbConfigured } from "./prisma";
