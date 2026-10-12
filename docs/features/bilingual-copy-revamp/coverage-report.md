# Bilingual copy coverage report (I8.2)

Date: 2026-10-11. Branch: `claude/f22-bilingual-copy-revamp-be9ecb`. Covers AC-L10N-011 and AC-L10N-012.

## Status in one paragraph

Copy is translated in EN and ID for every surface listed below, and the build smoke (I8.1) renders every top-level route in both locales without hydration or next-intl errors. The two journey E2E tests (`tests/e2e/locale/journeys.spec.ts`) are written but **environment-blocked**: on every run in this session the Neon database failed the first query on a new websocket from the Next server (`Failed query … [cause]: ErrorEvent`), so neither journey reached its assertions. Nothing here is marked passed by this report. Owner review of the proposed copy rows is still pending.

## Journey E2E (AC-L10N-011)

| Test | Result in this session |
|---|---|
| `AC-L10N-011 an owner creates a project in Indonesian and sees only Indonesian` | Blocked. Failed in the register, verify, workspace, and client-save steps with `Failed query … [cause]: ErrorEvent` and `SAVE_FAILED` in the server log. |
| `AC-L10N-011 a client picks and submits in Indonesian` | Blocked. Skipped when `GALLERY_SMOKE_FOLDER_URL` is unset. When set, it failed at the register step with the same `ErrorEvent` on `auth_rate_limit`. |

The journeys assert `html[lang=id]` and check that the English twin of each string (from the `.messages.en` copy) is not visible while the Indonesian string is.

## Implemented coverage (EN and ID)

Commits are on this branch. "Locale tests" lists the unit, integration, and E2E files that exercise the surface. Only a few E2E files assert copy text; most unit tests check resolution, parity, and rendering.

| Surface | Commits (EN/ID translation) | Locale tests |
|---|---|---|
| Landing | `c4934599` | `src/composition/locale/message-catalog/catalog-parity.test.ts`; `build-smoke.spec.ts` (route renders, both locales) |
| Auth and profile | `6ce19d78` | `auth-language-switch.test.tsx`, `language-link.test.tsx`, `use-language-switch.test.tsx`; `auth-language-link.spec.ts` |
| Auth language link and sign-up language | `7722a466`, `425c3f3d`, `82ea6631`, `2ab2cc44`, `e5ae3f3f`, `83c4b768`, `48b6293e` | `owner-locale.test.ts`, `update-owner-locale.test.ts`, `resolve-locale.test.ts`, `locale-flow.test.ts` |
| Auth emails (follow the screen language) | `a1db82c4`, `87457567` | `auth-email-templates.test.ts`, `resend-auth-email-sender.test.ts` |
| Owner shell and account menu | `3c19fbce`, `d22e7bab`, `a38c1a30`, `029a485b` | `owner-language-menu.spec.ts` (desktop and phone); `use-language-switch.test.tsx` |
| Shared UI | `891cd15d` | `copy-text.test.ts`; `copy-registry.test.ts` |
| Workspace screens, dashboard, settings | `dd28d004` | `build-smoke.spec.ts` (owner routes, not run here: needs the database) |
| Catalog and add-ons | `14f4e9e9` | `catalog-copy.test.tsx`; `default-item-definitions.test.ts`; `seed-default-item-definitions.test.ts`; integration `default-item-keys.test.ts` |
| Clients and team | `5665f078` | `client-copy.test.ts` (booking) |
| Projects, packages, sessions | `057c9b5b`, `04d7b858` | `locale-input.test.ts`; `use-locale-reformat.test.tsx`; journeys spec (blocked) |
| Message templates | `88191640`, `114adaec`, `6ed0f48d`, `d7d50de8`, `9450bd80` | `render-template-for-recipient.test.ts`; `resolve-template-content.test.ts`; `default-templates.test.ts`; `seed-default-templates.test.ts`; `message-template-flow.test.ts`; `message-template-backfill.test.ts`; integration `message-template-repository.test.ts` |
| Photo sources | `926419e8` | `default-source.test.ts`; `seed-default-source.test.ts` |
| Owner gallery | `8f3fc4fb`, `dc1c8f09`, `9793d4eb`, `a04ced21` | `gallery-owner-locale.test.ts` (composition); `check-gallery-locale-target.test.ts`; E2E `gallery-owner-locale.spec.ts` (blocked, below) |
| Client gallery | `fd35f87b`, `dc624c0e` | journeys spec (blocked); `gallery-owner-locale.spec.ts` (blocked) |
| Default templates, items, roles, sources | `114adaec`, `06fe150e`, `16087083`, `91b1ae3f`, `feb2006c`, `b2463d24`, `9907664e`, `2bdc1d75` | `default-keys-migration.test.ts`; `default-item-keys.test.ts` (integration); `seed-default-team-roles.test.ts` |
| Formatting (amounts, dates, quantities) | `181a0f24`, `a5725f2f`, `abd474ea`, `924dce0b`, `270d133e` | `locale.test.ts`; `use-formatting-locale.test.tsx`; `use-locale-reformat.test.tsx` |
| Locale resolution and SSR | `a04ced21`, `f86c3b15` | `request-config.test.ts`; `request-locale.test.ts`; `locale-cookies.test.ts`; `locale-resolution.spec.ts`; `build-smoke.spec.ts` |

