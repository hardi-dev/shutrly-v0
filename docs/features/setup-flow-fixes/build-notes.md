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

## Iteration 5 and 6 (build)

Branch `staging`, this checkout, no push, no deploy, no PR. Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, as the build brief asked.

### Commits (in order)

| Task | Commit | Subject |
|---|---|---|
| Iteration 4 gap, and the copy apostrophe | e218acd0 | fix(workspace): show the workspace and section crumbs on page not found |
| 5.1 | d5fb8377 | fix(gallery): describe folder mapping in the drive guidance |
| 5.2 | e8020ecd | fix(catalog): show english pick mode and booking field copy |
| 5.3 | c9eb233a | test(copy): setup flow fix copy matches the deck |
| 6.3 | (this commit) | docs(setup-flow-fixes): record the build |

### Part A: the breadcrumb on page not found (AC-SFX-014)

The gap recorded under *Iteration 3.3 and 4* is closed: the page-not-found trail was empty. Owner decision (2026-10-12): *Build workspace › section*.

- **How.** The crumb slot's `not-found.tsx` renders `PageNotFoundCrumbs` (client). Not-found files get no props, so the component reads the path with `usePathname()` and the verified workspace from a new `OwnerWorkspaceProvider` (`features/workspace/ui/owner-workspace-context/`), which `OwnerShell` wraps around its tree. The trail comes from the pure helper `pageNotFoundTrail` (`page-not-found-trail.ts`): the workspace crumb, then the section crumb when the URL's first segment after the workspace id is a known owner section. It never reads the loaded record.
- **Unknown routes.** `@crumbs/[...segments]/page.tsx` and `@crumbs/message-templates/[templateType]/page.tsx` returned `null` for a route that doesn't exist, so the slot had nothing to show. They now call `notFound()`, which reaches the crumb not-found. Every real route already has a static trail (checked against the file list), so only nonexistent routes change.
- **Shape.** The section is the last crumb, so `BreadcrumbTrail` renders it as current text (`aria-current="page"`), not a link. The workspace is a link when a section follows it; on an unknown section it stands alone as current text.
- **Copy.** The EN body is the approved curly-apostrophe text (*doesn’t*) in `page-not-found-screen.copy.ts`, its test, the deck row and `copy-draft.md`. The apostrophe test was red first (1 failed, 3 passed), then green. Spec and AC prose keep their wording.
- **Red first.** The helper and the crumb component were tested before they existed: `page-not-found-trail.test.ts` and `page-not-found-crumbs.test.tsx` failed on the missing modules (2 files failed, 10 passed).
- **E2E.** `tests/e2e/setup-flow-fixes/page-not-found.spec.ts` now asserts, on every missing URL, that the breadcrumb holds the workspace name (*Session Team Studio*) and the section label (*Proyek*, *Templat pesan*, *Layanan*) and no requested id or name.

### Iteration 5 (copy in code)

- **5.1 (D5).** `source-copy` and `gallery-copy`: `guideStep3`, `treeEdited`, `treePrint`, `sourcesEmptyBody`, `linkDialogDescription` now carry the approved EN and ID text verbatim from `copy-draft.md` (the same text as the deck rows). Red first: `source-copy.test.ts` and `gallery-copy.test.ts` (new): 8 failed and 4 passed across 3 files, including the catalog test. Green after the copy change: 3 files, 12 passed.
- **5.2 (D6).** `catalog-copy`: EN `pickModeMeta` = `Client choice: {mode}`, EN `fieldDialogDescription` = `Filled in when creating a project from this service.`; ID unchanged. The two `DECK GAP` comments that covered them were removed. Test: `catalog-copy.test.tsx`, new case.
- **5.3 (AC-SFX-016).** One deck-parity test per changed copy module: `source-copy.deck.test.ts`, `gallery-copy.deck.test.ts`, `catalog-copy.deck.test.ts`, `page-not-found-screen.deck.test.ts`. Each reads `docs/features/bilingual-copy-revamp/copy-deck.md` with `fs` and checks each EN/ID pair appears as one row, verbatim.
- **Old text.** `git grep` over `src` and `tests` for the old strings found no test asserting them; the only remaining hits are the new text.

### Tests run and results

