// Prisma v7 config
// - Runtime connection: via PrismaPg adapter di lib/db/prisma.ts (DATABASE_URL)
// - Migrate/seed connection: via datasource.url di sini (DATABASE_URL_UNPOOLED)
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
});
