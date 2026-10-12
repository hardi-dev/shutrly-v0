# Build notes — F-24 setup-flow-fixes

## Iterations 1–2 (build)

Branch `staging`, work in this checkout, no push, no deploy. Iterations 3 to 6 are not started.

### Commits (in order)

| Task | Commit | Subject |
|---|---|---|
| 1.1 | 3b5ccc04 | fix(ui): add a hydration flag for forms that must not submit early |
| 1.2 | 7aa6a214 | fix(auth): post auth forms and keep submit disabled until ready |
| 1.3 | b3e3091e | fix(gallery): post the gallery password and wait until ready |
| 1.3 | 4414e147 | fix(landing): post the waitlist form and wait until ready |
| 1.3 | 8ff00475 | fix(workspace): post the settings form and wait until ready |
| 1.4 | 19349106 | test(e2e): forms never submit natively without javascript |
| 2.1 | 39c68278 | fix(catalog): submit the add service dialog on enter |
| 2.2 | 3072efe6 | fix(catalog): submit the service item dialog on enter |
| extra | 912af830 | fix(catalog): keep focus in choice option rows while typing |
| 2.3 | 26519f05 | fix(catalog): submit the booking field dialog on enter |
| 2.4 | 8718ef78 | fix(catalog): submit the item definition dialog on enter |
| fix | 2aab0991 | test(catalog): narrow the enter helper's primary button to a button |

Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, as the build brief asked. The session attribution reminder named Haiku 5.5; the brief's line was used.

### Tests run and results

Commands use `NODE_OPTIONS=--max-old-space-size=6144 npx vitest run <paths>` unless noted.

| Scope | Command | Result |
|---|---|---|
| 1.1 hook | `src/ui/hooks/use-hydrated` | 1 file, 2 passed |
| 1.2 auth forms (red first) | the six form folders + `use-auth-form` | before the change: 12 new tests failed (`method` missing), 17 existing passed; after: 6 files, 29 passed |
| 1.2 auth UI folder | `src/features/auth/ui` (full folder, background) | 23 files: 20 passed, 3 failed; 66 tests: 61 passed, 5 failed. The 5 failures are 5-second timeouts (5.1–8.7 s) in pre-existing tests (AC-AUTH-002, AC-AUTH-008 x2, AC-AUTH-017, AC-L10N-002). Re-running the affected files alone: login-form, reset-password-form, verify-pending-screen, forgot-password-form: 16 passed. See "Not verified". |
| 1.2 AC-SFX-004 | `google-button`, `account-unavailable-screen`, `register-screen` | 3 files, 6 passed (unchanged files) |
| 1.3 gallery, landing, settings (red first) | the three folders | before the change: 6 new tests failed, 23 existing passed; after: 3 files, 29 passed. Later a lint-only change in client-password-form: `client-password-form` re-run, 7 passed |
| 1.4 E2E | `npx playwright test tests/e2e/setup-flow-fixes/forms-without-js.spec.ts` (dev server on port 3000, reused) | 9 passed, 1 skipped (client gallery case, see below) |
| 2.1 add service (red first) | `src/features/booking/ui/add-service-dialog` | red: 3 new tests failed; after: 5 passed |
| 2.2 service item (red first) | `src/features/booking/ui/service-item-dialog` | red: 3 failed; after: 5 passed |
| 2.3 booking field (red first) | `src/features/booking/ui/booking-field-dialog` | red: 4 failed; after: 5 passed |
| 2.4 item definition (red first) | `src/features/booking/ui/item-definition-dialog` | red: 3 failed; after: 9 passed |
| extra option rows (red first) | `src/features/booking/ui/option-list-editor` | red: 1 failed; after: 3 passed |
| catalog dialogs together | add-service, service-item, booking-field, item-definition, category-dialog, option-list-editor | 6 files, 30 passed |
| booking folder (broad check) | `src/features/booking` | 168 files, 803 tests passed (exit 0) |
| after the helper fix (2aab0991) | the four Iteration 2 dialog folders | 4 files, 24 passed |
| typecheck | `pnpm typecheck` | run after 1.4: exit 0. Run after 2.4: exit 2 (TS2339, `HTMLElement.form` in the test helper). Fixed in 2aab0991; final run: exit 0 |
| lint | `prettier --write` + `eslint --fix` on each changed file, and the pre-commit hook on every commit | clean on every commit |

Not run: the full suite (`pnpm test`, full E2E), per the brief.

### Skipped or not run, and why

