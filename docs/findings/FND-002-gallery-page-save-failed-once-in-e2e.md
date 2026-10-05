# FND-002 — Gallery page render logged `SAVE_FAILED` once during an E2E run

Status: OPEN · Found: 2026-10-05 · Found by: `tests/e2e/gallery/gallery-sync.spec.ts` during F-09 rework slice R2 · Area: gallery page load · Severity: low. It happened once, the test still passed, and it did not recur.

## Symptom
During one run of the sync spec the dev server logged `gallery.save_failed` with `operation: "page"` from `loadGalleryPage` (`src/composition/gallery/gallery-flow/gallery-flow.ts`), thrown as `GalleryError("SAVE_FAILED")` by `gallerySaveError`.

## Evidence
- One log line with the workspace id and operation; the wrapper hides the underlying error, so the original cause is unknown.
- It appeared while a sync run was driving `router.refresh()` and server actions; the spec passed without a retry.
- After the step read was narrowed to the columns it needs and `revalidatePath` was skipped on `CONTINUE` steps, two later E2E runs and the real-Drive smoke run did not show it.

## What still works
Gallery page loads in every later run (E2E, real-Drive smoke, the Workers preview).

## Suspected cause (unproven)
A transient database error (a connection dropped while the page and a sync step ran at once), or the page read racing the sync commit. `gallerySaveError` swallows the original error, so the next occurrence can't be diagnosed from the log.

## How to reproduce
Not reproduced. Run the sync spec repeatedly against a dev server and watch for `gallery.save_failed`.

## Fix plan
Make `gallerySaveError` log the error's `name` and a redacted `code` (never the message, which can carry a URL or a key, C-103), so the next occurrence names its cause. Fix the cause when it shows.

## Related
- [FND-001](FND-001-reset-password-hangs-on-workers.md): the same kind of connection error on Workers.
- F-09 plan, rework slice R2 record.
