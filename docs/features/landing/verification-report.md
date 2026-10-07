# F-19 Landing — verification report

Date: 2026-10-08 · Verifier: agent (`/sdv:verify-feature landing`, related checks only) · Branch `feat/landing` at `c4ac1db` · Result: **NOT DONE: 3 blocking items, all Owner or deploy actions**. The code meets the spec. What's missing is the removal contact, the edge rate-limit check and the Owner's Resend checks.

Sources: [intent.md](intent.md), [spec.md](spec.md), [acceptance-criteria.md](acceptance-criteria.md) (AC-LND-001…018), [design.md](design.md), [exports/](exports/INDEX.md) (`sW37g`, `kE8Eu`), [plan.md](plan.md) (S1–S4 records), constitution v1.2, `docs/coding-rules.md` v2.0, ADR-018/020/021/022, `docs/design-system/token-usage.md` (rules v3.1, **APPROVED**, so its deviations below are real findings, not just advisory). No `BR-*` covers this feature (spec › Business Rules), and no UML diagrams exist for it.

## Scope of this run

- **Run:** typecheck, ESLint and Prettier on every changed source and test file, `pnpm tokens:check`, and the 19 related unit/dom test files. I also ran `pnpm build` without `DATABASE_URL` and `next start` with only `APP_STAGE=production` (port 3200), probing the gate, the waitlist and the metadata with `curl`. The landing e2e spec (13 tests) ran against that production build. Screenshots of the page and both Pencil exports were compared at 1440 × 1100, 390 × 879 and 375 × 812. `/` and `/login` were also probed on the worktree's dev server (development stage).
- **Not run, on purpose:** the full unit, integration and e2e suites (Owner rule). Nothing ran against Resend or Netlify, so no contact was written.

## Quality gate

| Check | Result |
|---|---|
| `pnpm typecheck` | PASS |
| ESLint on changed `src/` and `tests/` files | PASS (no output) |
| Prettier on changed files and the landing docs | PASS |
| `pnpm tokens:check` | PASS: 623 tokens, CSS variable usage valid |
| Unit/dom, 19 related files | PASS: 67 tests |
| `pnpm build` without `DATABASE_URL` | PASS; `/` is prerendered static, `/opengraph-image.jpg` static |
| `tests/e2e/landing/landing.spec.ts` against the production build | PASS: 13/13 (axe WCAG 2.1 AA in idle, invalid, failed, rate-limited and joined states at 1440 and 375 px) |
| Migrations | None (ADR-022: no table) |

## Acceptance criteria

| AC | Result | Evidence |
|---|---|---|
| 001 Page explains Shutrly | PASS | `landing-page.test`, `rotating-headline.test`, e2e. The copy has no price, no competitor and no excluded claim (checked in the `*.copy.ts` files). |
| 002 Phone and desktop | PASS with deviations | e2e: no sideways scroll at 1440 and 375 px. The screenshots match both exports except for V-1…V-3 below. |
| 003 Accessible page and form | PASS (see A-3) | e2e axe in every form state, keyboard order, bot field never focused, error `role="alert"`, focus moves to the confirmation |
| 004 Search and share metadata | PASS (see D-6) | Production build: English title, description, `og:*`/`twitter:*` with the 1200 × 630 image. `robots.txt` is `Allow: /$`, `Disallow: /`. `robots.test`. |
| 005 Join the waitlist | PASS | `join-waitlist.test`, `waitlist-form.test` (button disabled while submitting), e2e (trimmed payload, confirmation). The real store was checked against the staging segment (plan › S2 record). |
| 006 Invalid email | PASS | schema, use-case and form tests (empty, `rina@`, > 254), e2e (value kept, field focused) |
| 007 Joining twice | PASS (documented verification) | `waitlist-email.test` (normalization). Resend no-op checked by hand on staging (S2 record). See risk R-1. |
| 008 Too many attempts | **OPEN (blocking)** | Only the browser's mapping of 429 is tested (`post-waitlist.test`, e2e with a mocked 429). The `netlify.toml` rule has never run on a Netlify deploy. |
| 009 Bot field filled | PASS | `join-waitlist.test`; curl on the production build answered `JOINED` |
| 010 Server failure | PASS | adapter, use-case, form and e2e tests |
| 011 Privacy note | **FAIL (blocking)** | The note is there, with no checkbox, but **no contact is shown**: the copy says "removed whenever you ask" with no address, and the footer *Contact* is inert text. The AC requires removal "through the contact shown". |
| 012 Email stays private | PASS | adapter drops the network error, the use case reports only the reason and status, and the production build answers `Cache-Control: private, no-store`. The log line from my run (`NOT_CONFIGURED`, request ID) has no email. Dev logging of server-function arguments is off. |
| 013 Production serves only the landing page | PASS | Production build: `/login`, `/register`, `/w/123`, `/onboarding/workspace`, `/api/health`, `/api/auth/get-session`, `/nope` answer 404 with the English page and no redirect, with or without a session cookie. `/`, `/robots.txt`, `/opengraph-image.jpg`, `/landing/*.webp` and `POST /api/waitlist` work. A server action ID POSTed to `/` answers 404 (no gate bypass). `proxy.test`, `app-stage.test`. |
| 014 Staging and development serve everything | PASS | `proxy.test`, `app-stage.test`. On the dev server, `/` answers 200 with and without a session cookie, and `/login` is neither gated nor redirected. It answers 500 only because this worktree's `.dev.vars` lacks `GOOGLE_DRIVE_API_KEY` and `GALLERY_PASSWORD_KEY` (an environment issue, already in plan › S2). |
| 015 List and export | **OPEN (blocking)** | Owner check in Resend, "checked by hand once before ship"; not recorded yet |
| 016 Remove one entry | **OPEN (blocking)** | same |
| 017 Delete after 12 months | **OPEN (blocking)** | same |
| 018 Missing configuration | PASS | `join-waitlist.test`; the production build with no Resend bindings answered `FAILED` and logged `NOT_CONFIGURED` without the email |

