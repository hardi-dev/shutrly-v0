# Spec: Setup flow fixes (F-24)

Status: SPECIFIED (2026-10-12) · Intent: [intent.md](intent.md) (ACCEPTED 2026-10-12) · Criteria: [acceptance-criteria.md](acceptance-criteria.md)

## Goal
A new Owner can register, set up a workspace and its catalog, and read the setup guidance without leaking credentials, without stale or misleading screens, and without mixed-language text. This fixes the defects found in the 2026-10-12 walkthrough (intent › Problem, defects 1–7) and the wider cases discovery found behind them.

## User story
As a new Owner setting up Shutrly for the first time, I want every setup screen to save, confirm and guide me correctly, so I can get to my first project without guessing, retrying or exposing my password.

## Preconditions
- The app runs with the workspace, catalog, message-template, source and gallery features as on `staging` (F-02…F-10, F-21, F-22 merged).
- No business rule or feature-spec changes.

## Scope by defect

### D1 — Forms never put input in a URL, and don't submit before they're ready
**Found:** the register form, before its JavaScript ran, submitted a native `GET` and put name, email and password in the address bar. **Discovery widened it** (SPEC GAP, Owner 2026-10-12): every form that renders on the page before JavaScript and submits from the client has the same flaw:

| Form | Carries | Surface |
|---|---|---|
| Register, login, forgot password, reset password | email, password, reset token | auth pages |
| Profile, change password | name, current and new password | `/profile` |
| Client gallery password | gallery password (C-103) | client gallery `/g/[token]` |
| Landing waitlist | email | `/` (live on production, ADR-021) |
| Workspace settings | brand and contact details | `/w/[id]/settings` |

Correction to the intent: the Google button and the *account unavailable* sign-out form already submit through server actions, which post and work without JavaScript; they're out of D1. Forms inside dialogs only exist after JavaScript has loaded, so they can't submit natively; they're out of D1.

**Behavior (Owner 2026-10-12):** each form above submits with `POST`, never `GET`. Its submit button is disabled until the page is interactive. A native submit that still reaches the server (e.g. the button is enabled by some other means) creates, changes or signs in nothing, and the input appears in no URL, log or analytics event (C-103, C-006).

### D2 + D7 — Withdrawn (not reproduced)
**Found:** after *Add service*, the list looked stale and the Owner stayed on it. **On retry (2026-10-12)** the dialog saved and opened the new service, as F-05 specifies (`history.pushState` to `/services/<id>`, no console error). The walkthrough most likely read the page while the dev server was still compiling the service route on first use, then reloaded, which cancelled the navigation. Unproven, but every observation fits, and a production build has no on-demand compile. **Owner (2026-10-12): withdrawn; F-05's behavior stays** (the F-05 amendment was reverted). AC-SFX-005…008 are withdrawn.

### D3 — Catalog dialogs submit on Enter
**Found:** pressing Enter in *Add package item* does nothing; *Add service* and *Add booking field* behave the same. Their primary button isn't a submit button, unlike the category, team-member and client dialogs.

**Behavior:** in every catalog dialog with a primary save button (*Add service* / edit service info, *Add package item* / edit value, *Add booking field* / edit field, *Add package item* definition and its edit, *Add category* / rename), pressing Enter in a single-line field submits the dialog exactly as clicking the primary button does, with the same validation and errors. Enter in a multi-line field (e.g. *Choice* options, if multi-line) adds a line and doesn't submit. A dialog that is already saving doesn't submit twice.

### D4 — A missing page inside a workspace says so, not "Workspace not found"
**Found:** `/w/<id>/message-templates/GALLERY_SHARE` shows "Workspace not found" for a workspace the Owner owns. Discovery widened it (Owner 2026-10-12): the only Owner not-found page is the workspace one, so every missing record inside a valid workspace shows it: an unknown template slug, a deleted or foreign project, service or selection group id, an unknown section.

**Behavior:** inside a workspace the Owner can open, a missing page or record shows a *page not found* state inside the workspace shell (sidebar and header stay), saying the page doesn't exist or was removed, with a way back to the workspace (the dashboard, or the parent list where one exists). "Workspace not found" is shown only when the workspace itself can't be opened: missing, or not owned by this Owner (BR-WS-003). A record from another workspace is shown as *page not found*, never as its data and never as proof that it exists elsewhere (C-101).

### D5 — Drive folder guidance matches folder mapping
**Found:** the *Photo sources* guide (step 3 and the folder diagram) and the gallery folder help say finished files go in subfolders named `edited` / `print`. Since F-21, no folder name is recognised; the Owner maps subfolders to package items (BR-GAL-007).

**Behavior:** every reader-facing text and diagram label that describes where finished files go follows BR-GAL-007, in EN and ID: finished files go in subfolders the Owner maps to the project's package items from the gallery page; any folder name works; unmapped photos stay selection photos. No text names `edited` or `print` as special. Affected today: `source-copy` (guide step 3, the diagram's two finished-file labels) and `gallery-copy` (folder empty body, add-folder description, the two hidden-until-delivery explanations), EN and ID; the technical design confirms the full list. The diagram may keep example subfolders, named as an Owner would (e.g. *Hasil Edit*), labelled as mapped.

### D6 — English screens show English only
**Found:** *Services* › *Package items* shows "Pilihan klien: Photos to edit" and the *Add booking field* subtitle reads "Diisi saat membuat proyek dari layanan ini." on the English UI; the English entries of `pickModeMeta` and `fieldDialogDescription` hold the Indonesian text.

