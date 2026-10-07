# ADR-022: Keep the waitlist in Resend Contacts, not in our database

Status: Accepted (Owner, 2026-10-07, F-19 design)
Date: 2026-10-07
Amends: [ADR-021](ADR-021-production-on-netlify-landing-only.md) (point 2, the production database), [ADR-011](ADR-011-resend-transactional-email.md) (Resend was auth email only)

## Context
F-19 collects emails on a public waitlist (spec, AC-LND-005…018). The spec planned a waitlist table in a new production Neon project, an IP rate limit and Owner scripts to export, remove and expire entries. The Owner doesn't want to keep the emails in Shutrly's own database (Owner, 2026-10-07). Resend is already a vendor (ADR-011), and its free marketing plan stores up to 1,000 contacts, with unlimited broadcasts, so the Owner can invite the list at launch from the same place. Resend keeps one audience per account and divides it with **segments** (checked 2026-10-07).

## Decision
1. **Store waitlist emails as Resend contacts in a segment.** Segment *Shutrly waitlist · production* holds the real list; *Shutrly waitlist · staging* holds staging and local sign-ups, so test sign-ups never mix with real ones. Shutrly's database has no waitlist table.
2. **One server-side submission.** The page posts JSON to `POST /api/waitlist` (a route handler, not a server action, so the edge rate limit can target its path). It validates the email with Zod (trimmed, lowercased, at most 254 characters), drops bot submissions (A-4), and creates the contact in the environment's segment through the Resend Contacts API. Resend answers a repeated email with the same contact and keeps its join time (checked 2026-10-07), so a duplicate is a no-op and the visitor sees the normal success message (A-1). The browser never talks to Resend.
3. **Behind a port.** `features/landing/application` owns a `WaitlistStore` port; the Resend implementation lives in `adapters/email` and is wired in `composition/` (as ADR-011 does for auth email).
4. **Its own secret, its own bindings.** The waitlist uses a separate full-access Resend API key per environment (`RESEND_WAITLIST_API_KEY`) and the segment ID (`RESEND_WAITLIST_SEGMENT_ID`), not the sending-only auth key. The endpoint checks only these two bindings (`getScopedRequestContext`), not the full AppEnv, so it runs where no database or other feature secrets exist. Without them a submission fails (AC-LND-018).
5. **Rate limit at the edge.** A Netlify code-based rate-limit rule on `/api/waitlist` in `netlify.toml`, aggregated by IP; the browser shows HTTP 429 as *try again in a moment*. Rules match by path only, which is why the waitlist has its own path. Netlify allows windows of at most 180 seconds, so A-2 becomes **5 submissions per IP per 3 minutes**. This is free on every Netlify plan and needs no counter table, unlike ADR-013. Resend's own API rate limit is a second line.
6. **Owner tasks move to Resend.** Viewing and exporting the list (filtered by segment), removing one email on request and deleting entries older than 12 months are done in the Resend dashboard, or with small scripts outside `src/` that call the Resend Contacts API. Retention stays manual (A-3).
7. **No production database for now.** While production serves only the landing page (ADR-021), nothing it serves needs Neon. Production gets its own Neon project only when the gate opens. Planning checks that the landing-only build starts without `DATABASE_URL`.

## Alternatives Considered
- **Waitlist table in Neon (the spec's plan):** full control, but the Owner doesn't want the emails in our database, and it means a third Neon project and migrations to run by hand.
- **Netlify Forms:** no backend code, but only 100 submissions a month on the free plan, and it needs a static form file to work with the Next.js runtime.
- **Kit or Brevo:** bigger free tiers, but each adds a new vendor and secret, while Resend is already used.

## Consequences
### Positive
- No waitlist table, migration or production database while the gate is up.
- The Owner can invite the whole list with a Resend broadcast at launch, with unsubscribe built in.
- Removal and export are dashboard actions; fewer scripts to maintain.

### Negative / Trade-offs
- The emails live with a third party (Resend, United States). Resend is a processor of personal data: the privacy note says the email is kept with our email provider, and the cross-border transfer falls under UU PDP (no legal review).
- The free plan holds 1,000 contacts. Past that, Resend's paid marketing plan starts at $40 a month, or the waitlist moves elsewhere. This is an upgrade trigger in the sense of ADR-018.
- A-2 now uses a 3-minute window instead of 10 minutes.
- Resend's contact API decides how duplicates are reported; the adapter must treat "already exists" as success without leaking it to the visitor.
- The waitlist can't be queried with SQL alongside other data; that isn't needed now.

## Related
- Constitution: C-006, C-007, C-010
- Feature: F-19 `landing` ([spec](../../features/landing/spec.md), [acceptance criteria](../../features/landing/acceptance-criteria.md))
- ADR-011, ADR-013, ADR-018, ADR-021
