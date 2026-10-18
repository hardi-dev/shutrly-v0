# Intent: Simplify project and gallery creation

Author: Owner (hardi-dev), from a walkthrough with an agent on 2026-10-18
Source: FEEDBACK
Status: ACCEPTED (Owner, 2026-10-18, with the answers under *Decisions*)

## Problem
Getting from a booked project to a gallery the client can open takes too many steps and too many states. Today the Owner:

1. creates the project (`DRAFT` or `BOOKED`, F-07);
2. opens the project and starts the gallery with *Buat galeri*: keeps the password, sets an expiry, optionally links a folder (F-09);
3. links a Drive folder and waits for the sync;
4. publishes the gallery (`DRAFT → PUBLISHED`, BR-GAL-004);
5. shares it with *Kirim link galeri* (F-10).

Every booked project ends up with exactly one gallery (BR-GAL-001), so step 2 is a decision the Owner never really makes. The gallery also has its own lifecycle (`DRAFT → PUBLISHED → EXPIRED | ARCHIVED`, BR-GAL-005) next to the project's (BR-PRJ-004). The Owner has to understand both, and the rules that tie them together (publish preconditions, delete-draft vs archive, archive on cancel, selection groups created at first publish). In the Owner's words: "let's remove gallery status, it's too complicated."

Evidence: the gallery status drives about 60 source files (`src/features/gallery/domain/gallery-status/`, publish, archive, delete-draft, expiry, client availability, selection and delivery cards) and the client-access spec's availability rules (BR-ACC-001, A-17, A-23).

## Proposed outcome
- A project that becomes `BOOKED` (created as `BOOKED`, or confirmed from `DRAFT`) already has its gallery, with a generated password and no expiry. *Buat galeri* is gone.
- The project's *Galeri* card asks for one thing: the Drive folder link.
- A gallery has **no status of its own**. Whether a client can open it follows from facts the Owner already controls: the project's status, the expiry, and the password. There is no *Publish*, *Archive* or *Delete draft gallery*.
- The Owner shares the link once a folder is linked. Until they share the link and password, nobody can open the gallery (BR-ACC-001, token + password).

## Decisions (Owner, 2026-10-18)
| # | Question | Decision |
|---|---|---|
| D-1 | Existing `DRAFT` / `ARCHIVED` galleries | No real users yet, so no data compatibility is needed: remove the status outright. Existing rows lose it with the column. |
| D-2 | When *Kirim link galeri* shows | Once the gallery has a linked folder (an active source), even before the sync finishes. |
| D-3 | Closing a gallery by hand | No button. The Owner sets the expiry to today; changing or removing it reopens the gallery. |
| D-4 | Default expiry of an auto-created gallery | None, as today (BR-GAL-005). |
| D-5 | Selection groups | Created with the gallery, at booking (replaces "at first publish", BR-SEL-001, A-23). A client who opens the gallery before any photo arrives sees an empty state (*Photos aren't ready yet*). |
| D-6 | Final delivery's extra condition (A-17, "gallery is `PUBLISHED`") | Dropped. Only BR-DEL-003's checks remain. *Publikasikan hasil akhir* (final delivery) is a separate action and stays. |
| D-7 | Expiry input | Keep both a date and a duration. The duration is a dropdown of presets (7, 14, 30, … days) and counts from the moment the Owner saves it, since there is no publish to count from. |
| D-8 | Projects already booked without a gallery | Agent default (no users yet): the migration creates their galleries, so every `BOOKED`-or-later project has one. |
| D-9 | *Publikasikan hasil akhir* (added in design review) | Removed too. `EDITED` / `PRINT` files are visible to the client as soon as a sync finds them (BR-DEL-002). |
| D-11 | Where the Owner shares the link (added in design review) | A *Kirim link ke klien* button on the project's *Galeri* card and in the gallery page header, besides the project menu (BR-GAL-010). |
| D-10 | How a project reaches `DELIVERED` without that publish | A manual Owner step, *Tandai terkirim*, in the project header like the other status steps; it needs at least one finished file (BR-DEL-003). |

## Affected users and systems
- Owner: *New project* and confirm draft (F-07 `projects`), the project's *Galeri* card and the gallery page (F-09 `gallery`), the project menu's *Kirim link galeri* (F-10).
- Client: the gallery availability check on `/g/{token}` and an empty state for a gallery without photos (F-10 `client-access`).
- Rules to change: BR-GAL-004 (removed), BR-GAL-005 (rewritten: expiry and project status only), BR-GAL-009 (created at booking; no `ARCHIVED`), BR-ACC-001 (no "published"), BR-SEL-001 (groups from booking), BR-PRJ-010 (cancel closes the gallery by derivation), client-access A-17 and A-23. The gallery status is architectural enough for an ADR.
- Dashboard overview (F-26) reads, if any read the gallery status.
- Database: drop `gallery.status` and the publish/archive columns; backfill galleries for booked projects (D-8). Staging shares the database (ADR-027), so deploy the code that stops reading the column before the migration that drops it.
- Seed: `scripts/dev/seed.ts` creates and publishes a gallery; it changes with this. Its gallery step currently also fails with "`headers` was called outside a request scope".

## Constraints
- Client access still needs the project token **and** the current password (BR-ACC-001, ADR-004, ADR-017).
- The password stays required, encrypted and Owner-visible (BR-GAL-002); rotation stays (BR-GAL-003).
- One gallery per project (BR-GAL-001); sync stays Owner-triggered and idempotent (BR-GAL-006, ADR-019 budget).
- Migrations must not break the deployed `staging` code during the rollout (ADR-027, AGENTS.md hard stops).
- Higher-authority rules are changed in the business rules and an ADR, not silently in code.

## Out of scope
- Changing the project lifecycle (`DRAFT → BOOKED → …`, BR-PRJ-004).
- Linking the Drive folder inside *New project* (option B of the walkthrough). This can come later.
- Folder mapping (BR-GAL-007), photo browsing and client selection, apart from where they read the gallery status. Final delivery changes only as D-9 and D-10 say.

## Open questions
- The exact preset list for the duration dropdown (D-7). Proposed: 7, 14, 30, 60, 90 days.
- What the gallery page and the project's *Galeri* card show in place of the status chip: proposed *Kedaluwarsa* when expired, *Ditutup* on a cancelled project, nothing otherwise.
