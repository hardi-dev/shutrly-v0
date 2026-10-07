# Feature: Landing page

ID: F-19 · Slug: `landing`
Status: IN VERIFICATION (2026-10-08; design approved, S1–S4 built, see [plan.md](plan.md)) · Intent: [intent.md](intent.md) (ACCEPTED 2026-10-07) · Acceptance criteria: [acceptance-criteria.md](acceptance-criteria.md)
Architecture: [ADR-021](../../architecture/decisions/ADR-021-production-on-netlify-landing-only.md) (production host and the landing-only gate), [ADR-022](../../architecture/decisions/ADR-022-waitlist-in-resend-contacts.md) (the waitlist lives in Resend Contacts)

## Goal
A photographer who opens Shutrly's root URL understands what Shutrly is, who it is for and why it beats their current tools, then leaves their email on a waitlist. During the development phase this page is all that production serves. The Owner reads and maintains the list in Resend (ADR-022).

## User Story
As a photographer or small-studio owner in Indonesia, I want to see quickly what Shutrly does for my business and sign up to hear when it opens, so that I can move my packages, clients, galleries and invoices off scattered tools.

As the Owner, I want interested photographers to leave their email, so that I can invite them when Shutrly opens.

## Preconditions
- Actor: an anonymous visitor (a prospective Owner). Nobody signs in on this page (BR-AUTH-001 is unaffected).
- Production exists as described in ADR-021: the Netlify main URL, `APP_STAGE=production`, and the waitlist's Resend API key and audience ID. No production database is needed while the gate is up (ADR-022).
- The design system is in place (Studio Lime tokens, `docs/design-system/token-usage.md`). The page, logo and visuals come from `/sdv:design-feature landing`.

## Inputs
| Where | Fields |
|---|---|
| Waitlist form (*Gabung waitlist*) | email (required; trimmed; at most 254 characters; a valid address); a hidden field for bots (A-4) |
| Owner, in Resend (no UI in Shutrly) | list or export every entry; remove one entry by email; remove entries older than 12 months |

## Page content
The page is in **English** and is **one screen** (Owner, 2026-10-07, design.md › selected direction `sW37g` / `kE8Eu`; this replaces the earlier Indonesian, six-section outline). It covers:
1. **What it is:** a hero that names Shutrly, says what it manages (projects, photo selections and invoices) under the rotating headline "Less busywork. More photography.", and shows the waitlist form with its privacy note.
2. **The product:** a mockup of the real Projects screen, laptop on desktop and phone on mobile.
3. **Footer:** the copyright year, *Contact* (the removal contact, see Open questions) and *Privacy* (the privacy note).

The studio-in-one-place, galleries, why-it-differs and closing sections of the first outline are out of this version; the design may bring them back later.

Copy describes the full MVP as available (intent, Owner 2026-10-07). It never claims anything the scope excludes: no direct WhatsApp sending (C-106, BR-MSG-001), no uploading or storing photos in Shutrly, no payment gateway, no client accounts, no providers other than Google Drive. It names no competitor and shows no price.

## Main Flow — join the waitlist
1. The visitor opens `/`. The page loads without a session, a database call or a redirect.
2. The visitor types an email and selects the submit button.
3. The button shows a submitting state and can't be pressed again until the request ends.
4. The server trims the email and checks it (required, at most 254 characters, valid format). It lowercases it to compare and store, and checks the rate limit (A-2).
5. The server adds the email as a contact in the Resend waitlist audience, which records when it joined, unless it's already there (A-1).
6. The form is replaced by a success message: the email is on the list, and Shutrly will write when it opens.

## Alternative Flows
- **Already on the list:** the visitor sees the same success message. No second entry is stored, and nothing reveals that the email was already there (A-1).
- **Bot-filled hidden field:** the visitor sees the success message and nothing is stored (A-4).
- **Signed-in Owner on staging or in development:** `/` shows the landing page with no redirect (intent assumption).
- **Production gate (ADR-021):** on production, any route other than `/`, its static assets and the waitlist submission answers *not found* (A-5). That includes sign-in, registration, the Owner app, client links and API routes such as `/api/health`. Staging and local development serve everything.
- **Owner reads the list:** the Owner views or exports the contacts (email, joined at) of the environment's Resend waitlist audience in the Resend dashboard. There is no page in the app.
- **Removal request:** the Owner deletes that email's contact in Resend (dashboard, or a script outside `src/` that calls the Contacts API).
- **Retention:** the Owner deletes contacts more than 12 months old in Resend. Entries are also deleted when the waitlist is closed. Nothing runs on a schedule (A-3).

## Error Cases
- **Empty or invalid email:** an inline error under the field says what to fix. The value stays, focus moves to the field, and nothing is stored.
- **Too many attempts:** the visitor is asked to try again in a moment. Nothing is stored (A-2).
- **Server, Resend or network failure:** a message under the form says it didn't work and to try again. The email stays in the field, nothing is half-stored, and submitting again is safe (A-1 makes it idempotent).
- **Missing or wrong Resend key or audience ID:** the submission fails like a server failure, nothing is stored, and the error is logged without the email.

