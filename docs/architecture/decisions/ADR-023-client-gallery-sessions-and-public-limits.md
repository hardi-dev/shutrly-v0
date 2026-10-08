# ADR-023: Client gallery sessions are signed cookies; public limits reuse the Neon counters

Status: Accepted (2026-10-06, with the F-10 plan; Owner 2026-10-06, delegated: "jawab sesuai rekomendasi kamu").
Date: 2026-10-06
Amends: [ADR-013](ADR-013-auth-rate-limit-store.md) (the counter table also serves the public client endpoints, as ADR-013 left open).

## Context
F-10 opens `/g/{token}`, the first page that clients without an account use. Two mechanisms are needed that no earlier feature decided:

- **A client session.** After the gallery password, the client stays signed in on that browser for 30 days (spec A-1). The session must end at once when the Owner rotates the gallery password (`password_version` changes, BR-GAL-003) or the link (the token changes, BR-PRJ-003), and when the gallery stops being available.
- **Public limits.** Password attempts per token and address, unknown tokens per address, and selection writes per session (BR-ACC-004, spec A-2), with windows of 1 to 60 minutes.

On Workers Free every request has 10 ms CPU and 50 subrequests (ADR-018), and the database is the only state store (ADR-008).

## Decision
1. **Stateless signed cookie, no session table.**
   - Cookie `shutrly_gallery`, `HttpOnly; Secure; SameSite=Lax; Path=/g/<token>; Max-Age` 30 days.
   - Value: a base64url JSON payload `{ v, sid, projectId, galleryId, pv, th, exp }` and an HMAC-SHA-256 of it with a new Worker secret `CLIENT_SESSION_KEY`, compared in constant time. `pv` is the gallery's `password_version`; `th` is a SHA-256 prefix of the token; `sid` is random and keys the selection-write limit.
   - A request is signed in only if the MAC holds, `exp` is in the future, `th` matches the token in the URL, and `projectId`, `galleryId` and `pv` match what the token resolves to. Gallery availability is checked separately on every request.
   - Password rotation changes `pv`, and link rotation changes `th` and the cookie path, so every older session stops working without a write.
2. **Public limits use the ADR-013 counter table and adapter.**
   - The gallery's `GalleryRateLimiterPort` (F-09 D-19) gains `peek`. Composition passes the same `createNeonRateLimiter` object, so the counters are atomic upserts in the existing table.
   - Keys are hashed (`sha256` of the token and of the address), so the table never holds a token or an IP in clear (C-103).
   - The unknown-token limit is checked with `peek` before the token lookup and counted only when the token matches no project. Password limits are counted before the hash compare.
3. **Everything a client calls lives under `/g/{token}`**: pages, server actions posted from those pages, the image-fallback route and the file-download route. One cookie path covers them all.

## Alternatives considered
- **A `client_session` table.** Revocable one by one, but it costs a query and a write per sign-in and a read per request, and rotation would need a delete across sessions. Nothing in the spec revokes a single session. Rejected.
- **Better Auth anonymous sessions.** They mix client access with Owner identity, which BR-ACC-003 keeps apart. Rejected.
- **Cloudflare's rate-limit binding.** Only 10 s or 60 s periods (ADR-013). Rejected for the 15- and 60-minute windows; WAF stays as a coarse flood guard.
- **Encrypting the cookie.** The payload holds no secret; signing is enough.

## Consequences
### Positive
- No extra query to check a session; rotation ends sessions for free.
- No new storage, vendor or binding.

### Negative / trade-offs
- A single session can't be revoked on its own before it expires; rotating the password or link ends all of them.
- A new secret to provision (`CLIENT_SESSION_KEY`) for non-production and production. Rotating it signs every client out.
- The counter table, named `auth_rate_limit`, now also holds client keys; the cleanup script covers both.

## Related
- Constitution C-004, C-006, C-103, C-104
- Business rules: BR-ACC-001, BR-ACC-003, BR-ACC-004, BR-GAL-003, BR-PRJ-003
- F-10 technical design D-3…D-6
- ADR-008, ADR-013, ADR-017, ADR-018