**Behavior:** both strings have an English and an Indonesian version, and each locale shows its own (BR-L10N-002). The check that caught nothing (EN = ID text passes the parity gate) is noted for the technical design: the parity gate can't tell an untranslated entry from a deliberate one.

## Copy
New or changed copy (D4 *page not found*, D5, D6) is drafted in EN and ID with the Codex CLI, approved by the Owner, added to F-22's `copy-deck.md` (and the stale deck rows corrected: §15 source guide steps and annotations, the folder-classification note, the gallery empty body, add-folder description and edited/print explanations), then copied into the `*.copy.ts` modules verbatim (Owner 2026-10-12).

## Main flow (the walkthrough, fixed)
1. A prospective Owner opens `/register` on a slow connection and presses *Create account* before the page is ready: nothing is submitted. Once ready, the form posts and the account is created (J-01).
2. After verifying and creating a workspace, the Owner opens *Photo sources* and reads guidance that matches folder mapping (D5).
3. In *Services*, the Owner adds a category, then *Add service*, which opens the new service (F-05, unchanged).
4. On the service, the Owner adds package items and a booking field, pressing Enter to save each (D3), and reads English-only text on the English UI (D6).
5. A mistyped or old link inside the workspace shows *page not found* with a way back, not "Workspace not found" (D4).

## Alternative and error flows
- **D1, slow page:** the button stays disabled until ready; no spinner promise is made beyond today's submitting state.
- **D1, validation or server error after posting:** unchanged from today (field errors, `AuthErrorAlert`, the gallery's lockout).
- **D3, Enter with invalid input:** the same field errors as clicking the button; the dialog stays open.
- **D4, record deleted while open:** the next navigation or refresh shows *page not found*.
- **D4, breadcrumb:** the *page not found* state has a breadcrumb that doesn't name the missing record (F-23).

## Business rules and owning artifacts
- C-103, C-006 (D1); C-101, BR-WS-003 (D4); BR-GAL-007 (D5); BR-L10N-002 (D6); C-007, C-008 (states, keyboard; D3, D4).
- No `BR-*` changes.

## Dependencies
- F-22 copy deck (`docs/features/bilingual-copy-revamp/copy-deck.md`, DRAFT): rows added and corrected here.
- F-23 breadcrumbs: the *page not found* state needs a crumb that names no record.
- Landing (F-19): the D1 waitlist change reaches production on the next landing deploy; ship notes must say so.
- The Codex CLI for copy drafts.

## Out of scope
- The setup checklist and dashboard: F-25 `setup-checklist`.
- Indonesian default message templates (BR-L10N-003, F-22).
- The dev server refusing `127.0.0.1` (dev-only).
- Thousands separators while typing a price.
- Making forms work without JavaScript (progressive enhancement); D1 only stops them leaking.
- Dialog forms other than the catalog dialogs (D3). Others that already submit on Enter are unchanged; any other dialog found not to is reported, not fixed here.

## Flagged concerns

| ID | Concern | Sources | Status |
|---|---|---|---|
| FC-001 | The Owner's *stay on the list + toast* contradicts F-05, which specifies opening the service detail page after *Add service*. | F-05 spec step 4, A-2, AC-CAT-010; intent D7 | WITHDRAWN: D2/D7 did not reproduce; F-05 unchanged, the amendment was reverted (Owner 2026-10-12). |
| FC-002 | F-22's rule "copy only from `copy-deck.md`, verbatim" vs. the deck's own `edited`/`print` rows, which contradict BR-GAL-007 as amended by F-21; and D2/D4 need copy that the deck doesn't have. | F-22 plan rules; BR-GAL-007; copy-deck §15–§16 | RESOLVED: deck rows are corrected and new rows added, drafted with Codex and approved by the Owner, then copied verbatim (Owner 2026-10-12). |
| FC-003 | Discovery widened the accepted intent: D1 from auth forms to every page-rendered client-submitted form (gallery password, waitlist, settings); D4 from the template route to every missing record inside a workspace. | Intent › Scope; C-010 | RESOLVED: the Owner approved both widenings (2026-10-12). |
| FC-004 | Disabling submit until the page is interactive means a visitor without working JavaScript can't submit at all. C-008 targets keyboard and assistive-tech access, not no-JS use, and the forms already need JavaScript to work. | C-008; D1 decision | RESOLVED: the Owner chose disabled-until-ready (2026-10-12); progressive enhancement is out of scope. |
| FC-005 | AGENTS.md: UI tasks are built from Pencil HTML exports. D2 (toast with an action) and D4 (*page not found* in the shell) change UI. | AGENTS.md › UI tasks; Owner decisions | RESOLVED: no Pencil frame for D4 (D2 withdrawn); D4 is built from the existing EmptyState pattern inside the shell. An Owner exception to the export rule for F-24 (Owner 2026-10-12). |
| FC-006 | Two ADRs share the number 025 (`ADR-025-next-intl-bilingual-localization`, `ADR-025-owner-breadcrumb-parallel-route`). Not caused by F-24; D4 touches the breadcrumb ADR. | `docs/architecture/decisions/` | RESOLVED: the breadcrumb ADR is renumbered to [ADR-026](../../architecture/decisions/ADR-026-owner-breadcrumb-parallel-route.md) and every reference updated (Owner 2026-10-12, commit `47625f0`). |

## Open questions
- D3: is the *Choice* options field multi-line? The technical design checks; the behavior above covers both.
- D1: does Next.js render the page for a plain `POST` without a server-action header, or reject it? Either is acceptable if nothing is created and nothing is logged; the technical design checks it (the Owner declined a live probe on 2026-10-12, so it's checked in code or a test).
