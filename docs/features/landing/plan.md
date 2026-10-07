# Plan — Landing page (F-19)

Status: S1, S2 DONE (2026-10-07), S3 next · Spec: [spec.md](spec.md) · AC: [acceptance-criteria.md](acceptance-criteria.md) · Design: [design.md](design.md) · Exports: [exports/INDEX.md](exports/INDEX.md) · ADRs: [ADR-021](../../architecture/decisions/ADR-021-production-on-netlify-landing-only.md), [ADR-022](../../architecture/decisions/ADR-022-waitlist-in-resend-contacts.md)

## Owner decisions this plan rests on (2026-10-07)
- **English copy.** The page follows the approved design, which is English. This overrides the spec's Indonesian copy and the coding rule's Indonesian UI default for this page only (the page is pre-signup marketing, not workspace UI). Spec, intent, AC (001, 004, 013) and coding rules › Copy updated in S1, together with the one-screen page content.
- **Waitlist in Resend Contacts** (ADR-022), no database table.
- **Build order:** page UI first (S1), then the waitlist (S2), the production gate (S3) and verification (S4).

## Design references
| State | Desktop | Mobile |
|---|---|---|
| Idle (only state drawn) | `sW37g` [export](exports/landing-waitlist-desktop-sW37g.html) | `kE8Eu` [export](exports/landing-waitlist-mobile-kE8Eu.html) |

Submitting, error and success states of the form aren't drawn (`DESIGN GAP`); S1 derives them from the pill form and the design system and reports them.

## Slices

### S1 — The page at `/` (this iteration)
- `src/features/landing/`:
  - `application/use-cases/join-waitlist/join-waitlist.schema.ts` + `.types.ts` + test: the canonical email schema (trim, lowercase, ≤ 254, valid) and the hidden bot field. Shared by the form now and the server action in S2.
  - `ui/landing-page/`: the page composition (server component): header, hero (intro, form, product mockup), footer.
  - `ui/landing-backdrop/`: the decorative hero material (blueprint grid, brand mesh, grain), CSS only, `aria-hidden`.
  - `ui/rotating-headline/` + `use-rotating-word` hook: "Less busywork./paperwork./back-and-forth." + "More photography."; 2.8 s hold, 300 ms slide/fade, static `busywork.` under `prefers-reduced-motion`; one stable accessible heading.
  - `ui/waitlist-form/` + `use-waitlist-form` hook: connected pill input and button, visually hidden label, bot field hidden from people and assistive tech, idle/submitting/invalid/failed/rate-limited/success states (C-007), privacy note (AC-LND-011).
