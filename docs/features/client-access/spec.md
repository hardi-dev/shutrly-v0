# Feature: Client access

ID: F-10 · Slug: `client-access` (F-10 *Client gallery access*, F-11 *Selection*, F-12 *Final delivery* and F-13 *Add-ons* merged, Owner 2026-10-05)
Status: SPECIFIED (2026-10-05) · Intent: [intent.md](intent.md) (ACCEPTED 2026-10-05) · Journeys: J-04 (client half and Owner review), J-05, J-06
Builds on: F-07 `projects` (token, project items, lifecycle), F-09 `gallery` (published gallery, password hash and `passwordVersion`, photo kinds, media route, `contentVersion`)
Consumer: F-14 `billing` (approved add-ons not yet invoiced, BR-ADD-004), F-15 `whatsapp-share` (*Kirim link galeri*, *Ingatkan pilih foto*, *Kirim hasil akhir*)

## Goal
A client who has the project link and the current gallery password can open the gallery, pick the photos the package entitles them to, submit their picks, and later download the finished files from the same link. The Owner reviews and locks picks, grants extra picks through add-ons, publishes final delivery, and can end shared access by rotating the link. Nobody without the link and password learns anything (BR-ACC-*, BR-SEL-*, BR-DEL-*, BR-ADD-*).

## User Stories
- As a client, I want to open my gallery with the link and password my photographer sent, so that I can see my photos privately without creating an account.
- As a client, I want to pick photos for each part of my package and see how many I have left, so that I can submit my choice within what I paid for.
- As a client, I want to download my finished photos one by one, a few at a time, or all at once, so that I get them without asking the photographer.
- As a photographer (Owner), I want to see and lock each client's picks, grant extra picks when the client pays for them, and publish the finished files, so that the whole hand-over happens in one place.
- As a photographer (Owner), I want to replace the gallery link, so that a leaked link stops working.

## Preconditions
- The project has a client access token (BR-PRJ-003, created by F-07).
- For client access: the gallery is `PUBLISHED` and not expired (BR-ACC-001, BR-GAL-005).
- For selection: the project has at least one item with `selectionRequired = true` (BR-SEL-001); otherwise the client only browses.
- For final delivery: the conditions in BR-DEL-003 and A-17.
- Owner actions run behind the Owner session and workspace check (C-101, BR-WS-003).

## Inputs
- **Client:** the token in the URL; the gallery password; a pick or un-pick of a proof photo per group; a quantity per picked photo (`QUANTITY` groups, BR-SEL-003); a submit per group; download choices.
- **Owner:** lock a group; add-on fields (description, optional target group, quantity, unit price); approve or cancel an add-on; publish final delivery; rotate the link.

## Main Flow

### 1. Open the gallery (client)
1. The client opens `/g/{token}`.
2. If the token belongs to a project whose gallery is `PUBLISHED` and not expired, Shutrly shows the password screen with the workspace brand and the project title. Otherwise it shows the neutral unavailable page (Alternative flows).
3. The client enters the password. Shutrly verifies it against the hash, server-side (C-004, ADR-017).
4. On success the client gets a session for this gallery, tied to the token and the current `passwordVersion` (A-1), and lands on the gallery.
5. The gallery shows `PROOF` photos that are not missing or hidden (BR-GAL-006, BR-GAL-009), browsable like the Owner's view (F-09 A-12, A-13; the design decides the client layout, GAP-04). `EDITED` and `PRINT` photos are not shown until final delivery (BR-DEL-002).
6. Images load from Google by file ID or from the controlled media route; no folder link, folder ID, resource key or API key reaches the browser (BR-ACC-005, ADR-019).

### 2. Select (client)
1. If the project has selection groups, the gallery shows each group with *used / effective limit* (BR-SEL-007), for example *Foto edit 12 / 40*.
2. The client picks a proof photo for a group. For a `QUANTITY` group they also set a quantity, starting at 1 (BR-SEL-003, BR-SEL-004).
3. Every pick, un-pick and quantity change is saved at once, checked server-side under a lock on the group (BR-SEL-006, A-7). A change that would exceed the limit is refused with *Batas pilihan tercapai*.
4. A photo may be picked in several groups (BR-SEL-004).
5. The client can filter the gallery to the photos picked in a group.
6. The client submits a group (A-5). After a confirmation, the group becomes `SUBMITTED` and its picks are read-only for everyone (BR-SEL-005).