- **Client gallery case (1.4).** `/g/<token>` needs a published gallery over the fake Drive, which needs `E2E_FAKE_DRIVE=1`. That flag is not in `.dev.vars` and the dev server must not be restarted. The case is in `tests/e2e/setup-flow-fixes/forms-without-js.spec.ts` and runs only when `E2E_CLIENT_GALLERY_PATH=/g/<token>` is set. Otherwise it is skipped (1 skipped in the run above).
- **Real Enter key in a browser (Iteration 2).** Not verified in this iteration. The unit tests check that the primary button's form owner is the dialog form and then fire the form's submit (see deviation 2). The browser check belongs to plan 6.1.
- **Real no-JS and mid-hydration checks beyond the spec.** The E2E covers the no-JS state (button disabled, Enter does nothing, native POST changes nothing). The window where JS has loaded but not yet hydrated is covered only by the server-markup unit assertions.

### Deviations from the plan, with reasons

1. **1.1 red step not observed.** The hook test and the hook were written in the same command, so the test passed on its first run and no failing run was seen first. The test is in the commit.
2. **Iteration 2 test method.** user-event's Enter only submits through a submit button inside the form's own DOM. The primary button sits in the modal footer and uses the `form` attribute, which is how the browser links it. `tests/support/forms/implicit-submit.ts` (`pressEnterInField`) checks that the button's `form` is the field's form and then fires the form's `submit`. This keeps the test on the same association a browser uses, but it is not a real key press.
3. **Option rows keyed by text (extra commit 912af830).** `option-list-editor.tsx` keyed each option row by `index-text`. Every keystroke re-mounted the input and detached it: a probe showed the field disconnected and focus on a button after one character. That makes Enter in an option row impossible to press from the field, which AC-SFX-009 covers. The key is now the row index (no state lives in the row). The file is outside the plan's list; the new test is `keeps the same option field while typing`.
4. **Lint shape changes.** `sonarjs/deprecation` flags `FormEvent`, so `SyntheticEvent` is used (the same as `category-dialog`). `max-lines-per-function` (50) forced: `useAddServiceForm`'s `navigate` helper inlined as `push: (path) => router.push(path)` and its `handleSubmit` folded into `onFormSubmit`; in `ClientPasswordForm` a one-line `const handleSubmit` (an inline arrow in a JSX prop is rejected by `no-restricted-syntax`).
5. **Conditional skip lint.** `sonarjs/no-skipped-tests` flagged a `test.skip(...)` followed by a `test(...)`. The gallery case uses `const galleryCase = galleryPath ? test : test.skip;` instead. The effect is the same: skipped when the fixture path is not set.
6. **Duplicate error text.** For a duplicate definition, the message shows in the picker and in the field-error line, both before and after this change (existing behaviour). The service-item test uses `findAllByText` for that reason.
7. **Test helper for server markup.** `tests/support/forms/server-form.tsx` renders markup inside `NextIntlClientProvider` with `copyMessages(locale)`, as the brief asked. No `vi.mock("next-intl")`.

### Not verified / open

- The 5 timeouts in the full `src/features/auth/ui` run were not re-checked against a baseline commit. They are 5–9 s timeouts in pre-existing tests, and each affected file passes when run alone. Running the folder in parallel is the likely cause, but this was not proven.
- `pnpm typecheck` was run after 1.4 and after the final helper fix, not after each commit.
- The waitlist change ships to production with the next landing deploy (technical-design › Risks). Not deployed; noted for the ship notes.

## Iteration 3.3 and 4 (build)

Branch `staging`, work in this checkout, no push, no deploy. Iterations 5 and 6 are not started.

### Commits (in order)

| Task | Commit | Subject |
|---|---|---|
| 3.3 | d84ca25d | docs(copy): approve setup flow fix copy |
| 4.2 | a6237861 | fix(workspace): pick the way back from a missing page |
| 4.3 | e851d0e9 | fix(workspace): show page not found inside the workspace |
| 4.4 | 5d425e66 | test(e2e): missing pages inside a workspace |

Each commit ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, as the build brief asked. The record commit is `docs(setup-flow-fixes): record iteration 4`.

### Task 3.3 (copy)

- `copy-draft.md`: status set to the Owner's approval. A "Final approved copy" table was added with the approved EN and ID text. The earlier proposed table is kept as the record.
- `copy-deck.md`: 15 edits, each checked to match exactly once.
  - New §17.1 *Page not found inside a workspace* (4 rows).
  - §9.1 step 3, and the two example-folder labels, replaced with the approved text.
  - §10.3 empty body and add description replaced with the approved text.
  - §5.4 pick-mode meta row and §5.5 dialog description row added. Neither existed in the deck before.
  - §10.5 `edited`/`print` explanation rows marked *Removed (F-24)*. No replacement text was written, because none is approved.
  - Notes that called `edited`/`print` required or recognised (top note, §9 intro, §9.1 notes, §4 root-only row) reworded to BR-GAL-007 (subfolders mapped to package items; no folder name is special).
  - Every changed row is marked `Approved (Owner, 2026-10-12)`, except the §10.5 removal rows.

### Spike: D-6 case (case a, not b)

