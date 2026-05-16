// Prisma config — supports Neon connection pooling
// DATABASE_URL       = pooled URL (runtime queries via Neon pooler)
// DATABASE_URL_UNPOOLED = direct URL (prisma migrate / seed)
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DATABASE_URL"],
  },
});
