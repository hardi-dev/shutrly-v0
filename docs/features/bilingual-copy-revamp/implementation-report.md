# Bilingual copy revamp — implementation report

Feature: F-22 `bilingual-copy-revamp` · Branch `codex/bilingual-copy-revamp` · Date: 2026-10-10
Plan: [plan.md](plan.md) · Design: [technical-design.md](technical-design.md) · Criteria: [acceptance-criteria.md](acceptance-criteria.md)

**Status: partial. I1 is complete. I2 and I3 are mostly complete. I4–I8 are not started.** The run stopped at Owner checkpoints and one spec gap (below). Nothing is pushed, no PR is open, and nothing is deployed.

## 1. Tasks

| Iteration | Done | Commits (newest first in each group) | Open |
|---|---|---|---|
| I1 Locale foundation | I1.1–I1.12 | `076bfd1` proxy header, `ee0dca8` once per request, `06b3e2e` catalog and parity gate, `0755b61` next-intl request config, `73f267c` one locale for html/next-intl/React Aria, `e341275` lint namespace rule, `63d6f6d` E2E, `47aa217` precedence, `5d436a6` cookies | None |
| I2 Preferences and actions | I2.1, I2.3–I2.10 | `6a491d6` user.locale migration, `557762f` Better Auth field, `a3c9623` account directory, `23605ac` use case, `1a2c98a` owner action, `2948311` device action, `9793d4e` gallery owner lookup, `dc1c8f0` gallery action, `a04ced2` per-request owner locales | **I2.2 migration not run** (Owner checkpoint). I2.10 E2E spec not written. DB-backed tests not run. |
| I3 Formatting and parsing | I3.1–I3.8 | `a5725f2` amounts, `181a0f2` hook, `a579596` dates, `270d133` template limit, `924dce0` date/time fields, `9444768` amount reformat, `fa580fa` add-on approval date, `abd474e` quantities (option b), `463aa2c` quantity reformat | Option (b) was implemented on your instruction to follow my recommendation. It is still subject to Owner review. |
| I4 Platform defaults | — | — | Not started. Needs migration 0020 (Owner checkpoint to run it). |
| I5 Shared UI, shell, auth, landing, profile | — | — | Not started. Needs a layout review for the switches (Owner). |
| I6 Owner feature copy | — | — | Not started. |
| I7 Client gallery copy and switch | — | — | Not started. The client switch is a layout change (Owner). |
| I8 Verification | — | — | Not started. |

Plan task checkboxes were updated to match this table.

## 2. Evidence per acceptance criterion

Status key: **Met** = test in the repo passed in this run · **Partial** = part of the criterion has a passing test · **Not met** = no evidence yet. "Not run" means the test is written but needs a database, which this checkout does not have.

