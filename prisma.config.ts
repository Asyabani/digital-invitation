import { defineConfig } from "prisma/config";

// Muat variabel lingkungan untuk perintah Prisma (migrate/studio/introspect).
// Script db:* sudah memakai `dotenv -e .env.local`, ini jaring pengaman tambahan.
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
