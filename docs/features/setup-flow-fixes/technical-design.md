# Technical Design — Setup flow fixes (F-24)

Status: APPROVED for build planning (2026-10-12) · Spec: [spec.md](spec.md) · Criteria: [acceptance-criteria.md](acceptance-criteria.md) · Plan: [plan.md](plan.md)

## Context
F-24 fixes the setup-flow defects that discovery confirmed: D1 (forms can submit natively with a `GET`), D3 (catalog dialogs ignore Enter), D4 (a missing record inside a workspace shows "Workspace not found"), D5 (Drive guidance still teaches `edited`/`print`) and D6 (Indonesian text on English catalog screens). D2 and D7 are withdrawn: they didn't reproduce (spec › D2 + D7). No schema, business-rule or API change. All facts below were read from the repo on 2026-10-12.

## Relevant authority
- Constitution: C-006, C-007, C-008, C-009, C-010, C-011, C-101, C-103
- Business rules: BR-WS-002, BR-WS-003, BR-GAL-007, BR-L10N-002
- Acceptance criteria: AC-SFX-001…004, 009…017 (005…008 withdrawn)
- ADRs: ADR-010 (React Aria primitives), ADR-015 (URL-scoped workspace, `notFound()` for unknown sections), ADR-025 (next-intl), ADR-026 (Owner breadcrumb slot; a missing entity throws `notFound()` in the slot)
- Owner decisions: spec › Flagged concerns (FC-002…FC-006); copy drafted with the Codex CLI and approved by the Owner

## Decisions
- **D-1 One readiness hook.** New `src/ui/hooks/use-hydrated/use-hydrated.ts`: `useSyncExternalStore(subscribeNever, () => true, () => false)`. It's `false` in the server render and the hydration render, and `true` after. Same shape as `use-mobile-viewport.ts`. Every D1 form reads it; no per-form timers.
- **D-2 D1 forms post and wait.** Each D1 `<form>` gets `method="post"`. Its submit button is disabled while `!hydrated`. A disabled default button also blocks implicit submission (Enter in a field) in the HTML spec, so nothing submits natively. No `action` attribute is added: a native post goes to the page's own URL, and Next renders the page for a `POST` without a `Next-Action` header. Nothing reads the body (AC-SFX-003 is verified by an E2E request, see Testing).
- **D-3 Auth forms through `useAuthForm`.** `useAuthForm` returns `isReady` (from D-2). The six auth forms use `isDisabled={!isReady || isSubmitting}`. The client password, waitlist and settings forms call `useHydrated()` directly, because they don't use `useAuthForm`.
- **D-4 Catalog dialogs submit through a form.** Follow `category-dialog.tsx`: the dialog body is wrapped in `<form id={formId} noValidate onSubmit={…}>`, and the primary button becomes `type="submit" form={formId}`. `formId` comes from React `useId()`, because two instances may mount at once (list and detail). `onSubmit` calls `event.preventDefault()`, then the dialog's existing `handleSubmit` unless it's already pending. Dialogs: `add-service-dialog`, `service-item-dialog`, `booking-field-dialog`, `item-definition-dialog`. Catalog dialogs have no multi-line field (the *Choice* options are single-line `TextField`s), so Enter submits from every field, including an option row.
- **D-5 A workspace-level not-found boundary.** New `src/app/(owner)/w/[workspaceId]/not-found.tsx` renders `PageNotFoundScreen` (new, `features/workspace/ui/page-not-found-screen/`) inside the shell. The workspace check stays in the `[workspaceId]` layout (`verifyOwnerWorkspace`). A layout `notFound()` still reaches `w/not-found.tsx` ("Workspace not found"), and a page `notFound()` now stops at the new boundary. `PageNotFoundScreen` is a client component: `not-found.js` gets no params, so it reads `usePathname()` and builds its back link with a pure function, `pageNotFoundBackTarget(pathname)`. That's the parent section for a known section with a deeper path, otherwise the dashboard. Built from `EmptyState` (Owner, FC-005), copy from the approved deck rows.
- **D-6 The breadcrumb slot on a missing record (spike first).** ADR-026 slot pages throw `notFound()` for a missing or foreign entity. Next's docs don't say which boundary catches a `notFound()` thrown in a parallel slot. Iteration 4 Task 1 is a spike that observes it:
  - (a) If `@crumbs` throws and the `[workspaceId]` boundary renders `PageNotFoundScreen` *inside the trail*, add `@crumbs/[...]/not-found.tsx` handling (`@crumbs/not-found.tsx`, which renders `null`) and re-check.
  - (b) If (a) doesn't work in this Next version, the slot pages catch the loader's not-found and render the ancestors-only trail (`ownerTrail` without `current`). That changes ADR-026 point 38 ("the slot loader throws `notFound()`"), so stop and ask the Owner to amend ADR-026 first (C-011).
  - The spike records which case held in `build-notes.md`. AC-SFX-014 holds in every case: the trail never names the missing record.