## Constitution and coding rules

- **C-001/C-002/C-106:** no invented behaviour. The copy stays inside the MVP scope.
- **C-004/C-006:** the server re-validates with the shared schema. Secrets stay server-side (`getScopedRequestContext`). The browser never talks to Resend. The gate fails closed when `APP_STAGE` can't be read.
- **C-007:** idle, submitting, invalid, failed, rate-limited and joined states are implemented. They aren't drawn in Pencil (DESIGN GAP, already reported in the plan).
- **C-008:** passes axe. See A-1…A-3 for the advisory items.
- **C-010:** no new dependency. The Netlify rule and Resend Contacts are recorded in ADR-022.
- **C-011/C-012:** the documents have drifted (D-10). The rest is reported in the plan.
- **Coding rules:** boundaries, `server-only`, copy in `*.copy.ts` with `// not in Pencil`, named handlers and JSDoc all pass lint. Exceptions: see D-3 (React Aria wrappers) and D-11 (tests).

## Design-system compliance (`token-usage.md`, APPROVED)

The Owner told the design to use "direct values" except for the primary and secondary colours and the font (design.md › Previous Owner direction). `landing.pen` uses no library instances. That instruction is recorded in the feature's design.md, **not as an exception in `token-usage.md`**, so the deviations below stand until the rules record it.

- **G2: primitives in code (8 references).** `landing-backdrop.tsx` uses `blue-500`, `blue-450`, `blue-700`, `lime-300` and `lime-400`. `landing-header.tsx` uses `neutral-0` (the badge background). `landing-page.tsx` uses `blue-50` and `neutral-0` (the hero base).
- **G5: fg/bg pairing, latent.** The text uses semantic tokens, which switch in dark mode, but the hero background is mixed from primitives, which don't. If `data-theme="dark"` were set, `text.primary` (neutral 0) would sit on a near-white hero. Today nothing sets the dark theme, so the page is light-only in practice. Spec A-7 asked for that choice to be recorded in design.md (GAP-01), and it isn't.
- **G4: raw values beyond the plan's DESIGN TOKEN GAP list.** The plan lists the display sizes, the 15 px body, the 32/28 px radii, the frame heights and the mesh. These raw values aren't on that list:
  - the pill: 54/60 px height and the 178 px button width (`component.input.height` exists);
  - the wordmark: 20/26 px with its tracking, and the 30 px logo;
  - the dots: 5 and 7 px; `size-2`, `md:size-10` and `h-10` are Tailwind's default scale, not tokens;
  - the footer: 72/104 px height;
  - widths: 1408, 1296, 1217, 820, 600, 536 and 334 px; the phone image is 775 px tall;
  - the overline tracking: 1.5/1.7 px;
  - the grain opacity: 0.06;
  - the motion durations and easings (there are no motion tokens).
- **G3: semantic tokens where component tokens exist.** The pill uses `action-primary`, `border-input`, `status-danger-fg` and `text-muted`. The library has `component.button.primary-*`, `component.input.border` / `border-error` / `error-text` / `placeholder`.
- **SP1:** the 56 px desktop gutter (`md:px-14`) is off the ladder. The plan records it.
- **SP7:** the phone mockup uses a negative margin (`-mt-(--space-5)`).
- **SP6 (advisory):** half-steps appear in the header lockup gap (`md:gap-(--space-2-5)`). Inside the *Coming soon* badge they're allowed.
- **SP5 (no padding overrides on linked instances):** not applicable. The page has no library instances, so this is not counted as linked.

## Visual fidelity (exports `sW37g`, `kE8Eu`)

The header, headline with the lime highlight, description, pill form, helper line, hero radii, mockup mask and footer match at 1440 and 390 px. 375 px fits too, with no sideways scroll.