### 3. Review and lock (Owner)
1. On the project, the Owner sees each group with its status (*Terbuka*, *Dikirim*, *Dikunci*) and *used / effective limit*.
2. The Owner opens a group and sees the picked photos with file name, folder path and quantity, and can copy the list of file names (A-6).
3. The Owner locks a `SUBMITTED` group, or closes an `OPEN` group without submission; both make it `LOCKED` and record actor and time (BR-SEL-005, BR-AUD-001).

### 4. Add-ons (Owner)
1. The client asks for more off-app, for example on WhatsApp (A-4).
2. The Owner creates a `DRAFT` add-on: description, optional target group, quantity, unit price; total = quantity × unit price, computed server-side in the project currency (BR-ADD-001, BR-ADD-002, BR-ADD-006, C-105).
3. The Owner approves it. In one transaction the target group's `extraLimit` grows by the quantity and a `SUBMITTED` group returns to `OPEN` (BR-ADD-004, BR-SEL-002, BR-SEL-005); no invoice line is created until F-14 (BR-ADD-004 amendment). Actor and time are recorded (BR-AUD-001).
4. The client sees the new effective limit the next time the group is loaded (BR-SEL-007). A reopened group keeps its picks; the client adds the extra photos and submits again (A-22).
5. The Owner may cancel a `DRAFT` add-on, or an `APPROVED` one when the reduced limit stays ≥ usage (BR-ADD-003, BR-ADD-005).

### 5. Final delivery
1. The Owner publishes final delivery from the gallery when BR-DEL-003 and A-17 hold. Shutrly records `finalDeliveryPublishedAt` and moves the project to `DELIVERED` in the same transaction (BR-PRJ-004).
2. The same link and password now also show the finished files, by kind (*Edited*, *Print*), excluding missing ones (BR-DEL-001, BR-DEL-002).
3. The client downloads one file, several chosen files, or all finished files (BR-DEL-004). Files are the originals. A bulk download never sends the folder link or folder ID to the browser (BR-ACC-005).
4. Files synced later into `edited` / `print` folders appear for the client after the next sync (A-18).

### 6. Mark the project complete (Owner)
1. On a `DELIVERED` project the Owner chooses *Tandai selesai* and confirms.
2. The project becomes `COMPLETED`, with actor and time recorded (BR-PRJ-005, BR-AUD-001). Invoice state plays no part (BR-PRJ-006); the outstanding-balance warning arrives with F-14 (A-19).
3. The client keeps access while the gallery stays published and not expired (BR-ACC-001).

### 7. Rotate the link (Owner)
1. The Owner chooses *Ganti link* in the client-access area and confirms a warning that every shared link stops working.
2. Shutrly replaces the project token, records actor and time (BR-PRJ-003, BR-AUD-001), and shows the new link.
3. Old links show the neutral unavailable page and existing client sessions end (A-1). The password is unchanged.

## Alternative Flows
- **Wrong password:** *Password salah*, the field keeps focus, and the attempt counts toward the rate limit (BR-ACC-004, A-2).
- **Too many attempts:** *Terlalu banyak percobaan. Coba lagi dalam n menit.*; no password is checked until the window ends (A-2).
- **Password rotated (F-09) while a client is in:** their next request returns to the password screen (BR-GAL-003).
- **Gallery becomes expired, archived or the project is cancelled while a client is in:** their next request shows the neutral unavailable page (BR-GAL-005, BR-PRJ-010).
- **Expired gallery re-opened by the Owner:** the same link and password work again; the client signs in again only if their session ended (BR-GAL-005, A-1).
- **Limit reached:** further picks in that group are refused; un-picking frees a place.
- **Concurrent changes** (two devices, or the Owner lowering a limit): the server's answer wins and the client view refreshes the group (BR-SEL-006).
- **Submitting fewer than the limit:** allowed after a confirmation that names the remaining places (A-5).
- **Project without selection items:** the gallery shows photos only, with no selection controls.
- **Deal edited while `BOOKED`:** groups follow the project items; an edit that would break a group is refused for the Owner (BR-PRJ-009, BR-SEL-001 amendments).
- **Group no longer `OPEN`:** a pick or submit is refused with *Pilihan sudah dikirim* and the view refreshes.
- **A picked photo goes missing:** the pick stays, counts toward usage, and is flagged to the Owner as *Hilang*; the client sees it as unavailable (A-8).

