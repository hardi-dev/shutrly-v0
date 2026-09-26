import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Does not override variables that are already set (tests stub them).
config({ path: ".dev.vars", quiet: true });

const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  throw new Error(
    "DATABASE_URL_UNPOOLED is missing (.dev.vars). Migrations use Neon's direct connection (ADR-009).",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/adapters/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