## Privacy
- A short note under the submit button says that joining means Shutrly may email about the launch, and only that. The email isn't shared or used for anything else, and the person can ask to be removed through the contact in the note (intent, Owner 2026-10-07). There is no consent checkbox.
- Entries are kept as contacts with our email provider, Resend (United States), which processes them for us (ADR-022). They are kept until the waitlist closes or the person asks to be removed. Entries never invited are deleted no later than 12 months after they joined.
- Waitlist emails are never logged, never sent to analytics, and never returned by any endpoint. The submission answers only success or an error (C-006).
- This follows the purpose, consent and deletion-on-request rules of UU PDP (UU 27/2022). No lawyer has reviewed it.

## Business Rules
- No `BR-*` covers a public page or a waitlist. The governing principles are C-001, C-002, C-006, C-007, C-008, C-010 and C-106.
- BR-MSG-001 and the MVP scope limit what the copy may claim.
- The waitlist is platform data, not tenant data. It has no `workspace_id` and lives outside our database (ADR-022), and C-101 and BR-WS-002 don't apply to it (Owner 2026-10-07, FC-002).

## Dependencies
- ADR-021: the production host and the landing-only gate. ADR-022: the waitlist store (Resend Contacts) and the edge rate limit.
- `APP_STAGE` (already set per environment) tells production apart from staging and development.
- A rate limiter for the public submission: a Netlify code-based rate-limit rule on the waitlist endpoint, by IP (ADR-022). The coding rules for public endpoints (rate limits, `Cache-Control: private, no-store`) name only `/g/*`, `/i/*` and media; the waitlist submission follows them as well. That applies the rule; it doesn't conflict with it.
- `/sdv:design-feature landing`: the page, logo and visuals for phone and desktop, all states of the form, and the HTML exports.
- No dependency on Resend: no email is sent to anyone on the list (intent, out of scope).

## Assumptions (low risk, reversible — confirm or change anytime)
- **A-1 Duplicates:** emails are compared case-insensitively after trimming. A second sign-up stores nothing new and shows the same success message.
- **A-2 Rate limit:** at most 5 submissions per IP address in 3 minutes (Netlify's longest window is 180 seconds, ADR-022). Over that, the visitor sees *try again in a moment*.
- **A-3 Manual retention:** the Owner deletes old contacts in Resend. No scheduled job, in line with the free-tier budget (ADR-018).
- **A-4 Bot field:** a field hidden from people and assistive technology catches simple bots. There's no CAPTCHA.
- **A-5 Not found, not redirect:** gated routes on production answer 404 with a plain not-found page in English. They don't redirect to `/`.
- **A-6 Search engines:** production lets search engines index `/` only. The page has an English title, a description and a social-share preview (image from design).
- **A-7 Theme:** the page follows the visitor's light or dark setting, like the app. Design may decide on light only, recorded in design.md (GAP-01).

## Out of Scope
- Pricing, plans, payment and named competitors (intent).
- Opening registration or the Owner app on production, and any change to the auth flow.
- Emails to people on the list: confirmation, campaigns, invitations.
- A page in the app for the waitlist, and waitlist fields other than email.
- Blog, docs, testimonials, custom domains and analytics.
- A scheduled retention job (A-3).

## Flagged Concerns
Checked against the constitution, the business-rules index (no rule covers this feature), ADR-008, ADR-013, ADR-018, ADR-020 and the coding rules (copy, public endpoints).

| ID | Concern | Conflicting sources | Owner decision | Status |
|---|---|---|---|---|
| FC-001 | The waitlist needs a production host and database. ADR-018 assumed Workers Free, ADR-020 left production open, and staging hit error 1102 on Workers. | ADR-018, ADR-020 | Production on the Netlify site's main URL, with its own Neon project and a landing-only gate; recorded as ADR-021 (Owner 2026-10-07). | RESOLVED |
| FC-002 | The waitlist has no `workspace_id`, but the schema conventions put `workspace_id` on tenant rows. | C-101, ADR-003, BR-WS-002 | It's platform-level data, not tenant data, and since ADR-022 it lives in Resend, not in our database. C-101 doesn't change (Owner 2026-10-07). | RESOLVED |

## Open Questions / SPEC GAPS
- **Removal contact:** RESOLVED (Owner 2026-10-08): `hello@shutrly.space`, linked from the privacy note and the footer *Contact*. Mail is received by Namecheap Private Email (MX and SPF in the Netlify DNS zone).
- **Copy for features not built yet:** the Owner chose to present the full MVP as available. Production hides the app, so nobody can test a claim yet. Review the copy again before the gate opens.
