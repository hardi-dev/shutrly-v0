# Plan — Setup flow fixes (F-24)

Status: PLANNED (2026-10-12) · Design: [technical-design.md](technical-design.md) · Spec: [spec.md](spec.md) · Criteria: [acceptance-criteria.md](acceptance-criteria.md)

**Goal:** fix D1, D3, D4, D5 and D6 (D2/D7 withdrawn). Six iterations; each one is test-first and gets one commit per task (`fix(<scope>): …`, lowercase, English, Co-Authored-By trailer).

**Global rules for every iteration**
- Related tests only: `npx vitest run <paths>`, one E2E spec at a time. Never the full suite.
- Lint per changed file, as you go: `npx prettier --write <file>`, then `NODE_OPTIONS=--max-old-space-size=6144 npx eslint --fix <file>`. Then `pnpm typecheck`.
- Never type `head`; use `sed -n`. Never `pkill` a dev server.
- UI text only from `*.copy.ts`, never inline (`local/ui-copy`); new text only from approved `copy-deck.md` rows (iteration 3).
- No Pencil frames for F-24 (FC-005). No new dependencies.
- Branch `staging` (or a worktree branched from it). Don't push, deploy or open a PR without asking the Owner.

---

## Iteration 1 — D1: forms post and wait until ready

**Read first:** AC-SFX-001…004 · C-103, C-006 · technical-design › Decisions D-1…D-3, UI components, Testing (rows 001–004) · coding-rules › React, Copy, Testing · code to follow: `src/ui/hooks/use-mobile-viewport/use-mobile-viewport.ts` (+ its test), `src/features/auth/ui/use-auth-form/use-auth-form.ts`, `src/features/auth/ui/register-form/register-form.tsx` · E2E helpers: `tests/e2e/auth/auth-e2e.ts` (`register`, `registerAndVerify`, `lastLink`).

- [x] **1.1 `useHydrated`.** Test first (`use-hydrated.test.tsx`): `renderToString` of a probe component shows `false`; `render` (after effects) shows `true`. Implement:
  ```ts
  "use client";

  import { useSyncExternalStore } from "react";

  function subscribe(): () => void {
    return () => undefined;
  }

  /** True once the page is interactive; false in the server render and while hydrating (F-24 D1). */
  export function useHydrated(): boolean {
    return useSyncExternalStore(
      subscribe,
      () => true,
      () => false,
    );
  }
  ```
  Commit `fix(ui): add a hydration flag for forms that must not submit early`.
- [x] **1.2 Auth forms.** Add `readonly isReady: boolean` to `AuthForm` in `use-auth-form.types.ts`; `useAuthForm` returns `isReady: useHydrated()`. In register, login, forgot-password, reset-password, profile and change-password: `<form method="post" …>` and the submit `Button` `isDisabled={!isReady || isSubmitting}`. Tests first in each form's test: `method` is `post`; the button is disabled in `renderToString` output and enabled after render. Commit `fix(auth): post auth forms and keep submit disabled until ready`.
- [x] **1.3 Client password, waitlist, settings.** Same change with `useHydrated()` directly: `client-password-form.tsx` (`isDisabled={!hydrated || isLocked || isSubmitting}`), `waitlist-form.tsx` (native `disabled={!hydrated || isSubmitting}`), `settings-screen.tsx` (`isDisabled={!hydrated || settings.isSubmitting}`). Tests first, as in 1.2. One commit per form: `fix(gallery): …`, `fix(landing): …`, `fix(workspace): …`.
- [x] **1.4 E2E without JavaScript.** New `tests/e2e/setup-flow-fixes/forms-without-js.spec.ts` (per technical-design › Testing, rows AC-SFX-001…003). For the client gallery, reuse the gallery E2E fixture used by `tests/e2e/client-access/journeys.spec.ts` (needs `E2E_FAKE_DRIVE=1` in `.dev.vars` for the run, restore after); if it can't run here, record it as not run in `build-notes.md`. Commit `test(e2e): forms never submit natively without javascript`.

**Done when:** the unit tests of 1.1–1.3 and `forms-without-js.spec.ts` pass; `google-button` and `account-unavailable-screen` tests pass unchanged (AC-SFX-004); typecheck and lint clean.

---

## Iteration 2 — D3: catalog dialogs submit on Enter