Date 2026-10-12, dev server on port 3000 (reused, not restarted). Owner registered by a throwaway Playwright spec (deleted afterwards). Page: `/w/<own>/projects/<random uuid>`.

| Run | Setup | Result |
|---|---|---|
| 1 | placeholder `w/[workspaceId]/not-found.tsx` only | HTTP 404. The page shows "Ruang kerja tidak ditemukan" (`w/not-found.tsx`). The `[workspaceId]` boundary's marker is absent. The whole shell is replaced. This is the case the spec called (b) before any fix. |
| 2 | run 1 plus `@crumbs/not-found.tsx` returning `null` | HTTP 404. The marker renders inside `<main>`. The sidebar nav (*Navigasi utama*) stays. No breadcrumb nav is rendered (the trail is empty). |

Conclusion: case (a) holds. The `@crumbs/not-found.tsx` file is needed, and no ADR-026 amendment is required. No stop was needed. Both placeholders were removed before committing, so no spike file is in a commit.

Gap found: the trail is empty on *page not found*. AC-SFX-014 says the breadcrumb shows the workspace and, where it exists, the parent section. The current implementation shows neither: the trail never names the missing record (AC-SFX-014's hard rule holds), but it also does not show the workspace or section. This is a deviation to report to the Owner. Fixing it would need the slot not-found handler to rebuild the ancestors from the pathname, which is more than D-6 specifies.

### Test runs

| Scope | Command | Result |
|---|---|---|
| 4.2 back target (red first) | `npx vitest run src/features/workspace/ui/page-not-found-screen` | red: module missing. Green: 1 file, 6 passed |
| 4.2 with owner trail | `npx vitest run src/features/workspace/ui/owner-trail src/features/workspace/ui/page-not-found-screen` | 3 files, 13 passed |
| 4.3 screen (red first) | `npx vitest run src/features/workspace/ui/page-not-found-screen` | red: 1 file failed (module missing). Green, with `owner-trail`: 4 files, 17 passed |
| 4.3 related set | `npx vitest run src/features/workspace/ui/owner-trail src/features/workspace/ui/owner-shell src/app/copy-registry.test.ts src/features/workspace/ui/page-not-found-screen src/features/workspace/ui/workspace-not-found-screen` | 7 files, 34 passed (includes `owner-route-coverage.test.ts`) |
| 4.4 E2E (first run) | `npx playwright test tests/e2e/setup-flow-fixes/page-not-found.spec.ts` | 1 passed, 1 failed. The failure was the 5 s redirect check in the shared `openWorkspace` helper (dev server cold). |
| 4.4 E2E (after retries: 2) | same command | 2 passed (55.8 s), first attempt, no retry used |
| typecheck | `pnpm typecheck` (`next typegen && tsc --noEmit`) | exit 0 |
| lint | `prettier --write` + `eslint --fix` on each changed file, then the pre-commit hook on each commit | clean |

Not run: the full suite and the full E2E run, per the brief.

### Deviations from the plan, with reasons

1. **Spike outcome.** Case (a) held, so 4.1 did not stop for an ADR-026 amendment (see above). The empty trail (AC-SFX-014 wording) is reported as a gap.
2. **`owner-trail.ts` changed outside the plan's file list.** `isOwnerSection` is exported, and a new `sectionLabel(section, t)` is used by `sectionCrumb`. The label behaviour is unchanged. Needed by the back link (4.2) and by the screen's `{section}` value (4.3).
3. **`page-not-found-back-target.ts` fallback.** A pathname with no workspace segment returns `/workspace` (the existing "Back to workspaces" target). The boundary only renders under `/w/[workspaceId]`, so this is a defensive branch with no test.
4. **`retries: 2` in `page-not-found.spec.ts`.** The shared owner helpers wait 5 s for the post-sign-up redirect, which a cold dev server can miss. The team and catalog specs already use the same retries. No retry was needed in the final run.
5. **Copy text.** The approved text is used verbatim, including `doesn't` with a straight apostrophe, as the brief's table has it. The rest of the deck uses curly apostrophes. Owner may want the apostrophe normalised.
6. **§10.5 removed rows.** The brief asked for the `edited`/`print` explanations to be reworded. No approved wording exists for them, so they are marked *Removed (F-24)* and no new copy was written. The keys themselves are removed in iteration 5 (D-7).
7. **§9 intro note also reworded.** "preserves actual required folder names" was not on the brief's list, but it is the same claim, so it was changed.

### Not verified / open

- The E2E spec checks AC-SFX-014 as "no breadcrumb text contains the requested id or name". With the trail empty, that check passes trivially. It does not check that the workspace or section is shown (gap above).
- The E2E specs have not been checked against a build before the boundary change (no red run of the E2E spec, only the unit tests were red first).
- Visual check of the page-not-found state in a browser is part of plan 6.1, not done here.
