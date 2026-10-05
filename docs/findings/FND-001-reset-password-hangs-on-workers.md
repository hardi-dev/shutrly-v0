# FND-001 — `POST /reset-password` hangs on Cloudflare Workers

Status: OPEN · Found: 2026-10-05 · Found by: the F-09 free-tier CPU measurement (a throwaway Worker, see [ADR-018](../architecture/decisions/ADR-018-free-tier-runtime-budget.md) › Measurement) · Area: auth on Workers · Severity: medium. A user who forgets the password can't finish recovery on a Workers deployment; nothing else was affected.

## Symptom
Submitting *Buat kata sandi baru* on `/reset-password?token=…` leaves the button on *Menyimpan…* and the request pending. The browser showed `POST /reset-password` with no status for more than three minutes.

## Evidence
- `wrangler tail --format json` for that request, logged only after the tab was closed: `cpuTime` 176 ms, `wallTime` **549,628 ms**, outcome `canceled`. So it was waiting, not computing.
- Earlier requests in the same Worker logged `unhandledRejection: Error: Unhandled error. (Uncaught Error: Network connection lost.)`: one after `POST /register` (CPU 147 ms, wall 1,525 ms) and two after `POST /forgot-password` (CPU 71 ms, wall 742 ms).
- The reset *email* was sent and its link worked; opening the link page (`GET /reset-password?token=…`) returned 200.
- Environment: OpenNext build of branch `feat/gallery-free-tier`, Workers Free account, Neon non-production database through the serverless WebSocket `Pool` (ADR-009), Resend for email.

## What still works
On the same Worker, `POST /login` (444 ms CPU, 785 ms wall) and every gallery server action finished in under 1.5 s. The reset flow passes its tests locally.

## Suspected cause (unproven)
The path is `resetWithLink` → `identity.resetPassword`: `deps.links.consume` (one `DELETE … RETURNING` on `auth_latest_link`) and then Better Auth's `auth.api.resetPassword`. Something in it waits on a database connection that never answers. Leads, in order:
1. A Pool connection or transaction left open or lost (the `Network connection lost` rejections), so a later query on the same request waits for ever (ADR-009: one `Pool` per request, ended with `waitUntil(pool.end())`).
2. A transaction inside the Better Auth database adapter (`src/adapters/db/better-auth-database`), for example while it deletes sessions after a password reset.
3. Not the password hash: registration hashes in 147 ms CPU on the same Worker.

## How to reproduce
1. `pnpm exec opennextjs-cloudflare build`, then `wrangler deploy --name <throwaway> --secrets-file <non-production secrets>`; set `BETTER_AUTH_URL` to the Worker URL.
2. Use the named test owner (`scripts/dev/show-test-owner.sh`) and its mailbox, or any account whose email you can read; request a reset on the Worker and open the emailed link.
3. Submit a new password and watch `wrangler tail --format json`.
4. Delete the Worker afterwards (it is public and talks to the shared database).

## Fix plan
Reproduce first; find which await never returns (log before and after each step with the request id, no secrets). Write a test that holds the same condition (an integration test with a connection that drops, or a unit test on the adapter's transaction use) before changing code. Then check `register` and `forgot-password` for the same `Network connection lost`, because they may share the cause.

## Related
- [FND-002](FND-002-gallery-page-save-failed-once-in-e2e.md): another unexplained database-side error seen once.
- ADR-009 (Neon serverless driver), ADR-002 (Better Auth owns identity).