## Not covered, or still pending

**Proposed copy awaiting Owner review (AC-L10N-011 review).** These rows are drafted from source or the design and are not yet deck copy:

- `copy-deck.md` §14.4 "Proposed rows (I7.1)": client gallery browse and related rows (line ~1823).
- `copy-deck.md` §15.x "Proposed rows (I6.7)" (line ~2004).
- `copy-deck.md` "Account menu" (line ~179) and "Language switch — proposed control" (line ~167).
- Source files that carry `PROPOSED` markers: 15 client gallery modules under `src/features/gallery/ui/`, including `client-browse-screen`, `pick-screen`, `review-screen`, `delivery-screen`, and `client-password-form`.

**DECK GAP strings (same text in both languages).** 42 `DECK GAP` markers in 12 files under `src/`, mostly in `src/features/booking/ui/` (`project-copy`, `add-on.copy`, `catalog-copy`, `team-copy`, `client-copy`), plus `src/ui/patterns/select/select.copy.ts`, `src/ui/primitives/stepper/stepper.copy.ts`, `src/ui/primitives/tooltip/tooltip.copy.ts`, `src/features/auth/ui/profile-form/profile-form.copy.ts`, and `src/features/auth/ui/auth-error-alert/auth-error-alert.copy.ts`. Each marker lists a row the deck does not have; until the Owner adds one, the EN and ID values stay the same text.

**Theme switching.** Not implemented. The account menu shows theme rows with no action; this is the next phase (AC-L10N-012 future surface).

**Environment-blocked E2E and integration checks:**

- `tests/e2e/locale/journeys.spec.ts`: both tests blocked by the Neon websocket error (see above).
- `tests/e2e/locale/gallery-owner-locale.spec.ts`: needs `GALLERY_SMOKE_FOLDER_URL` and the database. Not run in this task.
- `tests/e2e/locale/build-smoke.spec.ts`, owner and gallery route parts: needs a signed-in owner and the database. Not re-run in this task. The public-route part passed in I8.1.
- Integration tests needing the database: `tests/integration/gallery/client-access/gallery-owner-locale.test.ts`, `schema.test.ts`, `better-auth-contract.test.ts`, `db-adapters.test.ts`. Not run.

**AC-L10N-012 gaps.** The deployment build (`pnpm build`) and SSR/client agreement via the build smoke are covered for public routes. The integration checks against the database are not yet run in this environment, and the journeys above are not green.

## Environment note

Log line seen in every blocked run (the first query on a new websocket fails): `Failed query: insert into "auth_rate_limit" …` and `[cause]: ErrorEvent`, followed by `SAVE_FAILED` on client save and `Failed query: select "id" from "workspace" …` on owner routes. The journeys spec was rerun three more times with `retries: 2` (matching `journeys.spec.ts`) and a 30 s register wait; every attempt hit the same database error.