## Error Cases
- **Unavailable gallery:** an unknown token, a `DRAFT`, `EXPIRED` or `ARCHIVED` gallery, a project without a gallery, or a cancelled project all show one neutral page with no project data and the same status code (Owner 2026-10-05, A-3).
- **Rate limit on unknown tokens:** repeated unknown tokens from one address are limited like wrong passwords (A-2).
- **Image fails to load from Google:** it falls back to the media route (ADR-019).
- **Download fails** (file gone from Drive, network): the file is reported as failed with *Coba lagi*; the others continue.
- **Add-on cancel below usage:** refused with the current usage (BR-ADD-005).
- **Final delivery without a finished file, or in a status BR-DEL-003 doesn't allow:** refused with the reason.
- **Server or provider error:** retryable error state (C-007).

## Business Rules
- BR-ACC-001, BR-ACC-003, BR-ACC-004, BR-ACC-005 (BR-ACC-002 invoices: F-14)
- BR-PRJ-003 (token rotation), BR-PRJ-004 (move to `DELIVERED`), BR-PRJ-005, BR-PRJ-006 (manual completion), BR-PRJ-009 (amended: edits guarded by groups), BR-PRJ-010
- BR-GAL-003, BR-GAL-005, BR-GAL-006, BR-GAL-007, BR-GAL-009
- BR-SEL-001 (amended: groups from first publish) … BR-SEL-007
- BR-DEL-001 … BR-DEL-004 (BR-DEL-004 amended: download modes)
- BR-ADD-001 … BR-ADD-006 (BR-ADD-004 amended: invoice line deferred to F-14)
- BR-CAT-002, BR-CAT-007, BR-CAT-010, BR-CAT-011 (whole-number limits; pick mode per definition, amended)
- BR-CUR-001 … BR-CUR-003, BR-PRJ-007 (add-on money)
- BR-AUD-001 (token rotation, selection lock, add-on approval and cancellation)
- BR-WS-002, BR-WS-003 (Owner side)
- Constitution C-004, C-005, C-006, C-007, C-008, C-101, C-103, C-104, C-105

## Dependencies
- F-05 `catalog` (follow-up inside this feature): the item-definition form, seed and `service_item` replace the `EDIT`/`PRINT` selection type with a pick mode (BR-CAT-007, BR-CAT-010, BR-CAT-011); migration maps `EDIT`→`COUNT`, `PRINT`→`QUANTITY`.
- F-07: `project_item` snapshots the pick mode (BR-PRJ-001); `client_access_token` (write-once today; rotation makes it replaceable), project items and status transitions.
- F-09: gallery status and expiry, password hash and `passwordVersion`, photo kinds and missing state, the media route, `contentVersion` (ADR-019 point 5).
- ADR-004 / ADR-017 (token and password), ADR-013 (public endpoints choose their own rate-limit mechanism), ADR-016 (cross-feature transactions: delivery → project status, add-on → group), ADR-018 (Workers Free budget), ADR-019 (images from Google, gallery data cached by `contentVersion`).
- ADR-019 point 5 lists the events that bump `contentVersion`. The client data in this feature also changes on final-delivery publish and token rotation; the technical design adds them, in line with the ADR's purpose (no stale entry is ever read).