| Scope | Command | Result |
|---|---|---|
| Part A, unit | `NODE_OPTIONS=--max-old-space-size=6144 npx vitest run src/features/workspace/ui/page-not-found-screen` | 4 files, 17 passed |
| Part A, related | `… npx vitest run src/features/workspace/ui/page-not-found-screen src/features/workspace/ui/owner-trail src/features/workspace/ui/owner-shell src/app/copy-registry.test.ts src/features/workspace/ui/workspace-not-found-screen` | 9 files, 41 passed |
| Part A, E2E (first run) | `npx playwright test tests/e2e/setup-flow-fixes/page-not-found.spec.ts` | 1 failed (the trail was empty on unknown template and section URLs; fixed by the `notFound()` change), 1 passed |
| Part A, E2E (after fixes) | same command, `--retries=0` | 2 passed (first attempt) |
| Iteration 5, copy red | `… npx vitest run src/features/gallery/ui/source-copy src/features/gallery/ui/gallery-copy src/features/booking/ui/catalog-copy` | 8 failed, 4 passed (red, before the copy change) |
| Iteration 5, copy green | same | 3 files, 12 passed |
| Iteration 5, deck tests | `… npx vitest run src/features/gallery/ui/source-copy src/features/gallery/ui/gallery-copy src/features/booking/ui/catalog-copy src/features/workspace/ui/page-not-found-screen` | 11 files, 33 passed |
| Typecheck (after Part A) | `pnpm typecheck` | exit 0 |
| **All F-24 related, together (final)** | `NODE_OPTIONS=--max-old-space-size=6144 npx vitest run src/ui/hooks/use-hydrated src/features/auth/ui src/features/gallery/ui/client-password-form src/features/landing/ui/waitlist-form src/features/workspace/ui/settings-screen src/features/booking/ui/add-service-dialog src/features/booking/ui/service-item-dialog src/features/booking/ui/booking-field-dialog src/features/booking/ui/item-definition-dialog src/features/booking/ui/option-list-editor src/features/booking/ui/catalog-copy src/features/workspace/ui/page-not-found-screen src/features/workspace/ui/owner-trail src/features/workspace/ui/owner-shell src/features/gallery/ui/source-copy src/features/gallery/ui/gallery-copy src/features/gallery/ui/setup-guide-card src/app/copy-registry.test.ts` | **47 files, 179 tests passed (exit 0)**. `owner-shell` was added to the brief's list because it changed. The five 5-second auth timeouts from Iteration 1–2 did not recur. |
| **E2E folder (final)** | `npx playwright test tests/e2e/setup-flow-fixes/` | **11 passed, 1 skipped (exit 0)**. Skipped: the client gallery case in `forms-without-js.spec.ts` (needs `E2E_CLIENT_GALLERY_PATH`). |
| **Typecheck (final)** | `pnpm typecheck` | **exit 0** |
| Lint | `prettier --write` and `eslint --fix` on each changed file; the pre-commit hook on every commit | clean (every commit exit 0) |

### 6.1 Browser check

Dev server on port 3000, reused (not started or stopped). A throwaway spec, `tests/e2e/setup-flow-fixes/zz-f24-browse-check.spec.ts`, drove two throwaway Owners, one in EN and one in ID (dev database, `f24-en+…` and `f24-id+…@test.shutrly.dev`). The spec is deleted and not committed; `git status` was clean afterwards. Screenshots are in the session scratchpad, folder `f24-shots/` (names only, as the plan asks):

| File | What it shows | Checked |
|---|---|---|
| `01-register-no-js.png` | `/register` with JavaScript disabled: *Create account* is disabled | viewed; the spec asserts `toBeDisabled()` |
| `02-register-js.png` | `/register` with JavaScript: submit enabled | captured; the spec asserts `toBeEnabled()` |
| `04-en-` / `04-id-add-service-dialog-before-enter.png` | Add service dialog with a name and price, before Enter | captured |
| `05-en-after-enter-service-page.png` | After Enter in the price field: *Changes saved*, service page open (*Wisuda Basic*) | viewed (second run) |
| `06-en-add-booking-field-dialog.png` | *Add booking field*, subtitle *Filled in when creating a project from this service.* | viewed |
| `07-en/id-package-items-dialog.png` | *Add package item* dialog | captured, not viewed |
| `08-en-package-items.png` | *Package items*: *Client choice: Photos to edit*, *Client choice: Photos to print* | viewed |
| `08-id-package-items.png` | *Isi paket*: *Pilihan klien: Foto untuk dicetak*, *Pilihan klien: Foto untuk diedit* | viewed |
| `09-en-missing-project.png` | *Page not found*, *This page doesn’t exist or was removed.*, breadcrumb *F24 Studio › Projects* | viewed |
| `09-id-missing-project.png` | *Halaman tidak ditemukan*, breadcrumb *F24 Studio › Proyek* | viewed |
| `10-en-photo-sources.png` | *Photo sources* guide: step 3 is the approved text; diagram labels are the approved EN text | viewed |
| `10-id-photo-sources.png` | the ID guide | captured, not viewed |

Results:
- D1: the no-JS register button is disabled; with JavaScript it is enabled.
- D3: a real Enter key in the Add service dialog saves the service and opens its page (AC-SFX-009 in a browser, for that dialog only).
- D4 and AC-SFX-014: both missing-project pages show the workspace and section crumbs, with no record id.
- D5: the EN guide shows the approved text.
- D6: the EN package items and booking field dialog are English; the ID ones are Indonesian.

