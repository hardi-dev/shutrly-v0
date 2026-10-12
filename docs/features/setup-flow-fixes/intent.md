# Intent: Fix the defects found while setting up a new workspace

Author: Owner (hardi-dev), from an agent walkthrough on 2026-10-12
Source: BUG
Status: DRAFT

## Problem
On 2026-10-12 an agent registered a new Owner on `localhost:3000` (dev database `shutrly-staging-us`), created the workspace *Explore Studio* and set up every piece of master data a new Owner needs before a first booking: a category, a service with package items and a booking field, a team member, a client, and a look at photo sources, message templates and settings. Seven defects showed up along the way. Each one makes the first-run setup slower, confusing or unsafe for a new Owner. They must be fixed before the setup checklist ([F-25](../setup-checklist/intent.md)) sends new Owners through these screens.

1. **Auth forms can leak the password into the URL (security).** When the register page had not loaded its JavaScript (opened on `127.0.0.1:3000`, where the dev server blocks its scripts), *Create account* submitted a native `GET` and the browser went to `/register?name=…&email=…&password=…`. The `<form>` elements have no `method`, so the browser falls back to `GET`. The same holds for login, forgot-password, reset-password, change-password, profile and the Google button (`src/features/auth/ui/*`). In production, a slow connection or a failed script load would put a real password in browser history, proxy and server logs. Relates to C-103.
2. **The service list stays stale after *Add service*.** Saving the *Add service* dialog shows the toast *Changes saved*, but the *Wedding* category still reads "0 services · No services yet" until the page is reloaded. A new Owner thinks the save failed and may create the service again.
3. **Enter doesn't submit the catalog dialogs.** In *Add package item*, typing a value and pressing Enter does nothing; the dialog stays open. Its *Add* button, like *Save* in *Add service* and *Add* in *Add booking field*, is `type="button"`, while the category, team member and client dialogs submit on Enter.
4. **A wrong message-template URL says "Workspace not found".** Opening `/w/<id>/message-templates/GALLERY_SHARE` (an unknown template slug) renders "Workspace not found · This workspace isn't available" for a workspace that exists. An unknown template is a not-found page, not a missing workspace (BR-WS-003).
5. **The photo-source guide still teaches the old `edited` / `print` folder convention.** *Photo sources* › *Set up your Google Drive folder* step 3 says "For final delivery, add subfolders named `edited` and `print` later", with a folder diagram labelled *Edited files* / *Print files*. F-21 replaced that rule: subfolders are mapped to package items by hand and no name is recognised (BR-GAL-007). The same stale wording is in the gallery copy (`gallery-copy.copy.ts`, EN and ID). A new Owner following the guide sets up their Drive the wrong way.
6. **Indonesian text on English catalog screens.** With the UI in English, *Services* › *Package items* shows "Pilihan klien: Photos to edit", and the *Add booking field* dialog subtitle reads "Diisi saat membuat proyek dari layanan ini." The English entries of `pickModeMeta` and `fieldDialogDescription` in `catalog-copy.copy.ts` hold the Indonesian strings (BR-L10N-002).
7. **The *Add service* dialog can't finish setting up a service.** Its subtitle says package items and booking fields are set up "after creating the service", but saving keeps the Owner on the list (see 2) instead of taking them to the new service, where those sections are. A new Owner can end up with a service that has no package items, so the client has nothing to pick against.

## Proposed outcome
- No auth form can send credentials in a URL, with or without JavaScript.
- After *Add service*, the Owner sees the new service at once and can carry on with its package items without hunting for it.
- Every catalog dialog submits on Enter, like the other dialogs.
- An unknown template URL shows a not-found page; "Workspace not found" appears only for a workspace the Owner can't open.
- Every guide and help text about Drive folders matches folder mapping (BR-GAL-007 as amended by F-21), in English and Indonesian.
- English screens show English only (BR-L10N-002).

## Affected users and systems
- Prospective and new Owners: register, login and password screens (F-01 `auth`).
- Owner: *Services* list, *Add service*, *Add package item*, *Add booking field* (F-05 `catalog`).
- Owner: message template editor route (F-03 `message-templates`).
- Owner: *Photo sources* guide (F-04 `source-config`) and gallery folder help text (F-09 `gallery`).
- Copy catalogues for EN and ID (F-22 `bilingual-copy-revamp`).

## Constraints
- C-103: no credentials or secrets in URLs or logs.
- BR-GAL-007 (amended by F-21) is the source of truth for folder wording; the copy follows the rule, not the other way round.
- BR-L10N-002; copy changes follow the F-22 copy rules (text from `copy-deck.md` where it exists).
- Each fix gets a test that would have caught it (findings rule, `docs/findings/README.md`).
- No change to business rules: these are defects against existing rules.

## Out of scope
- The setup checklist and dashboard changes: [F-25 `setup-checklist`](../setup-checklist/intent.md).
- Indonesian versions of the default message templates (BR-L10N-003): part of F-22.
- The dev server refusing `127.0.0.1` (Next.js `allowedDevOrigins`): a dev-only setting, not a product defect. It only exposed defect 1.
- Thousands separators in the price input (*Rp 5000000* while typing): seen, not judged a defect; raise separately if wanted.

## Open questions
- Defect 7: should *Add service* open the new service's page after saving, or stay on the list and highlight the new row with a link? This is a UX choice, so it may need a Pencil frame (design wins over docs on UX).
- Defect 6 overlaps F-22, which is partly built on `codex/bilingual-copy-revamp`. Fix the two strings here on `staging`, or leave them to F-22 and accept the mixed text until it merges? Fixing here risks a merge conflict in `catalog-copy.copy.ts`.
- Defect 5: does the copy deck already have mapping-era wording for the source guide and gallery help, or does new copy need writing (and Owner approval)?
- Defect 1: besides `method="post"`, should the forms refuse to submit until hydrated? A plain `POST` without JavaScript would still go to the page route, so what the server does with it needs checking during discovery.
