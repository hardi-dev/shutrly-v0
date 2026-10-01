# F-03 Message templates — verification report

Date: 2026-10-01 · Verifier: agent (`/sdv:verify-feature message-templates`) · Result: **PASS — nothing blocking**, feature set to DONE.

Sources:
- [spec.md](spec.md), [acceptance-criteria.md](acceptance-criteria.md), [design.md](design.md) (v3 frames, `exports/`);
- [technical-design.md](technical-design.md) (implementation record), [plan.md](plan.md);
- ADR-016, `docs/design-system/token-usage.md` (rules v3.1, APPROVED), constitution C-003/C-004/C-007/C-008/C-101/C-103.

## Quality gate (run 2026-10-01, on `57ec667`)

| Check | Result |
|---|---|
| `pnpm typecheck` | PASS |
| `pnpm lint` (Prettier, ESLint with boundaries, `server-only`, copy, `tokens:check`) | PASS |
| `pnpm test` | PASS: 446/446 |
| `pnpm test:integration` | PASS: 44/44 (6 F-03) |
| `pnpm e2e tests/e2e/message-templates` | PASS: 3/3 |
| `pnpm build` | PASS: `/w/[workspaceId]/message-templates` and `/[templateType]` are built |
| Full `pnpm e2e` (earlier the same day) | 32 passed, 2 failed. `message-templates` AC-MSG-020 was fixed since. `auth-profile.spec.ts` fails for a reason that predates F-03; see Deviations. |
| Migrations | 0002/0003 applied by the Owner-approved `pnpm db:migrate`. |

## Functional — acceptance criteria

