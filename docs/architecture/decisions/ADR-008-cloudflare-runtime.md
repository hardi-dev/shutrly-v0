# ADR-008: Run Next.js on Cloudflare Workers via OpenNext, Neon via serverless driver

Status: Accepted
Date: 2026-09-25

## Context
Cloudflare is a fixed constraint for DNS/TLS/edge protection and "deployment/runtime compatible with the selected Next.js adapter". The source docs do not pin the runtime. Neon must be reachable from that runtime; Drive listing and password hashing must work there.

## Decision
- Deploy Next.js to Cloudflare Workers using the OpenNext Cloudflare adapter (Node.js compatibility enabled).
- Connect to Neon using its serverless driver — decided in [ADR-009](ADR-009-neon-serverless-driver.md) (WebSocket `Pool`, per request).
- Neon remains the only source of truth; no domain state in KV/D1/Durable Objects. Rate limiting via Cloudflare features; per-account auth limits are amended by [ADR-013](ADR-013-auth-rate-limit-store.md) (Neon counters).

## Alternatives Considered
- Vercel hosting with Cloudflare only as DNS/proxy — simpler Next.js support, but contradicts "Cloudflare runtime" preference.
- Self-hosted Node container behind Cloudflare.

## Consequences
### Positive
- One vendor for edge, security, and runtime.
### Negative / Trade-offs
- Some Next.js/Node APIs and libraries (password hashing, Better Auth internals) must be verified on Workers.
- Interactive transactions need the WebSocket `Pool`, not plain HTTP queries (see ADR-009).

## Related
- Constitution: C-005
- Confirmed by Owner 2026-09-25.
