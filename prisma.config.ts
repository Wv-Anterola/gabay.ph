import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma CLI commands (especially migrations) should use a direct connection.
// The app runtime continues to use DATABASE_URL through lib/prisma.ts, where a
// pooled URL is safe for serverless deployments.
const databaseUrl =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  "postgresql://user:password@localhost:5432/tero";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