| AC | Result | Evidence |
|---|---|---|
| AC-MSG-001 | PASS | `seed-default-templates.test.ts`; integration "failed creation transaction leaves no workspace and no templates" (ADR-016); E2E journey (onboarding creates the workspace, the list shows 5). The switcher path uses the same `withWorkspaceCreationScope` (`createOwnerWorkspace`); see advisory A1. |
| AC-MSG-002 | PASS | `tests/config/message-template-backfill.test.ts` (verbatim + `ON CONFLICT DO NOTHING`); integration idempotent seed. **Database check:** all pre-existing workspaces have exactly 5 templates, with 0 duplicate (workspace, type, channel). The only 2 workspaces without templates are integration fixtures (`WS …`) inserted directly after the migration. |
| AC-MSG-003 | PASS | Integration: a second insert is rejected with 23505; unique index `message_template_workspace_type_channel_uq`. |
| AC-MSG-004 | PASS | `list-message-templates.test.ts`, `template-list-screen.test.tsx`, `owner-nav.test.tsx` (active on nested routes); E2E: 5 rows, nav `aria-current`, no *Segera hadir*. |
| AC-MSG-005 | PASS | Editor test (stored content, chips with `galleryUrl` marked *wajib*, preview); `message-preview.test.tsx` (`••••••`, password note); E2E. |
| AC-MSG-006 | PASS | Editor test (inserted at the caret and the preview updates); `variable-chip.test.tsx`; E2E. |
| AC-MSG-007 | PASS | `update-message-template.test.ts` (trimmed, that type only, `updatedBy`); integration (`updatedBy`, one type); flow and action tests; editor success toast; E2E save + reload. |
| AC-MSG-008 | PASS | `template-content.test.ts` (2,000 / 2,001 code points, whitespace); use case refuses EMPTY; DB `CHECK char_length between 1 and 2000` (integration). |
| AC-MSG-009 | PASS | Use case returns `UNKNOWN_VARIABLE:invoiceUrl`; `template-problem-text.test.ts` names the variable; editor server-error test; E2E. |
| AC-MSG-010 | PASS | `template-content.test.ts` (5 malformed forms); use case `MALFORMED`; editor client validation (the server isn't called). |
| AC-MSG-011 | PASS | Content tests for all four link-bearing types plus PAYMENT_REMINDER; problem text names the gallery or invoice link. |
| AC-MSG-012 | PASS | Flow test (generic `SAVE_FAILED`); editor test (danger toast *Template belum tersimpan* with *Coba lagi*, text kept). The use case stores nothing on failure. |
| AC-MSG-013 | PASS | Editor test (restore = draft, Simpan enabled, action not called); E2E restore then save. |
| AC-MSG-014 | PASS | `internal-href.test.tsx`; editor test (alertdialog *Buang perubahan?*, *Lanjut mengedit* keeps the text); E2E. Back/forward: D-M2. |
| AC-MSG-015 | PASS | Integration isolation (list, find and update scoped by workspace); `get-message-template` NOT_FOUND; E2E: another owner's editor URL shows *Workspace tidak ditemukan*. Saves resolve the workspace through `verifyOwnerWorkspace` (bound action args, never the request body). |
| AC-MSG-016 | PASS | `render-template.test.ts` |
| AC-MSG-017 | PASS | `render-template.test.ts` (`MISSING_VALUE`, no partial text) |
| AC-MSG-018 | PASS | `render-template.test.ts` (control characters stripped, CRLF → LF, trimmed, `{{galleryPassword}}` literal) |
| AC-MSG-019 | PASS | Flow test (logs `{ type }` only); `RenderTemplateError` carries only its code. Code scan: the only log call is `message_template.save_failed` with `{ type }`. |
| AC-MSG-020 | PASS | E2E axe (wcag2a/2aa/21a/21aa) on the list and editor at 1440 and 390 px: 0 violations, after the Segmented contrast fix. Preview region *Pratinjau pesan*; RAC TextField links the error to the field. See advisory A2. |

## Technical quality

| Item | Result |
|---|---|
| Server-side rule enforcement (C-004) | PASS: one schema (`messageTemplateContentSchema`) is used by the form and the use case. DB CHECKs back up type, channel and length. |
| Isolation (C-101) | PASS: every repository query is scoped by `workspace_id` + `WHATSAPP`. Ownership is verified in composition before every read or write. |
| Transactions (ADR-016, Accepted) | PASS: `withWorkspaceCreationScope` opens `db.transaction`; repositories take a `DbExecutor`. A rollback test is included. |
| Architecture / boundaries | PASS: no cross-feature imports (lint `boundaries`); `server-only` is on every application, composition and adapter file (scan); types and schemas are in sibling files. |
| Logging (C-103) | PASS (see AC-MSG-019). |
| Migrations | PASS: generated with drizzle-kit; 0003 copies the defaults verbatim (config test). Applied once; no applied migration was edited (0003 was finalised before it was applied). |

## Visual fidelity (Pencil v3 exports)

Screenshots of the running app were compared with `list-L9tLQ`, `list-m3crcH`, `editor-byw9B` and `editor-v8MaG` at 1440 / 390 px.

| Screen | Result | Notes |
|---|---|---|
| List, desktop | PASS | Cards, groups, rows, icons and breadcrumb match. Rows are about 6 px taller (V1). |
| List, phone | PASS | Matches. The subtitle is longer (D-M1). |
| Editor, desktop | PASS | Two cards, chips, preview bubble and actions match. Two fixes during verification: the restore icon is now `RotateCcwIcon`, and *Sisipkan variabel* is semibold. |
| Editor, phone | PASS | Compact Bar, *Pesan* card with Edit/Pratinjau, Simpan LG then Restore LG all match. |
| Other states (typing, errors, saving, saved, server error, unsaved, preview tab and error) | PASS (behaviour) | Covered by component tests and E2E. Not captured as separate screenshots (advisory A3). |

## Design system (token-usage v3.1, APPROVED)

| Rule | Result | Notes |
|---|---|---|
| G2/G4: no primitives or hard-coded values | PASS with exceptions | Scan of the new UI: no hex values and no primitive tokens. Exceptions: skeleton bar widths `w-36`/`w-52` (DESIGN TOKEN GAP, placeholders matching the export's 140/200 px), and the editor split `flex-[5_1_0%]`/`flex-[3_1_0%]` (D-M3). |
| G3: component tokens inside components | PASS | Segmented Control uses `component.segmented.*`; list rows use `component.list-card.item.*`; Section Card and Textarea use their own component tokens. |
| G5: fg/bg pairing | PASS (after fix) | The Segmented item resting text was `text.muted` on `surface.muted` (3.8:1 / 4.05:1). The Owner chose to change the token to `text.secondary` (6.09:1 / 7.1:1). |
| SP1–SP11: spacing ladder and insets | PASS | Rows 12/12 (`list-card.item.padding-x`, `space.3`), card gap `panel.app.content.gap` (28), chip squish 4/8, segmented item 8/16. All whole steps. |
| SP5: linked instances, no padding overrides | PASS | The Pencil frames use library instances (design.md scan: 0 broken refs, 0 raw colours). In code, Section Card insets aren't overridden. |
| Drift: tokens ⇄ CSS ⇄ library | PASS | `tokens.json`, `tokens.css` (`tokens:check`) and the `design-system.lib.pen` variables agree on `component/segmented/item/text` = `text.secondary` and `-hover` = `text.primary`; 549 variables. Library saved by the Owner (4,489,618 B, 2026-10-01 11:36) and committed in `57ec667`. |

## Deviations (all non-blocking, recorded)

- **D-M1:** phones show the desktop list subtitle (the shell has one subtitle).
- **D-M2:** browser back/forward isn't guarded; in-app links, reload and close are.
- **D-M3:** 5:3 flex split instead of a 400 px preview column (no width token).
- **D-M4 (resolved):** textarea `rows` 12/13 match 280/300 px; Segmented items are equal width. The fixed 180 px track isn't tokenised.
- **V1:** list rows are about 6 px taller than the export. The export uses the browser's default line height (about 1.2); the tokens have only `tight` 1.1 and `body` 1.5.
- **DESIGN TOKEN GAP:** skeleton bar widths (`w-36`, `w-52`); possibly a `List Card Item/Two-line` library variant (design.md).
- **Design-system change:** `component.segmented.item.text` / `-hover` were darkened (Owner 2026-10-01). Every Segmented Control is affected.
- **Unrelated failure:** `tests/e2e/auth/auth-profile.spec.ts` fails because `/profile` redirects owners without a workspace to onboarding (since `70ce31d`, F-17). Not caused by F-03. **Fixed 2026-10-01:** the spec (workspace spec, BR-AUTH-004) confirms the redirect is intended, so the test now creates a workspace first and scopes its locators to the visible tree. Full `pnpm e2e`: 34/34 pass.

## Advisory (no action required for DONE)

- **A1:** no E2E asserts that a workspace created from the switcher has its templates. The code path is shared with onboarding, and the rollback is covered by integration tests.
- **A2:** keyboard reachability rests on the axe check and the RAC components; there's no explicit Tab-order E2E.
- **A3:** the error, saving and dialog states were checked through tests, not through screenshot comparison.