| AC | Status | Evidence |
|---|---|---|
| AC-L10N-001 first visit en, switch available | Partial | Precedence unit tests (`resolve-locale.test.ts`, 11), request resolution (`request-locale.test.ts`, 4), proxy header tests (`proxy.test.ts`, 14), E2E `tests/e2e/locale/locale-resolution.spec.ts` (3, passed under `pnpm dev` and under `pnpm build && pnpm start`). **No switch UI exists yet (I5, I7).** Owner-locale tests (`owner-locale.test.ts`, 4). The gallery-owner lookup integration test (`gallery-owner-locale.test.ts`) and the DB-backed auth tests are **not run**. |
| AC-L10N-002 every surface has matching copy | Not met | `copy-registry` is empty. No screen is converted (I5–I7). The lint rule that requires copy-module namespaces (`tests/lint/coding-rules.test.ts`, 7 passing) is in place. |
| AC-L10N-003 missing messages fail gates | Met for the mechanism | Parity gate (`catalog-parity.test.ts`, 8), registry parity (`copy-registry.test.ts`), strict throw and production log with no user data (`message-errors.test.ts`, `request-config.test.ts`), client provider throws when strict (`app-providers.test.tsx`). Only the mechanism is tested. There is no catalog content yet. |
| AC-L10N-004 switching and isolation | Partial | Concurrent-visitor E2E (passed). Request isolation unit test (`request-locale.test.ts`). Reformat of amounts on a switch (`locale-input.test.ts`, 3). **Quantity reformat and the switch itself are not done.** The gallery switch keeps selections is I7. |
| AC-L10N-005 html, next-intl, React Aria and formatters agree | Met for amounts, dates and fields | Layout test (`layout.test.tsx`, en and id). Providers test (`app-providers.test.tsx`). Amount round trips for boundary values in both locales (`idr-amount.test.ts`, 32). Session and gallery dates (`session.test.ts`, `gallery-display.test.ts`, midnight boundary in Jakarta). Date and time fields follow the app locale (`date-field.test.tsx`, `time-field.test.tsx`). |
| AC-L10N-006 OCM-01…22 covered | Partial | Done: OCM-16/17 (React Aria overrides), OCM-18/19 (dates), OCM-20 (IDR parse), OCM-22 (template limit, `templateProblemText` test "formats 2000 with the active locale"), add-on approval date. **Not done:** OCM-21 (quantity, SPEC GAP), OCM-01…13 (copy, I6), OCM-09 badge (I6). |
| AC-L10N-007 template authoring single-language | Not met | Not started (I4). |
| AC-L10N-008 matching reviewed version | Not met | Not started (I4). |
| AC-L10N-009 snapshots never rewritten | Not met | Not started (I4). The migration `0019` only adds a column. It does not touch templates or snapshots. |
| AC-L10N-010 recipient language | Not met | Not started (I4 and I5 auth email). |
| AC-L10N-011 reviewed copy and Pencil exports | Not met | Copy is not written yet. This report makes no claim about copy quality. |
| AC-L10N-012 integration and build smoke | Partial | `pnpm build` passed on the final branch. `pnpm build && pnpm start` passed for the E2E spec with `APP_STAGE=development` and placeholder bindings (no secrets written). The build-smoke spec (I8) is not written. |

Verification run on the final branch:

- `pnpm typecheck`: passes.
- `pnpm build`: passes.
- Unit and component tests for `src/features`, `src/ui`, `src/composition`, `src/app`: 480 files, 2062 tests, all pass.
- Lint (eslint and prettier) on every changed file: passes.
- E2E `tests/e2e/locale/locale-resolution.spec.ts`: 3 tests pass under `pnpm dev` and under `pnpm build && pnpm start`.
- Not run: the DB-backed integration tests (`schema.test.ts`, `better-auth-contract.test.ts`, `db-adapters.test.ts`, `gallery-owner-locale.test.ts`). They need the non-production database from `.dev.vars`, which this checkout does not have. They are written and typecheck.
- Not run: full `pnpm test` and full E2E, by design (Owner rule, 2026-10-05).

## 3. Deviations from the design

1. **Migration split (plan deviation 1).** Only `user.locale` is in migration `0019_locale_preferences.sql`. The `message_template` change moves to I4. drizzle-kit adds the table qualifier in the CHECK (`"user"."locale"`). That is the same constraint as §4.1.
2. **Registry (D-8, decided).** The registry is `src/app/copy-registry.ts`. It is passed into composition as `messagesFor(locale, surfaces, registry)` and `createRequestConfig(registry)`. The request config entry is `src/app/i18n/request.ts`. Composition never imports `features/*/ui`. Plan deviation 2 is superseded.
3. **Owner locale inputs (deviation 3).** Done in I2.10. The account path loads the owner's locale only with a session cookie and never on landing-only production. The gallery path skips the owner lookup when the gallery cookie is valid.
4. **Quantity parsing (deviation 4).** Not applied. See section 4.
5. **Shared modules.** The missing-message handler is in `src/shared/locale/message-errors.ts`, not in composition. The client provider needs it, and composition cannot be imported from `ui`. The gallery token header constant is in `src/shared/gallery-token/`, for the same reason.
6. **Error key.** The missing-message handler logs `{ locale }` plus the event name. It does not log the namespace or key, because the IntlError message does not carry them reliably.
7. **Auth operation.** `update-locale` was added to the audit operation union. A tampered locale is refused as `VALIDATION_FAILED` with no field message, so no new copy is needed.
8. **D-20 applied as decided.** English IDR is `IDR 750,000` and English dates are `Oct 10, 2026` (Owner, 2026-10-10). The plan's "provisional" note no longer applies. Tests assert the decided patterns.
9. **D-23 applied.** Time stays 24-hour in both locales. English uses `:` and Indonesian uses `.`.
10. **Per-locale tables.** Formatter modules (`idr-amount`, `session`, `gallery-display`, `date-field`, `template-problem-text`, `add-on-text`) hold their `id-ID` and `en-US` formatters in frozen per-locale tables. This is the §5.6 design. The plan's check "no `"id-ID"` literal in `src`" therefore cannot pass as written. The remaining literals are listed in section 5.
11. **Coupled commits.** I3.1, I3.4 and I3.5 are one commit (`a5725f2`) because the signature change typechecks only as one unit. I3.2 is split: the amount half is in `9444768`.
12. **Test defaults.** `tests/setup/jsdom.ts` mocks `next-intl`'s `useLocale` to return `id`, so the existing Indonesian screen tests keep their meaning. Tests that need the real provider restore it.
13. **Lint rule (I1.11).** `docs/coding-rules.md` › Copy is not changed. The new rule's wording needs Owner approval. It is noted in the commit body.
14. **Owner pages.** `projects/[projectId]/page.tsx` now reads its params with one `Promise.all`. This was needed to stay under the function-length rule once the locale was read.