## Out of Scope
- Invoices, payments and `/i/{token}/{invoiceId}` (F-14), including putting approved add-ons on an invoice.
- WhatsApp sharing and the project-menu items (F-15).
- Project cancellation (F-07); the outstanding-balance warning on completion (F-14, A-19).
- Client requests for add-ons inside the app (A-4), notifications to the Owner, and comments or favourites on photos.
- Re-opening a group by any means other than an approved add-on, and re-opening a `LOCKED` group (BR-SEL-005).
- Proof downloads; downloads of photos that aren't `EDITED` or `PRINT`.
- Gallery slug (BR-GAL-008); client accounts; providers other than Google Drive.

## Assumptions (low-risk, reversible — confirm or change anytime)
- **A-1 Client session:** an http-only, same-site cookie for this token's path, valid 30 days on that browser. It ends on password rotation (older `passwordVersion`), token rotation, or when the gallery stops being available.
- **A-2 Rate limits:** wrong passwords 5 per 15 minutes per token and address, and 20 per hour per token from any address; unknown tokens 30 per hour per address; selection writes 120 per minute per session. Limits are checked server-side; the mechanism is a technical-design choice (ADR-013).
- **A-3 Neutral page:** an expired gallery shows the same page as a wrong link, with no contact hint (Owner chose one page for every case, 2026-10-05).
- **A-4 Add-on requests:** the client asks off-app; there is no request button.
- **A-5 Submit per group:** each group is submitted on its own, needs at least one pick, and may be submitted below its limit after a confirmation.
- **A-6 Owner review:** the copyable list is one file name per line, with `× n` for print quantities.
- **A-7 Autosave:** every pick change is saved immediately; there is no separate draft or *Simpan* button.
- **A-8 Missing picked photo:** stays selected and counted; the client sees it as unavailable and can un-pick it while the group is `OPEN`.
- **A-9 Quantities:** a print quantity is a whole number from 1 up to the group's remaining places.
- **A-10 Add-on fields:** description 1–100 characters; quantity a whole number ≥ 1; unit price whole IDR ≥ 0. A target group is required for an add-on that adds picks and must be `OPEN` or `SUBMITTED`; a `LOCKED` group can't be targeted (BR-SEL-005). An add-on with no target adds a service only.
- **A-11 Add-on statuses:** add-ons can be created on `BOOKED` … `DELIVERED` projects.
- **A-12 Groups after lock:** a locked group stays visible to the client, read-only, with its picks.
- **A-13 Group names:** a group is named after its project item (for example *Foto edit*, *Foto cetak*).
- **A-14 Selection while expired:** no selection or download while the gallery is expired; picks are kept.
- **A-15 Final delivery and groups:** publishing final delivery does not change group statuses.
- **A-16 Link rotation:** the new token has the same strength and format as the old one (BR-PRJ-003); the old one is never reused.
- **A-17 Final delivery needs a published gallery:** besides BR-DEL-003, the gallery must be `PUBLISHED`, so the client can actually open it.
- **A-18 Later finished files:** files synced into `edited` / `print` after delivery are shown without publishing again.
- **A-20 One group per selection item:** a group is made from a project item with `selectionRequired` and is named after that snapshotted item (BR-PRJ-001), so two items of the same type (for example *Foto edit* and *Foto edit bonus*) are two groups with separate limits. Its pick mode, set by the Owner on the item definition, decides how usage counts: `COUNT` or `QUANTITY` (BR-SEL-003). The unit text (*foto*, *lembar*) is shown beside the limit.
- **A-21 Zero limit:** an item with value 0 yields a group with limit 0 that is shown *0 / 0*, offers no picks, and can't be submitted. An add-on can raise it.
- **A-22 Reopened group:** reopening by an add-on keeps every pick; submitting again follows A-5. Cancelling that add-on later never changes the group's status, only its limit (BR-ADD-005). If the Owner locks a group while an add-on is `DRAFT`, approving it is refused (the target is `LOCKED`).
- **A-23 Groups for galleries published before this feature:** a published gallery with no groups gets them when F-10 is deployed (a backfill in the migration), so it behaves like one published after.
- **A-19 Completion before invoices:** *Tandai selesai* shows no balance warning until F-14 exists; BR-PRJ-005 never blocks on balances anyway.