- **D-7 Copy first, then code.** D4's new strings and the replacements for D5 and D6 are drafted with the Codex CLI. The Owner approves them, they're written into `copy-deck.md` (new rows, plus the stale §15/§16 rows corrected), and then they're copied verbatim into the `*.copy.ts` modules. Dead keys `visibilityFoldedEdited` and `visibilityFoldedPrint` (`gallery-copy.copy.ts`, EN and ID; no reader) are removed with D5, not reworded.

## Database changes
None.

## Server / API interface
None changed. Server actions and loaders are unchanged; D1 changes only the form element and the button state, D4 only adds a route-segment file.

## Domain / application logic
None. No business rule changes; all logic added is UI-level and pure (`pageNotFoundBackTarget`).

## UI components

| Unit | Change | Defect |
|---|---|---|
| `src/ui/hooks/use-hydrated/` (new) | `useHydrated(): boolean` + test | D1 |
| `features/auth/ui/use-auth-form/` | add `isReady` to the result (`use-auth-form.types.ts`) | D1 |
| `features/auth/ui/{register-form,login-form,forgot-password-form,reset-password-form,profile-form,change-password-form}/` | `method="post"`; button `isDisabled={!isReady \|\| isSubmitting}` | D1 |
| `features/gallery/ui/client-password-form/` | `method="post"`; `isDisabled={!hydrated \|\| isLocked \|\| isSubmitting}` | D1 |
| `features/landing/ui/waitlist-form/` | `method="post"`; native `disabled={!hydrated \|\| isSubmitting}` | D1 |
| `features/workspace/ui/settings-screen/` | `method="post"`; `isDisabled={!hydrated \|\| settings.isSubmitting}` | D1 |
| `features/booking/ui/{add-service-dialog,service-item-dialog,booking-field-dialog,item-definition-dialog}/` | wrap fields in a `<form>`, primary button `type="submit" form={formId}` | D3 |
| `features/workspace/ui/page-not-found-screen/` (new) | `PageNotFoundScreen`, `.copy.ts`, `.types.ts`, `page-not-found-back-target.ts` + tests | D4 |
| `app/(owner)/w/[workspaceId]/not-found.tsx` (new) | renders `PageNotFoundScreen` | D4 |
| `app/(owner)/w/[workspaceId]/@crumbs/…` | per the D-6 spike | D4 |
| `features/gallery/ui/source-copy/`, `gallery-copy/` | approved copy; dead keys removed | D5 |
| `features/booking/ui/catalog-copy/` | EN `pickModeMeta`, `fieldDialogDescription` | D6 |

Not changed: `google-button` and `account-unavailable-screen` (server-action forms, AC-SFX-004); dialog forms outside the catalog (spec › Out of scope).

## Validation
Unchanged. The D1 forms keep their schemas and server re-validation (C-004). D3 sends the same values through the same `handleSubmit`.

## Error handling
Unchanged. Field and server errors keep today's components. `PageNotFoundScreen` is the D4 error state (C-007).

## Concurrency / consistency
- D3: `onSubmit` returns early while the dialog is pending, and the primary button is `isPending`, so Enter + click can't save twice (AC-SFX-010).
- D1: a submit before hydration is impossible (disabled default button), so there's no half-submitted state.