## 4. Spec gap: quantity parsing (I3.3), resolved by option (b)

`parseQuantity` must become locale-strict (id-ID accepts `,` only, en-US accepts `.` only). The plan says to stop and report if any caller parses a stored canonical value. One does:

- Service item values are copied from the service snapshot into the project draft (`use-project-picks.ts` `toDraftItems`, values as stored, canonical dot decimals such as `1.5`).
- The draft goes to `createProject`, which calls `validateItemList` → `parseQuantity(raw.value)` without any user edit.
- Under an id-ID-only parser, a service default with a fractional quantity (e.g. `1.5`) would be `INVALID` for every Indonesian owner.

Implemented as option (b) on the Owner's instruction to follow the recommendation. Stored canonical values are localized at the draft-to-form boundary (`localizePackageValue`), and `parseQuantity` is locale-strict (C-105). Other options, not taken:

- (a) Keep the canonical value in the draft as a typed value that skips parsing (a state change in the draft model), then make `parseQuantity` locale-strict.
- (b) Convert stored defaults to the active locale before they enter the draft, then make `parseQuantity` locale-strict.
- (c) Keep `parseQuantity` as is, accept both separators, and report the mixed input as a non-goal.

`formatQuantity` (display only) was not changed either. It can take the locale once the decision is made.

## 5. Remaining literals and open items

- `features/communications/ui/template-editor-screen/template-editor-screen.copy.ts`: `Intl.NumberFormat("id-ID")` in a copy file. It belongs to the copy conversion (I4–I6).
- `features/workspace/domain/workspace-name/workspace-name.ts`: `toLocaleLowerCase("id-ID")` for name uniqueness. This is a data rule, not display, and was left alone. Owner to confirm.
- Spike log (`plan.md`): the gate rewrite gap is closed in I1.6 (`076bfd1`), with unit tests. The gallery server action check and the R-2 baseline are still open. The server action check needs a browser run.

## 6. Owner checkpoints (stopped here)

1. **Approve migration 0019 (I2.2).** It is one additive column with a default and a check. Approval lets me run `pnpm db:migrate` against the non-production database from `.dev.vars`, then run the DB-backed tests and report the run. Staging code does not use the column yet. Please confirm this is OK to run against the shared non-production database (ADR-024).
2. **Decide the quantity model (section 4).** I3.3 and the quantity half of I3.2 wait on it.
3. **Layout review for the language switches (I5, I6, I7).** The auth, landing, profile, shell and client-gallery switches are new placements. Per the Owner's 2026-10-10 rule these need a separate review before implementation.
4. **Migration 0020 for I4 (`message_template.is_default`, nullable `content`).** Generate, review and run it under the same checkpoint as item 1.
5. **Install.** Ran `pnpm install --frozen-lockfile` from the lockfile to set up this checkout (declared dependencies only, no new packages). The Mac worktree path in the goal does not exist in this environment, so the work was done in `/home/user/shutrly-v0`.