## Flagged Concerns
Checked against the constitution (C-001..C-106), BR-ACC/SEL/DEL/ADD/PRJ/GAL/CAT/CUR/AUD, ADR-004, -013, -016, -017, -018, -019 and the coding rules' security section.

| ID | Concern | Conflicting sources | Owner decision | Status |
|---|---|---|---|---|
| FC-001 | Approving an add-on must add an invoice line, but invoices are F-14 and not merged here. | BR-ADD-004, BR-ADD-005 ↔ feature map (F-14 separate) | Approval raises the limit now and stores the price on the add-on; F-14 puts approved add-ons on the draft invoice (Owner 2026-10-05). Recorded in BR-ADD-004. | RESOLVED |
| FC-002 | The gallery can be published while the project is `BOOKED`, when the deal is still editable, so limits could change under the client's picks. | BR-PRJ-009 ↔ BR-SEL-001, BR-SEL-003 | Selection starts at publish; groups follow the items; edits that would break a group are refused (Owner 2026-10-05). Recorded in BR-SEL-001 and BR-PRJ-009. | RESOLVED |
| FC-003 | *Download all* could be read against "independent download", and a bulk download must not reveal the folder. | BR-DEL-004 ↔ C-103, BR-ACC-005 | One file, several files or all files; never through the folder link or folder ID (Owner 2026-10-05). Recorded in BR-DEL-004. | RESOLVED |
| FC-004 | The scope merges four features the feature map listed separately. | Feature map F-10..F-13 | Merged into F-10 `client-access` (Owner 2026-10-05). Recorded in the feature map and the intent. | RESOLVED |
| FC-005 | Token rotation was in product scope but owned by no feature. | scope.md, BR-PRJ-003 ↔ F-09 out of scope | Built here, with an audit record (Owner 2026-10-05). | RESOLVED |
| FC-006 | Project completion (old F-12) was left out of the accepted intent, so no feature built it. | Feature map F-12 ↔ intent out of scope | Included here; the balance warning comes with F-14 (Owner 2026-10-05). Intent updated. | RESOLVED |
| FC-007 | Studios want their own selection items, but BR-CAT-007 and scope.md fixed the types to `EDIT` and `PRINT`, and BR-SEL-003 left the other types undefined. | BR-CAT-007, BR-SEL-003, scope.md ↔ product need | Replace the fixed types by a pick mode (`COUNT` / `QUANTITY`) chosen per item definition, built inside F-10 with a catalog follow-up (Owner 2026-10-05). Recorded in BR-CAT-007, -010, -011, BR-PRJ-001, BR-SEL-003, domain model and scope. | RESOLVED |
| FC-008 | A client who submitted and then buys extra picks could not use them: a submitted group never reopens (BR-SEL-005) and add-ons needed an `OPEN` target. | BR-SEL-005, BR-ADD-002, BR-ADD-004 ↔ J-05 | An approved add-on returns a `SUBMITTED` group to `OPEN`; `LOCKED` stays final (Owner 2026-10-05). Recorded in BR-SEL-005, BR-ADD-004 and the domain model. | RESOLVED |

## Open Questions / SPEC GAPS
None blocking. For the technical design:
- **R-1 Original-file downloads by file ID:** BR-ACC-005 allows a server-controlled URL or Google's image host by file ID. Check that the image host serves full-resolution originals, and how *several* and *all* are bundled in the browser (for example a client-side zip or sequential downloads) inside the Workers Free budget (ADR-018). If originals need another Google URL, that is a BR-ACC-005 change for the Owner.
- **R-2 Rate-limit storage and the cache:** where A-2 counters live, and whether Workers Cache API calls count toward the 50-subrequest limit (ADR-019 point 5).
- **R-4 Pick-mode migration:** about 39 files in `src` use `selectionType` (catalog and booking schema, domain, forms, tests). The plan lists them; the migration is safe for other branches on the shared database (add `pick_mode`, backfill, keep the old column until the code stops using it).
- **R-3 Token rotation in code:** `client_access_token` is write-once today (F-07 TD D-6).
- **Carried, not blocking:** GAP-04 client mobile layout (design); the *SELECTION_REMINDER* deadline variable (business-rules, MSG catalogue; F-15).
