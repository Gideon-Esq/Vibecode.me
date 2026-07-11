import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Migrations need a DIRECT (non-pooled) connection. On Supabase/Neon,
    // set DIRECT_URL to the direct string (port 5432) and DATABASE_URL to
    // the pooler; locally one URL serves both.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
  migrations: {
    path: "prisma/migrations",
  },
});
