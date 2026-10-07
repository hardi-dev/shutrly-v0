# Intent: Client proof downloads and bulk picks on *Semua foto*

Author: Owner (hardi-dev), manual test of F-10
Source: FEEDBACK
Status: DRAFT (written 2026-10-07 from the Owner's answers in finding #6; only the Owner sets ACCEPTED)

## Problem
On the client's *Semua foto* page (`/g/{token}/photos`) a client can only look at the proof photos. They can't download any of them, not even the ones they like, while *Hasil akhir* lets them download finished files one by one, several at once, or all. They also have to open each photo in the viewer and use *Pilih untuk…* one at a time to pick it for a group; there is no way to select several photos in the grid and pick them in one go. Evidence: [manual-test-findings.md](../client-access/manual-test-findings.md) #6.

## Proposed outcome
- On *Semua foto* the client can download proof photos the way they download finished files: one from a tile or the preview, the photos they selected, or all photos. Files are the originals.
- The grid has a select mode. With photos selected, the client can download them or use *Pilih untuk…* (the same choices as in the viewer) to pick all of them for one group at once.
- The per-group pick screen (`/g/{token}/picks/{groupId}`) stays as it is; select mode is a second way to pick.

## Affected users and systems
- Client: *Semua foto* grid, the photo viewer, the download progress card and failures (reused from *Hasil akhir*).
- F-10 client access: the download route (today only delivered `EDITED`/`PRINT` files), the pick writes (`set-pick`) and their limits.
- F-09 gallery: proof photos and their originals on Drive.

## Constraints
- Owner decisions (2026-10-07): every proof photo may be downloaded, always the **original**; there is no per-gallery switch; a bulk *Pilih untuk…* adds each photo × 1 in a `QUANTITY` group; a selection larger than the group's remaining limit is **refused as a whole**.
- Changes today's rules: client-access spec › Out of scope lists *Proof downloads*, and BR-DEL-002/004 cover finished files only. The spec and BR-DEL-* (or a new BR) change first (C-011).
- Downloads never expose the Drive folder link or folder ID (BR-ACC-005, C-103); only a signed-in client of this project's published, non-expired gallery may download (BR-ACC-001, C-104).
- Picks keep their rules: proof photos only (BR-SEL-004), within the group's limit in one locked transaction (BR-SEL-006, C-005), only while the group is `OPEN` (BR-SEL-005).
- Workers Free budget (ADR-018): bulk download stays a sequence of single-file downloads, as on *Hasil akhir* (A-33).

## Out of scope
- A zip of many files; watermarks; reduced-size proof downloads.
- Changing the per-group pick screen or the review (*Tinjau*) flow.

## Open questions
- Does downloading count as an action the Owner sees (a log, a count)? Not asked yet.
- Should proof downloads stop once final delivery is published, or stay available? Not asked yet.