- **V-1:** the privacy note (AC-LND-011, not drawn) pushes the mockup down about **74 px on desktop and 68 px on the phone**. plan.md › S1 says about 54 px. The note isn't in the design, so the Owner should approve it in Pencil, or the design should make room for it.
- **V-2:** the mesh and grain are CSS approximations. Their shapes are close, and the side glow is slightly weaker on desktop. Already documented.
- **V-3:** at 375–390 px, a decorative lime grid node (`NODES` `[3, 5]`) shows in the gap between "More" and "photography". The export keeps its nodes away from the text.

## Deviations and findings (non-blocking)

- **A-1 (C-008, advisory):** `<html lang="id">` wraps the English page. Only the inner wrapper has `lang="en"`, so the document's `<title>` and meta are in an `id`-tagged document. Axe passes. Consider setting `lang` per route group.
- **A-2:** after joining, the footer *Privacy* link (`#privacy`) points nowhere, because the note leaves with the form.
- **A-3 (AC-LND-003 evidence is weak):** the button has no focus style of its own. The pill's `focus-within` ring lights up for both the field and the button. The e2e "visible focus ring" check reads the parent's `outlineColor`, which is never transparent because of the always-on 1 px outline, so it would pass without focus. Add a `focus-visible` ring on the button and make the test compare focused against unfocused.
- **D-3 (coding rules › Styling, ADR-010):** the field and button are a native `<input>` and `<button>` registered with RHF, not the `src/ui` Input/Button wrappers. That's acceptable for a connected pill the library doesn't have, but record it as a deviation.
- **D-6:** `src/app/opengraph-image.alt.txt` exists, but the production build emits no `og:image:alt` or `twitter:image:alt`. plan › S3 says "share image … with alt text".
- **D-10: document drift (C-011).**
  - `design.md` is still `Status: PROVISIONAL · Owner review pending`. It calls the mobile frame "not approved yet" and keeps a stale *Outstanding before implementation* list. It has no explicit approval record for `sW37g`/`kE8Eu`, which the exports commit calls "chosen".
  - spec.md is `READY FOR DESIGN`, and `feature-map.md` showed `SPECIFIED` (now updated, see below).
  - `tech-stack.md` says "one audience per environment", but ADR-022 says one audience with a segment per environment.
  - `.env.example` lacks `RESEND_WAITLIST_API_KEY` and `RESEND_WAITLIST_SEGMENT_ID`.
- **D-11 (tests):** `composition/landing/submit-waitlist` and `app/api/waitlist/route.ts` have no co-located tests. That matches the other composition entry points, but the AC-LND-012 redaction at that layer rests on review and on this run's log line. `use-waitlist-form` is tested only through `waitlist-form.test`.

## Risks to check at ship

- **R-1 (AC-LND-007, ADR-022):** staging and production are segments of one Resend audience, so contacts are shared. An email already present as a contact, for example from a staging test, may not be added to the production segment by a second `POST /contacts`. Nobody has checked this. Test it with a throwaway address before launch.
- **R-2 (ADR-021/022):** staging is an alias of the same Netlify site. Scope `APP_STAGE=production` and the production `RESEND_WAITLIST_*` to the **Production** context only. Otherwise the staging alias gets gated or writes to the production segment. After setting them, confirm that staging `/login` still works.
- **R-3:** both waitlist keys appeared in a chat transcript (plan › S2). Rotate them before launch.

## Blocking items (why the status is not DONE)

1. **AC-LND-011:** the Owner supplies the removal contact address. Show it in the privacy note and make the footer *Contact* a `mailto:` link.
2. **AC-LND-008:** check the Netlify rate-limit rule on a real deploy (the 6th POST within 3 minutes answers 429 and nothing is stored).
3. **AC-LND-015…017:** the Owner checks list/export, remove and the 12-month clean-up in Resend once, and the result goes in plan.md.

## Result

All 18 criteria are covered. 13 pass. AC-LND-011 fails until the contact address exists. AC-LND-008 and AC-LND-015…017 need a deploy or the Owner's hands-on checks. The production gate, privacy of the email and states are sound. Status stays **IN PROGRESS** until the three blocking items close. Then fix D-6, D-10 and A-3, decide on the G2/G4 exception (`/sdv:design-rules` for a scoped landing exception, or tokens), and run `/sdv:ship landing`.

## Follow-up (2026-10-08, after this report)
Fixed in code and docs: share-image alt text, button focus ring and a stronger e2e focus check, privacy note kept after joining, phone grid node, brand colours via semantic tokens, design approval and light-only record, spec status, tech-stack wording, `.env.example`. The shared-audience risk was checked against Resend: a repeated create adds the existing contact to the new segment. Details in [plan.md](plan.md) › Follow-up. The three blocking items above are unchanged.
