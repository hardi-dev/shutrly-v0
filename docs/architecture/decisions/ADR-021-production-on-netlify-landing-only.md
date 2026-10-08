# ADR-021: Run production on Netlify, serving only the landing page during development

Status: Accepted (Owner, 2026-10-07, F-19 discovery) · Point 2 amended by [ADR-022](ADR-022-waitlist-in-resend-contacts.md): the waitlist lives in Resend Contacts, so production needs no Neon project until the gate opens
Date: 2026-10-07
Amends: [ADR-018](ADR-018-free-tier-runtime-budget.md) (production host: point 2 answered with another host, as ADR-020 did for staging), [ADR-020](ADR-020-staging-on-netlify.md) (it left the production host open)

## Context
F-19 puts a public landing page with an email waitlist at `/` on production. Production has had no host since staging left Cloudflare Workers after error 1102 (ADR-020). During the development phase the Owner wants production to serve the landing page only, with every other route hidden (F-19 intent, Owner 2026-10-07). The waitlist needs a production database.

## Decision
1. **Production runs on the Netlify site `shutrly`**, at its main URL, deployed by hand with `pnpm deploy:prod` from a clean, up-to-date `main` (`scripts/deploy/netlify-deploy.sh`). It is the same build as staging, with the binding source `process.env` (ADR-020 point 2).
2. **Production has its own Neon project.** The Owner creates it and sets its variables for the Netlify production context (`DATABASE_URL`, `APP_STAGE=production`, and any others the served routes need). Only the Owner runs migrations against it; agents never do (AGENTS.md hard stop).
3. **Landing-only gate.** While the development phase lasts, production serves the landing page and what it needs: its static assets and the waitlist submission. Every other page and API route answers as not found. The gate is keyed on `APP_STAGE=production`, so staging and local development serve everything. The gate goes away by a later Owner decision, not by an ADR.

## Alternatives Considered
- **Cloudflare Workers Free:** runs at the edge and is faster, but staging hit error 1102 there. That's too risky for the first public page.
- **Decide the host later:** the waitlist can't collect anything until production exists.

## Consequences
### Positive
- One host, one build and one deploy script for staging and production.
- The public surface of production is one page and one endpoint, so features in progress can't leak.

### Negative / Trade-offs
- Latency is ~0.5 s per request above the edge, because Netlify Free runs functions in `us-east-2` (ADR-020 › Measurements). The landing page should be static, so this cost falls mostly on the waitlist submission.
- Netlify Free has 300 credits a month, shared by staging and production deploys.
- The Owner has to provision a third Neon project and keep its migrations in step by hand until CI exists.

## Related
- Constitution: C-006, C-010
- Feature: F-19 `landing` ([intent](../../features/landing/intent.md), [spec](../../features/landing/spec.md))
- ADR-008, ADR-009, ADR-018, ADR-020; `docs/architecture/tech-stack.md` › Deployment