## Security
- D1 removes the only path where credentials or a gallery password reach a URL, history or a URL-logging proxy (C-103, C-006). The request body of a native post is never read or logged.
- D4: foreign ids already throw `notFound()` in the scoped loaders (BR-WS-002/003, AC-CRUMB-012). The new boundary shows the same screen for missing and foreign records, so nothing reveals that a record exists elsewhere (C-101). The back link is built from the pathname only, never from a loaded record.

## Testing strategy

| AC | Test |
|---|---|
| AC-SFX-001, 002 | unit: `use-hydrated.test.tsx` (server render `false`, after mount `true`); each D1 form's test: renders `method="post"`, the button is disabled before hydration (render with `renderToString`) and enabled after mount. E2E `tests/e2e/setup-flow-fixes/forms-without-js.spec.ts`: `test.use({ javaScriptEnabled: false })`, for `/register`, `/login`, `/forgot-password`, `/` (waitlist), a client gallery `/g/<token>`: the form's `method` is `post`, the submit button is disabled, and pressing Enter in a filled field leaves the URL without a query string. |
| AC-SFX-003 | same E2E file: `request.post` with form-encoded fields to `/register`, `/login` and `/g/<token>`: the status is 200 or 405, the body doesn't contain the posted email or password, there's no `set-cookie` for a session, and `GET /api/test/auth-emails?to=<email>` returns `[]`. |
| AC-SFX-004 | unchanged tests of `google-button` and `account-unavailable-screen` still pass; no edit to those files. |
| AC-SFX-009, 010 | each catalog dialog test: typing a valid value and pressing Enter calls the action once with the same input as clicking *Save*/*Add*; Enter while pending doesn't call it again; an invalid value shows the same field error. |
| AC-SFX-011, 013 | unit: `page-not-found-back-target.test.ts` (table of pathnames → targets); `page-not-found-screen.test.tsx` (EN and ID copy, link). E2E `tests/e2e/setup-flow-fixes/page-not-found.spec.ts` (seeded owner): unknown template slug, a random project uuid, a random service uuid, an unknown section → *page not found* inside the shell; a random workspace uuid → "Workspace not found". |
| AC-SFX-012 | same E2E: owner B opens owner A's project and service ids under B's workspace → the same *page not found* text, and the page doesn't contain A's project title. |
| AC-SFX-014 | same E2E: on each *page not found*, the breadcrumb (`nav` with the breadcrumb label) doesn't contain the requested id or a record name. |
| AC-SFX-015 | unit: `features/gallery/ui/source-copy/source-copy.test.ts` + `gallery-copy` test: no EN or ID message matches `` /`(edited\|print)`/ `` and no key `visibilityFolded*` exists. |
| AC-SFX-016 | unit, one `*.deck.test.ts` beside each changed copy module (`source-copy`, `gallery-copy`, `catalog-copy`, `page-not-found-screen`): every F-24 string equals its row in `docs/features/bilingual-copy-revamp/copy-deck.md` (read with `fs`; the keys and rows are listed in the test). |
| AC-SFX-017 | unit in `catalog-copy`: the EN `pickModeMeta` and `fieldDialogDescription` differ from their ID values and equal the approved EN rows. |

Run only the related tests per iteration (`npx vitest run <paths>`, one E2E spec), plus typecheck and lint on changed files (project rule). The E2E specs need the dev server on port 3000 with `E2E_EMAIL_CAPTURE=1` (already in `.dev.vars`).

## Implementation iterations
See [plan.md](plan.md): 1 D1 forms · 2 D3 catalog dialogs · 3 copy (Codex draft, Owner approval, deck) · 4 D4 not-found · 5 D5 + D6 copy in code · 6 close.

## Risks / open questions
- **D-6 slot behavior** is unknown until the spike; case (b) needs an ADR-026 amendment and stops for the Owner.
- **Status code of not-found pages:** Next returns 200 for streamed responses (docs › not-found). Today's "Workspace not found" behaves the same; no change and no test on the status.
- **Parity gate blind spot:** EN = ID text passes `catalog-parity` (42 deliberate `DECK GAP` strings do that). F-24 adds no general check; that belongs to F-22 verification.
- **Copy approval** is a checkpoint (iteration 3). Iterations 4 and 5 can't finish before it, while 1 and 2 don't depend on it.
- **The waitlist is live on production** (ADR-021): the D1 change ships with the next landing deploy; the ship notes must say so.