Findings (things that looked wrong; none were fixed here):
1. **Indonesian loading text on the EN UI.** The first capture of the EN service page, taken during loading, showed the skeleton *Memuat layanan*. It is hard-coded in `src/features/booking/ui/catalog-skeletons/catalog-skeletons.tsx` (line 10, `detail`). It predates F-24 and is outside its scope. It needs its own copy key.
2. **Mixed-language diagram labels.** The approved EN labels *Hasil Edit → mapped to Edited photos later* and *Cetak → mapped to Printed photos later* put Indonesian folder names in the English UI. They are implemented as approved; the Owner should confirm.
3. **Edited and Print tab lines.** `visibilityFoldedEdited` and `visibilityFoldedPrint` are still shown on the Edited and Print tabs of *Semua foto* (through `browse-text.kindVisibility`). They name `edited` and `print` folders. The tab screens were not reached in the browser (see Not run).
4. **Breadcrumb shape.** On page not found the section is the current item, so it is plain text, not a link. This follows the trail's convention and the Owner's *workspace › section*, but a link back to the section would be more useful; the back button in the body already does that.

### Not run, and why

- The full test suite and the full E2E run (per the brief).
- The client gallery case of `forms-without-js.spec.ts` (needs `E2E_CLIENT_GALLERY_PATH`, a published gallery over the fake Drive).
- The Edited and Print tab lines in the browser (needs a gallery with photos in those tabs). The string is confirmed in code and in `browse-text.test.ts`.
- Enter in the *Add package item* and *Add booking field* dialogs in a real browser (only Add service was checked; the unit tests cover the others).
- A browser check of the Indonesian photo-sources screen (captured, not viewed).

### Deviations from the plan, with reasons

1. **5.1 dead keys kept.** The plan and D-7 say `visibilityFoldedEdited` and `visibilityFoldedPrint` have no reader, and the deck's §10.5 rows say so. Both are wrong: `browse-text.kindVisibility` (`src/features/gallery/ui/browse-text/browse-text.ts`, line 55) reads them for the Edited and Print tabs of *Semua foto*. Deleting them would break that line, and no approved replacement exists, so I did not invent wording. They are kept. `gallery-copy.test.ts` (AC-SFX-015) lists them as the one open exception, and any other message that names a folder fails the test. The §10.5 rows in the deck were left unchanged (they are Owner-approved records); they need correcting once the Owner decides the wording.
2. **Iteration 4 gap closed in Part A (outside the plan's file list).** To show the workspace and section crumbs, I added `owner-workspace-context/` (new), `page-not-found-crumbs.tsx` and `page-not-found-trail.ts` (new), a provider in `owner-shell.tsx`, a re-export of the page-header namespace in `page-not-found-screen.copy.ts`, and `notFound()` in two crumb routes. The alternative was a DB read in the not-found file, which the docs don't allow (no params).
3. **Deck tests: four files, one per changed copy module.** That is how the plan states 5.3. The gallery and source copy also have new unit test files (`source-copy.test.ts`, `gallery-copy.test.ts`).
4. **Curly apostrophe.** The Owner's *doesn’t* was applied to the copy module, its test, the deck row and `copy-draft.md`. The apostrophe in spec and AC prose was left alone.
5. **Copy drift check.** Approved text is used verbatim, including the arrows in the example labels (see finding 2).

### Plan and docs

- `plan.md`: 5.1 ticked with a note about the kept keys (deviation 1); 5.2, 5.3, 6.1, 6.2 and 6.3 ticked.
- `docs/product/feature-map.md`: F-24 row has the status `DONE, pending verification (2026-10-12; …)` after its existing links.
- `docs/HANDOFF.md`: new section *F-24 setup-flow-fixes — built, pending verification (2026-10-12)* above the F-10 handoff, with the open Owner questions and the next step `/sdv:verify-feature setup-flow-fixes`.

## Follow-up (2026-10-12, review)

- **Client gallery no-JS case run.** `E2E_CLIENT_GALLERY_PATH` set to the path of the seeded *Wisuda Rina* client link (`SEED_CLIENT_WISUDA_RINA` in the git-ignored `.env.seed.dev-demo`; token not recorded here), then `npx playwright test tests/e2e/setup-flow-fixes/forms-without-js.spec.ts --retries=0`: **10 passed, 0 skipped**. AC-SFX-001…003 now have E2E evidence for the gallery password form too.
- **Related unit set re-run by the reviewer:** 48 files, 183 tests passed; `pnpm typecheck` exit 0.
- **Plan task 5.4 done** (commit 1d85fed4, `fix(gallery): explain mapped folders on the edited and print tabs`): the Owner approved the Edited and Print copy on 2026-10-12; the deck rows and the EN and ID values of `visibilityFoldedEdited` / `visibilityFoldedPrint` match verbatim, and the folder exception in `gallery-copy.test.ts` is gone (AC-SFX-015). Red first: 4 failing cases before the copy change. Green: `npx vitest run src/features/gallery/ui/gallery-copy src/features/gallery/ui/browse-text src/features/gallery/ui/source-copy src/app/copy-registry.test.ts`, 6 files, 16 tests passed; `pnpm typecheck` no errors; prettier and eslint clean on the four changed TS files.
- **Seen, out of scope:** the services loading skeleton has a hard-coded Indonesian label (`src/features/booking/ui/catalog-skeletons/catalog-skeletons.tsx` line 10, "Memuat layanan") on the English UI (BR-L10N-002). Not part of F-24.
