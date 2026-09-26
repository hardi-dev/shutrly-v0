// Operator-only status change (BR-AUTH-005, AC-AUTH-015). Revokes every session of the user.
// Usage: DATABASE_URL=<pooled url> pnpm auth:set-status <email> <ACTIVE|SUSPENDED|DISABLED>
import { createDrizzleAccountDirectory } from "@/adapters/db/account-directory/drizzle-account-directory";
import { createDb } from "@/adapters/db/client/client";
import { setOwnerStatus } from "@/features/auth/application/use-cases/set-owner-status/set-owner-status";

async function main(email: string, status: string, url: string): Promise<void> {
  const { db, pool } = createDb(url);
  try {
    const accounts = createDrizzleAccountDirectory(db);
    const result = await setOwnerStatus({ accounts, requestId: "operator" }, { email, status });
    if (result.ok)
      console.log(`User ${result.userId} is now ${status}; every session was revoked.`);
    else {
      console.error(`Not changed: ${result.reason}`);
      process.exitCode = 1;
    }
  } finally {
    await pool.end();
  }
}

function fail(error: unknown): void {
  console.error(error);
  process.exitCode = 1;
}

const [email, status] = process.argv.slice(2);
const url = process.env.DATABASE_URL;
if (!email || !status || !url) {
  console.error("Usage: DATABASE_URL=… pnpm auth:set-status <email> <ACTIVE|SUSPENDED|DISABLED>");
  process.exitCode = 2;
} else {
  main(email, status, url).catch(fail);
}
