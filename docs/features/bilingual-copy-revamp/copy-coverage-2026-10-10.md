# Copy coverage review — 2026-10-10

This review covers the built client gallery and related owner surfaces in the bilingual-copy worktree. The source modules read for this pass currently contain Indonesian baseline strings; the deck adds the en-US pair without changing source code.

| Surface | Deck section | Source files read |
|---|---:|---|
| Client access, password and unavailable states | 14 | `src/features/gallery/ui/client-gate-screen/client-gate-screen.copy.ts`; `client-password-form/client-password-form.copy.ts`; `client-unavailable/client-unavailable.copy.ts` |
| Client home, navigation and shared statuses | 14 | `client-home-screen/client-home-screen.copy.ts`; `client-copy/client-copy.copy.ts` |
| Client browse, search, pick, notes and viewer actions | 14 | `client-browse-screen/client-browse-screen.copy.ts`; `pick-screen/pick-screen.copy.ts`; `pick-note-sheet/pick-note-sheet.copy.ts`; `viewer-pick-actions/viewer-pick-actions.copy.ts` |
| Client review and partial submission | 14 | `review-screen/review-screen.copy.ts` |
| Client final delivery | 14 | `delivery-screen/delivery-screen.copy.ts`; `delivery-copy/delivery.copy.ts` |
| Owner client access, selection review and summaries | 15 | `project-access-card/project-access-card.copy.ts`; `selection-owner-text/selection-owner.copy.ts`; `gallery-summary-text/gallery-summary.copy.ts` |
| Owner add-ons | 16 | `src/features/booking/ui/add-on-copy/add-on.copy.ts` |
| Global 404 and stepper actions | 17 | `src/app/not-found.copy.ts`; `src/ui/primitives/stepper/stepper.copy.ts` |

## Open questions for the Owner

- Confirm the final display terms for `Edited` and `Print`; the source mixes those identifiers with Indonesian UI, while the required Drive folder names remain `edited` and `print`.
- Confirm whether the source’s bulk-download “saved” wording means received by the browser (the current deck qualifies it) and not Shutrly storage.
- Confirm the owner-facing invoice-link consequence when rotating a gallery link; it is in the source but billing/share behavior remains otherwise deferred.
- Confirm whether the `Anda` forms still present in source strings should be normalized to the approved casual `kamu` voice during implementation.
- Confirm the unresolved localization decisions already recorded in policy: preference persistence, recipient-language selection, and legacy bilingual content rollout.

## Source strings not fully covered by the deck

- `src/features/gallery/ui/client-home-screen/client-home-screen.copy.ts`: the exact `subtitlePartly` list-join behavior (`listJoin`) and the `allPhotosMeta`/`allPhotosMetaNoGroups` variants are represented only in consolidated rows; implementation still needs key-level mapping.
- `src/features/gallery/ui/client-browse-screen/client-browse-screen.copy.ts`: `downloadMenu`, `progressTitle`, `confirmTitle`, `downloadSelected`, `tileDownload`, and the complete selected-download flow need key-level mapping; the deck covers their user-facing meaning in consolidated rows.
- `src/features/gallery/ui/review-screen/review-screen.copy.ts`: `cardMetaQuantityReadOnly`, `quantityReadOnly`, `groupClosed`, `limitReached`, `sentToastTitle`, `sentToastBodyOpen`, and `folderSeparator` need implementation mapping beyond the consolidated table.
- `src/features/gallery/ui/viewer-pick-actions/viewer-pick-actions.copy.ts`: `sheetCount`, `pickedIn`, `pickedQuantity`, `pickedWithNote`, `entriesJoin`, and the “has note” accessible state need key-level mapping.
- `src/features/gallery/ui/delivery-screen/delivery-screen.copy.ts`: `editedMeta`, `printMeta`, `editedTab`, `printTab`, `kindLabel`, `failedBadge`, `failedMeta`, `tileSelect`, and `downloadMenu` are not each separate deck rows.
- `src/features/gallery/ui/selection-owner-text/selection-owner.copy.ts`: detailed summary timestamps (`timeChanged`, `timeSent`, `timeLocked`), `notesPhotos`, quantity metadata, missing-file names and stale/failed toasts are consolidated rather than listed individually.
- `src/features/gallery/ui/gallery-summary-text/gallery-summary.copy.ts`: mobile variants (`allLockedMobile`, `sentMobile`, `openMobile`, `readyMobile`) require responsive key mapping.
- `src/features/gallery/ui/delivery-copy/delivery.copy.ts`: refusal reason `PROJECT_STATUS`, publish/completion stale and failure toasts, and the exact status-chip drift need implementation review.
- `src/features/gallery/ui/project-access-card/project-access-card.copy.ts`: copy-password action and clipboard fallback accessible names/toasts are consolidated in section 15.
- `src/features/booking/ui/add-on-copy/add-on.copy.ts`: `actionsLabel`, `sheetMeta`, `approveDescription`, `cancelDescription`, the full numeric bounds (`TOO_LONG`, `TOO_LARGE`, `INVALID`) and `NOT_AN_OPTION` need key-level mapping.
- `src/app/(owner)/w/[workspaceId]/projects/[projectId]/gallery/**`: route breadcrumbs and any library-generated labels outside the listed modules need a runtime sweep; no additional literal strings were found in the page files inspected.

No `.pen` files were read. No code, tests, migrations or deployment actions were changed or run.