- `src/app/page.tsx` renders `LandingPage`; `src/app/actions/landing/join-waitlist.ts` is the server action. **Until S2 it validates and answers the server-failure state** (same as AC-LND-018, missing Resend configuration). S1 alone must not be deployed to production.
- Static assets in `public/landing/` (WebP, converted from the Owner's PNGs); the proxy matcher skips `/landing/`.
- Metadata: English title and description for `/` (A-6; share image in S3).
- Tests: schema, rotating word hook, form states, page renders the sections and has no axe violations.

### S2 — Waitlist in Resend (needs the Owner's Resend key and audience IDs)
`WaitlistStore` port, `join-waitlist` use case (bot field → success without storing; duplicates → success), Resend contacts adapter in `adapters/email`, composition entry point, the action calls it, Netlify rate-limit rule (5 per IP per 3 min), redaction tests. AC-LND-005…010, 012, 018.

### S3 — Production gate and metadata
Proxy gate on `APP_STAGE=production` (404 page in English), `robots.txt`, share image, confirm the build starts without `DATABASE_URL`. AC-LND-004, 013, 014.

### S4 — Verification
E2E journey with axe for each form state, visual comparison with both exports at 375 and 1440 px, `/sdv:verify-feature landing`. AC-LND-001…003, 011.

## Token mapping and gaps (S1)
| Design value | Code |
|---|---|
| `#2F5BFF` | `--color-primitive-blue-500` (= `--color-semantic-action-primary`) |
| `#C6F432` | `--color-primitive-lime-300` (= `--color-semantic-accent-highlight`) |
| `#171B24`, `#17202D` | `--color-semantic-text-primary` |
| `#68717E`, `#596575`, `#555E6C` | `--color-semantic-text-secondary` |
| `#727A86`, `#7A8290` | `--color-semantic-text-muted` |
| `#DCE0E6`, `#E5E9F0` | `--color-semantic-border-input`, `--color-semantic-border-default` |
| `#F7F9FD` hero base | `color-mix()` of `blue-50` and `neutral-0` |
| Alpha variants of blue and lime | `color-mix(in srgb, <token> n%, transparent)` |

`DESIGN TOKEN GAP` (Owner chose direct values for the landing, design.md): display sizes 68/32 px and their tracking, 15 px body, the 32/28 px hero radii, the 1440/1100 px frame and the mesh shape. They're kept as raw sizes in the landing UI only, with this note as the written reason (coding rules › Styling).

## Open items
- **Removal contact:** the privacy note needs the Owner's contact address (spec › Open questions). S1 shows the note with the footer *Contact* link; fill the address before ship.
- **Footer links:** *Contact* and *Privacy* have no destinations in the design. S1 renders *Contact* as a `mailto:` once the address exists and *Privacy* as an anchor to the privacy note.
- **Form states** beyond idle aren't drawn (see Design references).

## S1 record (2026-10-07)
- **Built:** `src/features/landing/` (schema, domain email rules, waitlist form and hook, rotating headline and hook, backdrop, header, footer, page), `src/app/page.tsx`, `src/app/actions/landing/join-waitlist.ts`, `public/landing/*.webp`, proxy matcher skips `/landing/`, `use-measured-width` hook for the highlight's width.
- **Checks:** unit tests for every unit, lint and typecheck on the changed files. The build wasn't run. Browser at 1440 × 1100 and 375 / 390 px: matches both exports; no sideways scroll; "Less back-and-forth." is 332 px wide at 375 px.
- **Deviations from the exports:**
  - The privacy note (AC-LND-011, not drawn) adds two lines under the form, so the mockup sits about 54 px lower on desktop.
  - Spacing not on the token scale is rounded to the nearest token (highlight padding 14 → 12 px, intro gap 14/18 → 12/16 px, button padding 18 → 20 px); 56 px desktop gutters, display type, hero heights and radii stay raw (Token mapping above).
  - The mesh and grain are CSS approximations of Pencil's mesh gradient and shader.
  - Below about 360 px wide, "Less back-and-forth." is wider than the column (not drawn; phones of 375 px and up fit).
- **Owner feedback (2026-10-07):** word change is a crossfade (old word slides up and fades, new one rises, 500 ms ease-out); the lime highlight resizes to the new word with a slight overshoot (650 ms, about 6 px at 1440 px); between 768 px and 1440 px the laptop scales to the column width instead of being cropped at the sides.
- **Also changed:** `next.config.ts` turns off dev logging of Server Function arguments, which printed the email (AC-LND-012) and, for auth actions, passwords (C-103).
- **Not yet:** storing emails (S2; a valid email currently gets the server-failure message), the production gate and share image (S3), e2e with axe (S4), the removal contact address (Owner).

## S2 record (2026-10-07)
- **Resend setup (Owner + agent):** segments *Shutrly waitlist · staging* (`d9e5b5d0-d355-4435-823c-6e51ad1f270d`) and *· production* (`3fae0c84-97c0-4d9b-947d-1e810d0d83e0`); keys `shutrly-waitlist-staging` (in `.dev.vars`) and `shutrly-waitlist-production` (in the main checkout's git-ignored `.env.netlify-production`, for the Owner to copy into Netlify's Production context). Both keys appeared in the chat transcript: rotate them before launch.
- **Built:** `WaitlistStorePort`, `WaitlistStoreError`, `joinWaitlist` use case, `adapters/email/waitlist-store` (Resend Contacts), `composition/landing/submit-waitlist` with its own bindings schema, `getScopedRequestContext` in `composition/request-context`, route handler `POST /api/waitlist`, browser `postWaitlist` (429 → rate limited), proxy keeps `/api/waitlist` public, Netlify rate-limit rule. The S1 server action is gone.
- **Checks:** related unit tests (64), lint, typecheck. Against the staging segment through `next dev`: a new email is stored once and lowercased; the same email again answers JOINED with one contact and its join time unchanged; an invalid email and a malformed body answer the field error; a filled bot field answers JOINED and stores nothing; every answer is `Cache-Control: private, no-store`; no email in the server log; the form shows the confirmation and moves focus to it. Test contacts were deleted afterwards.
- **To verify on a Netlify deploy (S3/S4):** the rate-limit rule (a rewrite of `/api/waitlist` onto itself) with the Next.js runtime, and the 429 path. The rule can't run in `next dev`.
- **Found:** this worktree's `.dev.vars` lacks `GOOGLE_DRIVE_API_KEY` and `GALLERY_PASSWORD_KEY`, so the full AppEnv doesn't parse here; the waitlist no longer depends on it.
