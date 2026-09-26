# ADR-013: Auth rate limits stored in Neon behind a RateLimiter port

Status: Accepted (Owner 2026-09-27)
Date: 2026-09-26

## Context
F-01 requires per-email and per-IP limits over long windows (A-6): login 5 failed attempts / 15 min, register, forgot-password and resend 3 / hour per email and 20 / hour per IP. ADR-008 says "rate limiting via Cloudflare features" and keeps domain state out of KV/D1/Durable Objects. Cloudflare's Workers rate-limit binding only supports 10 s or 60 s periods and cannot key on a value inside the request body (the email), and WAF rate-limit rules key on request attributes, not form fields. Neither can express A-6 on its own.

## Decision
- Auth rate limits are enforced by an application `RateLimiter` port (`features/auth/application/ports/rate-limiter`), called by the use cases.
- The production adapter (`adapters/rate-limit/neon-rate-limiter`) stores fixed-window counters in a Neon table `auth_rate_limit(key, window_start, count)` and increments them atomically with `INSERT … ON CONFLICT DO UPDATE … RETURNING count`.
- Keys are `operation:sha256(normalised email)` or `operation:ip`; raw emails are never stored in the table.
- A scheduled cleanup deletes expired windows.
- Cloudflare WAF rate limiting stays in front as a coarse per-IP flood guard; it is not the authority for A-6.
- This amends ADR-008's "rate limiting via Cloudflare features" for per-account auth limits only. Public client endpoints (`/g/*`, `/i/*`) decide their own mechanism in their features.

## Alternatives Considered
- Workers rate-limit binding only: cannot express 15-minute or 1-hour windows or per-email keys.
- Durable Objects counters: precise and fast, but adds state outside Neon, contrary to ADR-008.
- Better Auth's built-in rate limiter: keyed by IP and path, not by normalised email; kept as defence-in-depth only if it does not conflict.

## Consequences
### Positive
- Exact A-6 semantics, testable with an in-memory fake, and no new vendor state.
### Negative / Trade-offs
- An extra Neon write on every limited auth request (login, register, forgot, resend) adds latency.
- The table needs periodic cleanup.

## Related
- Constitution: C-006
- Feature: F-01 (spec A-6; AC-AUTH-010, AC-AUTH-016)
- ADR-008, ADR-009
