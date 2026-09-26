// ADR-013 cleanup: delete rate-limit windows older than 2 hours (the longest window is 1 hour).
// Usage: DATABASE_URL=<pooled url> pnpm auth:purge-rate-limits
import { createDb } from "@/adapters/db/client/client";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";

const RETENTION_MS = 2 * 60 * 60 * 1000;

async function main(url: string): Promise<void> {
  const { db, pool } = createDb(url);
  try {
    const cutoff = new Date(Date.now() - RETENTION_MS);
    const removed = await createNeonRateLimiter(db).purgeBefore(cutoff);
    console.log(`Purged ${String(removed)} expired auth rate-limit windows.`);
  } finally {
    await pool.end();
  }
}

function fail(error: unknown): void {
  console.error(error);
  process.exitCode = 1;
}

const url = process.env.DATABASE_URL;
if (url) main(url).catch(fail);
else {
  console.error("Usage: DATABASE_URL=… pnpm auth:purge-rate-limits");
  process.exitCode = 2;
}
