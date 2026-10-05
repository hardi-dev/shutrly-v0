# Acceptance Criteria — Client access (F-10)

Assumption references (A-n) point to [spec.md](spec.md#assumptions-low-risk-reversible--confirm-or-change-anytime). UI labels are working copy; the design may rename them.

Shared fixture, used unless an AC says otherwise. The Owner's workspace has:
- project *Wisuda Rina* (`POST_PROCESSING`) with token `T1` and items *Foto edit* (`EDIT`, 3) and *Foto cetak* (`PRINT`, 2);
- its gallery, `PUBLISHED`, no expiry, password *mawar-4821*, with proofs `IMG_001`…`IMG_010`, edited `E_001`, `E_002` and print `P_001`;
- project *Wisuda Sari* (`BOOKED`) in the same workspace with token `T2` and its own published gallery;
- a project in another workspace with token `T3`.

## Access

## AC-ACC-001 — Open the gallery with link and password
Covers: BR-ACC-001, BR-ACC-003, C-104 (A-1)

**Given** a browser with no session
**When** it opens `/g/T1` and enters *mawar-4821*
**Then** the gallery of *Wisuda Rina* opens, showing `IMG_001`…`IMG_010` only, and a reload within 30 days skips the password screen

## AC-ACC-002 — Wrong password
Covers: BR-ACC-001, BR-ACC-004 (A-2)

**Given** the password screen of `/g/T1`
**When** the client enters *mawar-0000*
**Then** *Password salah* is shown, no gallery data is returned, and the attempt is counted

## AC-ACC-003 — Too many wrong passwords
Covers: BR-ACC-004 (A-2)

**Given** 5 wrong passwords for `T1` from one address in 15 minutes
**When** a 6th attempt is made, even with the correct password
**Then** it is refused with *Terlalu banyak percobaan* and the wait time, and the password is not checked

## AC-ACC-004 — One neutral page for every unavailable case
Covers: BR-ACC-001, BR-ACC-003, BR-GAL-005, BR-PRJ-010 (A-3)

**Given** each of: an unknown token; a `DRAFT` gallery; an `EXPIRED` gallery; an `ARCHIVED` gallery; a project with no gallery; a cancelled project
**When** its `/g/{token}` is opened
**Then** every case returns the same page and status code, with no project title, brand, photo or hint of which case applies

## AC-ACC-005 — Unknown tokens are rate-limited
Covers: BR-ACC-004 (A-2)

**Given** 30 requests with unknown tokens from one address within an hour
**When** the next request with any token arrives from that address
**Then** it is refused without looking up the token

## AC-ACC-006 — A session is scoped to one project
Covers: BR-ACC-003, C-104

**Given** a client signed in to `/g/T1`
**When** they open `/g/T2`, or call a client endpoint of `T1` with an id from *Wisuda Sari* or from `T3`'s workspace
**Then** `/g/T2` asks for its own password, and the cross-project request returns nothing of the other project

## AC-ACC-007 — An Owner session grants no client access
Covers: BR-ACC-003

**Given** the Owner signed in to Shutrly, with no client session
**When** they open `/g/T1`
**Then** the password screen is shown, as for anyone else

## AC-ACC-008 — Password rotation ends client sessions
Covers: BR-GAL-003 (A-1)

**Given** a client signed in to `/g/T1`
**When** the Owner rotates the gallery password and the client loads any page or makes a pick
**Then** the client is sent to the password screen, the old password fails and the new one works

## AC-ACC-009 — Rotate the link
Covers: BR-PRJ-003, BR-AUD-001 (A-1, A-16)

**Given** a client signed in to `/g/T1`
**When** the Owner chooses *Ganti link* and confirms
**Then** a new token is stored and shown with the new link, the actor and time are recorded, `/g/T1` shows the neutral page, the client's session ends, and the new link works with *mawar-4821*

## AC-ACC-010 — Expiry while signed in, and re-opening
Covers: BR-GAL-005 (A-14)

**Given** a client signed in to `/g/T1`
**When** the gallery's expiry passes, and later the Owner removes the expiry
**Then** after the expiry the client gets the neutral page, and after re-opening the same link and password work again with all picks kept

## AC-ACC-011 — Only visible proofs before delivery
Covers: BR-DEL-002, BR-GAL-006, BR-GAL-009, BR-ACC-005

**Given** `IMG_010` is missing, a removed source has photo `IMG_099`, and final delivery is not published
**When** the client loads the gallery or its data endpoints
**Then** neither `IMG_010`, `IMG_099`, `E_001`, `E_002` nor `P_001` appears in the page, its JSON or image URLs

## AC-ACC-012 — No secrets in client responses
Covers: BR-ACC-005, C-103

**Given** a signed-in client
**When** any client page, JSON response or redirect is inspected
**Then** it contains no Drive folder link, folder ID, resource key, API key, gallery password, ciphertext or hash, and private responses are `private, no-store`

## AC-ACC-013 — Images load from Google with a fallback
Covers: BR-ACC-005 (ADR-019)

**Given** a signed-in client
**When** a proof image is shown, and when loading it from Google fails
**Then** it loads from Google's image host by file ID, and on failure from the controlled media route, which serves only photos this client may see

## Selection

## AC-SEL-001 — Groups and limits
Covers: BR-SEL-001, BR-SEL-002, BR-SEL-007 (A-13)

**Given** the fixture
**When** the client opens the gallery
**Then** two groups show: *Foto edit 0 / 3* and *Foto cetak 0 / 2*, with no separate add-on figure

## AC-SEL-002 — Pick and un-pick are saved at once
Covers: BR-SEL-004, BR-SEL-006 (A-7)

**Given** *Foto edit* is `OPEN` with no picks
**When** the client picks `IMG_001` and `IMG_002`, reloads, then un-picks `IMG_002`
**Then** after the reload both picks are kept, and after the un-pick the group shows *1 / 3*

## AC-SEL-003 — The limit is enforced server-side
Covers: BR-SEL-003, BR-SEL-006, C-004

**Given** *Foto edit* has 3 picks
**When** the client picks a 4th photo, or sends the request directly
**Then** it is refused with *Batas pilihan tercapai* and usage stays 3

## AC-SEL-004 — Concurrent picks can't exceed the limit
Covers: BR-SEL-006, C-005

**Given** *Foto edit* has 2 picks, open on two devices
**When** both devices pick a different photo at the same moment
**Then** exactly one pick succeeds, the other is refused, and usage is 3

## AC-SEL-005 — Print quantities count toward the limit
Covers: BR-SEL-003, BR-SEL-004 (A-9)

**Given** *Foto cetak* (limit 2) has no picks
**When** the client picks `IMG_003` with quantity 2, then tries `IMG_004`
**Then** usage is *2 / 2* and `IMG_004` is refused; lowering `IMG_003` to 1 allows `IMG_004` with quantity 1

## AC-SEL-006 — Only proofs of this project are selectable
Covers: BR-SEL-004, C-104

**Given** a signed-in client of `T1`
**When** a pick is requested for `E_001`, a missing photo, or a photo of *Wisuda Sari*
**Then** each is refused and nothing is stored

## AC-SEL-007 — A photo in several groups
Covers: BR-SEL-004

**Given** both groups are `OPEN`
**When** the client picks `IMG_005` in *Foto edit* and in *Foto cetak*
**Then** both picks are stored and each group counts it

## AC-SEL-008 — Submit a group
Covers: BR-SEL-005 (A-5)

**Given** *Foto edit* has 2 of 3 picks
**When** the client chooses *Kirim pilihan* and confirms the notice that 1 place remains
**Then** the group is `SUBMITTED`, its picks are read-only, and a later pick, un-pick or second submit is refused with *Pilihan sudah dikirim*

## AC-SEL-009 — Submitting needs a pick
Covers: BR-SEL-005 (A-5)

**Given** *Foto cetak* has no picks
**When** the client tries to submit it
**Then** submit is disabled and a direct request is refused

## AC-SEL-010 — Owner reviews the picks
Covers: BR-SEL-003 (A-6)

**Given** *Foto edit* is `SUBMITTED` with `IMG_001`, `IMG_002` and *Foto cetak* has `IMG_003 × 2`
**When** the Owner opens the groups on the project
**Then** each group shows its status, *used / limit*, and the picked photos with file name and folder path, and *Salin nama file* copies `IMG_001`, `IMG_002` for edit and `IMG_003 × 2` for print

## AC-SEL-011 — Owner locks or closes a group
Covers: BR-SEL-005, BR-AUD-001 (A-12)

**Given** *Foto edit* is `SUBMITTED` and *Foto cetak* is `OPEN`
**When** the Owner locks *Foto edit* and closes *Foto cetak*
**Then** both are `LOCKED` with actor and time recorded, the client sees them read-only with their picks, and no one can reopen them

## AC-SEL-016 — One group per selection item, by type
Covers: BR-SEL-001, BR-SEL-003, BR-CAT-007, BR-CAT-011 (A-20, A-21)

**Given** a project with items *Foto edit* (`COUNT`, 3, *foto*), *Foto edit bonus* (`COUNT`, 2, *foto*), *Foto cetak* (`QUANTITY`, 2, *lembar*), *Bingkai* (`QUANTITY`, 1, *buah*, an item the studio added), *Album* (no selection) and *Foto edit lama* (`COUNT`, 0)
**When** the client opens the gallery
**Then** five groups show, each with its own limit and unit, *Album* gives none, *Foto edit* and *Foto edit bonus* count separately, *Foto cetak* and *Bingkai* sum quantities, and *Foto edit lama* shows *0 / 0* with no picks and no submit

## AC-CAT-001 — A studio adds its own selection item
Covers: BR-CAT-007, BR-CAT-010, BR-CAT-011, BR-PRJ-001, BR-SEL-003

**Given** the workspace has the seeded *Foto edit* (`COUNT`) and *Foto cetak* (`QUANTITY`)
**When** the Owner adds an item definition *Bingkai* (`NUMBER`, unit *buah*, used for client selection, pick mode `QUANTITY`), puts it in a service, and creates a project from it
**Then** the project snapshots *Bingkai* with its pick mode, and its group counts quantities; once a service uses *Bingkai*, its pick mode can no longer be changed

## AC-SEL-012 — No groups, no selection
Covers: BR-SEL-001

**Given** a project with no selection item and a published gallery
**When** the client opens it
**Then** the photos show without any selection control

## AC-SEL-013 — Groups follow deal edits while booked
Covers: BR-SEL-001, BR-PRJ-009

**Given** *Wisuda Sari* (`BOOKED`) has a published gallery and *Foto edit* 3 with 2 picks
**When** the Owner raises *Foto edit* to 5, then tries to lower it to 1, then tries to remove the item, then adds *Foto cetak* 2
**Then** the limit becomes 5; lowering to 1 and removing are refused with the current usage; an `OPEN` *Foto cetak 0 / 2* group appears

## AC-SEL-014 — Edits can't touch a group that isn't open
Covers: BR-PRJ-009, BR-SEL-005

**Given** *Wisuda Sari* is `BOOKED` and its *Foto edit* group is `SUBMITTED`
**When** the Owner changes the *Foto edit* value
**Then** the edit is refused

## AC-SEL-015 — A picked photo goes missing
Covers: BR-GAL-006, BR-SEL-003 (A-8)

**Given** `IMG_001` is picked in *Foto edit*
**When** a sync marks it missing
**Then** the pick stays and still counts, the Owner sees it flagged *Hilang*, and the client sees it as unavailable and may un-pick it while the group is `OPEN`

## Add-ons

## AC-ADD-001 — Create and approve an add-on that adds picks
Covers: BR-ADD-001, BR-ADD-002, BR-ADD-003, BR-ADD-004, BR-ADD-006, BR-SEL-002, BR-AUD-001 (A-10)

**Given** *Foto edit* is `OPEN` with *3 / 3*
**When** the Owner creates *Tambahan 5 foto edit*, target *Foto edit*, quantity 5, unit price Rp 20.000, and approves it
**Then** the add-on total is Rp 100.000, computed server-side; it is `APPROVED` with actor and time; no invoice is created; and the client sees *Foto edit 3 / 8*

## AC-ADD-002 — Target rules
Covers: BR-ADD-002 (A-10)

**Given** *Foto cetak* is `SUBMITTED`, and *Wisuda Sari* has its own groups
**When** the Owner targets *Foto cetak*, or a group of *Wisuda Sari*, from an add-on of *Wisuda Rina*
**Then** both are refused

## AC-ADD-003 — Add-on without a target
Covers: BR-ADD-001, BR-ADD-006 (A-10)

**Given** the fixture
**When** the Owner creates and approves *Album tambahan*, quantity 1, Rp 750.000, with no target
**Then** it is `APPROVED` and no group limit changes

## AC-ADD-004 — Approved add-ons aren't edited
Covers: BR-ADD-003

**Given** an `APPROVED` add-on
**When** the Owner tries to change its target, quantity or price
**Then** it is refused; only cancelling (and creating a new one) is offered

## AC-ADD-005 — Safe cancellation
Covers: BR-ADD-005, BR-AUD-001

**Given** *Foto edit* at *7 / 8* after an approved add-on of 5
**When** the Owner cancels the add-on, then un-picks are made down to 3 and the Owner cancels again
**Then** the first cancel is refused with the usage (7, limit would be 3); the second succeeds, the limit returns to 3, and actor and time are recorded

## AC-ADD-006 — Invalid add-on values
Covers: BR-ADD-006, BR-CUR-001, BR-CUR-003 (A-10)

**Given** the add-on form
**When** the Owner enters quantity 0, a negative price, a decimal rupiah amount, or an empty description
**Then** each is refused server-side with a field error

## Final delivery

## AC-DEL-001 — Publish final delivery
Covers: BR-DEL-003, BR-PRJ-004, BR-DEL-001 (A-17)

**Given** the fixture
**When** the Owner publishes final delivery
**Then** `finalDeliveryPublishedAt` is recorded, the project becomes `DELIVERED` in the same transaction, and the client sees *Edited* (`E_001`, `E_002`) and *Print* (`P_001`) through the same link and password

## AC-DEL-002 — Delivery preconditions
Covers: BR-DEL-003 (A-17)

**Given** a gallery with no synced `EDITED` or `PRINT` file; or a project already `DELIVERED`; or a gallery that is `EXPIRED`
**When** the Owner tries to publish final delivery
**Then** each is refused with its reason and nothing changes

## AC-DEL-003 — Download one, several or all
Covers: BR-DEL-004, BR-ACC-005

**Given** final delivery is published
**When** the client downloads `E_001`, then chooses `E_002` and `P_001` together, then chooses *Unduh semua*
**Then** each download delivers the original files, and no response or URL contains the folder link or folder ID

## AC-DEL-004 — Finished files are independent of proofs
Covers: BR-DEL-002, BR-DEL-004

**Given** final delivery is published
**When** the client views the finished files
**Then** they are never selectable, never count toward a group, and show no link to a proof photo

## AC-DEL-005 — A failed file in a bulk download
Covers: BR-DEL-004, C-007

**Given** `E_002` has been deleted from Drive but not yet synced
**When** the client downloads all
**Then** the other files arrive, `E_002` is reported as failed with *Coba lagi*

## AC-DEL-006 — Files added after delivery
Covers: BR-GAL-006, BR-DEL-002 (A-18)

**Given** final delivery is published
**When** the Owner adds `E_003` to the `edited` folder and syncs
**Then** the client sees `E_003` without another publish

## AC-DEL-007 — Mark the project complete
Covers: BR-PRJ-005, BR-PRJ-006, BR-AUD-001 (A-19)

**Given** *Wisuda Rina* is `DELIVERED`
**When** the Owner chooses *Tandai selesai* and confirms
**Then** the project is `COMPLETED` with actor and time recorded, *Tandai selesai* is not offered on any other status, and the client can still open the gallery while it is published

## Cross-cutting

## AC-ACC-014 — Accessibility and states
Covers: C-007, C-008

**Given** the password screen, gallery, selection and downloads on phone and desktop
**When** they are used with a keyboard and checked with axe
**Then** every control is reachable and labelled, there are no serious axe violations, and loading, empty, error, success and disabled states exist where relevant