**Read first:** AC-SFX-009, 010 · C-008, C-005 · technical-design › D-4, Concurrency · code to follow: `src/features/booking/ui/category-dialog/category-dialog.tsx` (`FORM_ID`, `<form onSubmit>`, `CategorySaveButton` with `type="submit" form=…`) · dialogs: `add-service-dialog.tsx` (primary at line ~104, `handleSubmit` at ~197), `service-item-dialog.tsx` (~39), `booking-field-dialog.tsx` (~69), `item-definition-dialog.tsx` (~78).

- [x] **2.1–2.4 One dialog per task**, same steps each:
  1. Test first in the dialog's test: type a valid value, press Enter → the action is called once with the same arguments as clicking the primary button; press Enter twice quickly → still once; an invalid value + Enter → the same field error as clicking.
  2. `const formId = useId();` Wrap the dialog's field content in `<form id={formId} noValidate onSubmit={onFormSubmit}>`, where
     ```ts
     function onFormSubmit(event: FormEvent<HTMLFormElement>): void {
       event.preventDefault();
       if (!isPending) handleSubmit();
     }
     ```
     (use the dialog's own pending flag name: `form.isPending` / `form.pending`). Primary `Button`: `type="submit" form={formId}`, keep `isPending`, remove `onPress`.
  3. Commit `fix(catalog): submit the <dialog> dialog on enter`.

**Done when:** the four dialog tests pass, the existing catalog dialog tests still pass, typecheck and lint clean.

---

## Iteration 3 — Copy: draft with Codex, Owner approves, deck updated (checkpoint)

**Read first:** spec › Copy, D4, D5, D6 · BR-GAL-007, BR-L10N-002 · `docs/features/bilingual-copy-revamp/copy-deck.md` (voice notes at the top; §15 source guide rows ~1180–1197; gallery §16 rows ~1316–1319, ~1415; catalog rows near §5–§7) · current strings: `source-copy.copy.ts` (`guideStep3`, `treeEdited`, `treePrint`), `gallery-copy.copy.ts` (`sourcesEmptyBody`, `linkDialogDescription`), `catalog-copy.copy.ts` (`pickModeMeta`, `fieldDialogDescription`), `workspace-not-found-screen.copy.ts` (tone reference).

- [x] **3.1 Draft with the Codex CLI.** Run `codex exec` (non-interactive) with a prompt that gives: the voice notes from the deck, BR-GAL-007 in full, each string's current EN and ID text, where it shows, and the length of the neighbouring strings; and asks for EN and ID for:
  - D4 (new): `PageNotFoundScreen` title, body, back-to-section label (`{section}` ICU argument), back-to-dashboard label.
  - D5: `guideStep3`, `treeEdited`, `treePrint` (example mapped subfolders, e.g. *Hasil Edit* → Edited photos), `sourcesEmptyBody`, `linkDialogDescription`.
  - D6: EN `pickModeMeta` (`{mode}` argument kept) and EN `fieldDialogDescription`; the ID texts stay unless Codex flags a problem.
  Save the prompt and output in `docs/features/setup-flow-fixes/copy-draft.md`.
- [x] **3.2 Owner approval (stop).** Show the table (key · current · proposed EN · proposed ID) and wait. Apply corrections. Don't start iteration 4's screen or iteration 5 before approval.
- [x] **3.3 Deck.** Add the approved rows to `copy-deck.md` (a new F-24 subsection for D4; corrected rows in §15/§16 for D5; catalog rows for D6), fix the §15 note that says `edited`/`print` are required folder names and the folder-classification note (~1195), and mark the rows `Approved (Owner, <date>)`. Commit `docs(copy): approve setup flow fix copy`.

**Done when:** `copy-draft.md` has the Owner's approval and the deck contains every approved row.

---

## Iteration 4 — D4: page not found inside a workspace

**Read first:** AC-SFX-011…014 · BR-WS-002, BR-WS-003, C-101 · technical-design › D-5, D-6, Security · ADR-015 (routes), ADR-026 · code to follow: `src/app/(owner)/w/not-found.tsx`, `src/features/workspace/ui/workspace-not-found-screen/` (screen + copy + test), `src/ui/patterns/empty-state/empty-state.tsx`, `src/app/(owner)/w/[workspaceId]/layout.tsx`, `src/app/(owner)/w/[workspaceId]/@crumbs/projects/[projectId]/page.tsx`, `src/features/workspace/ui/owner-trail/owner-trail.ts` · Next docs: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md`.

- [x] **4.1 Spike: where a slot `notFound()` lands.** Add a placeholder `src/app/(owner)/w/[workspaceId]/not-found.tsx` that renders the existing `WorkspaceNotFoundScreen` text plus a marker, open `/w/<own>/projects/<random uuid>` on the dev server and check: the content area, the header trail and the sidebar. Record the case (D-6 a or b) in `build-notes.md`. For (a), try `@crumbs/not-found.tsx` returning `null` and re-check. For (b), **stop and ask the Owner** to amend ADR-026 (§ Consequences, the slot `notFound()` line) before changing slot pages. Don't commit the placeholder.
- [x] **4.2 Back target.** Test first (`page-not-found-back-target.test.ts`): `/w/W/projects/x` → `{ kind: "section", section: "projects", href: "/w/W/projects" }`; `/w/W/services/x` → services; `/w/W/message-templates/x` → message-templates; `/w/W/unknown` → `{ kind: "dashboard", href: "/w/W" }`; `/w/W/projects` (section itself missing) → dashboard. Implement as a pure function with the section list from the owner navigation (`sectionCrumb` sections). Commit `fix(workspace): pick the way back from a missing page`.
- [x] **4.3 Screen and boundary.** Test first (`page-not-found-screen.test.tsx`, EN and ID through `NextIntlClientProvider` + `copyMessages(locale)`; never `vi.mock("next-intl")` with the copy registry, see CLAUDE.md): title, body and the back link from 4.2 (mock `usePathname`). Implement `PageNotFoundScreen` (client, `EmptyState`, copy from the approved deck rows, `// not in Pencil`), register its copy module in `src/app/copy-registry.ts`, add `src/app/(owner)/w/[workspaceId]/not-found.tsx`, plus the D-6 slot change from 4.1. Commit `fix(workspace): show page not found inside the workspace`.
- [x] **4.4 E2E.** New `tests/e2e/setup-flow-fixes/page-not-found.spec.ts` per technical-design › Testing (AC-SFX-011…014): two owners via `registerAndVerify` + workspace creation, one project and one service for owner A. Commit `test(e2e): missing pages inside a workspace`.

**Done when:** the tests of 4.2–4.4 pass; `owner-route-coverage.test.ts` and the `@crumbs` tests still pass; the spike case is in `build-notes.md`.

---

## Iteration 5 — D5 + D6: approved copy into the code

**Read first:** AC-SFX-015…017 · BR-GAL-007, BR-L10N-002 · technical-design › D-7, Testing (015–017) · approved rows in `copy-deck.md` (iteration 3) · `source-copy.copy.ts`, `gallery-copy.copy.ts`, `catalog-copy.copy.ts`, `setup-guide-card.tsx`.

- [ ] **5.1 Guidance copy (D5).** Test first: no EN or ID message in `source-copy` or `gallery-copy` matches `` /`(edited|print)`/ ``, and `visibilityFoldedEdited`/`visibilityFoldedPrint` don't exist (AC-SFX-015). Replace the five strings verbatim from the deck, delete the two dead keys in both locales, and update the tests that assert the old text (`git grep -n "edited\` and" src tests`). Commit `fix(gallery): describe folder mapping in the drive guidance`.
- [ ] **5.2 Catalog English (D6).** Test first (AC-SFX-017): EN `pickModeMeta` and `fieldDialogDescription` equal the approved rows and differ from ID. Replace the EN values. Commit `fix(catalog): show english pick mode and booking field copy`.
- [ ] **5.3 Deck parity (AC-SFX-016).** One test per changed copy module that reads `copy-deck.md` with `fs` and checks each F-24 string appears verbatim (list the keys and rows in the test). Commit `test(copy): setup flow fix copy matches the deck`.

**Done when:** the copy tests pass in EN and ID, the existing tests of the touched screens pass, and `catalog-parity` / `copy-registry` tests pass.

---

## Iteration 6 — Close

**Read first:** all AC-SFX · this plan's *Done when* lines · `build-notes.md`.

- [ ] **6.1 Browser check** on the dev server (`preview_start` with the `dev` config; stop only your own server): register page before and after load, catalog dialogs with Enter, a missing project and template URL, *Photo sources* guide, *Package items* in EN and ID. Screenshots into `build-notes.md` (paths only).
- [ ] **6.2 Record.** `build-notes.md`: what was built per iteration, tests run and results, the D-6 case, anything not run and why. Tick this plan. Feature map F-24 → `IN PROGRESS` → `DONE, pending verification`. Update `docs/HANDOFF.md` (Current handoff).
- [ ] **6.3** Commit `docs(setup-flow-fixes): record the build`. Recommend `/sdv:verify-feature setup-flow-fixes`.

**Done when:** every AC-SFX (except the withdrawn 005…008) has a passing test or a documented check, and the docs say so.
