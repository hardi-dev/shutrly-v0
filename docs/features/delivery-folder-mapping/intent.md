# Intent: Map Drive subfolders to package items for final delivery

Author: Owner (hardi-dev), manual test of F-10
Source: FEEDBACK
Status: ACCEPTED (Owner, 2026-10-07; open questions carry into discovery)

## Problem
Finished files are found only in Drive subfolders named exactly `edited` or `print` (BR-GAL-007). Every photographer names folders their own way (`Final`, `Hasil Edit`, `Cetak 4R`…), and anything else is read as a proof, so their finished files never reach *Hasil akhir* and the project can't be delivered without renaming folders on Drive. Evidence: [manual-test-findings.md](../client-access/manual-test-findings.md) #5; the staging example folder has no `edited`/`print` subfolder, so final delivery can't be shown there.

## Proposed outcome
- For each linked Drive folder, the Owner can map its subfolders to the project's package items used for client picks (*Dipakai untuk pilihan foto klien*), for example `Hasil Edit` → *Foto edit*, `Cetak 4R` → *Cetak 4R*. Mapping is optional: the subfolders may not exist yet.
- Photos in a mapped subfolder are finished files for that item; the client sees them per item on *Hasil akhir*.
- The Owner maps when adding the folder and later from the folder's *Edit* (gallery page › *Sumber foto*).
- When a sync finds a subfolder that isn't mapped, the Owner gets a toast, and its photos still show in the gallery grid as proofs.

## Affected users and systems
- Owner: *Tambah folder* / *Buat galeri* folder section, the folder *Edit* dialog (name today, Revision OT Slice 14), the sync result.
- Client: *Hasil akhir* (today split by Edited / Print).
- F-09 gallery: photo classification (BR-GAL-007), photo kinds, sync and counts.
- F-10 client access: final delivery publish and files (BR-DEL-*), selection groups per item (BR-SEL-001).
- F-05 catalog / F-07 projects: package items with *Dipakai untuk pilihan foto klien* (`selectionRequired`, pick mode).

## Constraints
- Owner decisions (2026-10-07): option B (per folder); the items offered are the selection items **in this project's package** only; unmapped subfolders stay proofs; **no name is recognised automatically any more**, including `edited` / `print` (every subfolder is mapped by hand).
- Replaces BR-GAL-007 and touches BR-DEL-001..004; the rules change first (C-011).
- Already stored photos need a re-sync to be reclassified. No transition for published galleries: the app is still in development, there is no production data (Owner, 2026-10-07).
- Drive folder links and IDs stay server-side (C-103); sync stays within the Workers Free budget (ADR-018, ADR-019).

## Out of scope
- Mapping across projects or a workspace-wide naming convention (options A and C, not chosen).
- Matching finished files to their proof photos (BR-DEL-004 stays: finished files are independent).

## Open questions
- ~~What happens to a gallery whose final delivery is already published?~~ Nothing to migrate: still in development (Owner, 2026-10-07).
- ~~What happens to a client pick whose photo becomes a finished file?~~ Nothing: the pick stays as it is, it is the same photo (Owner, 2026-10-07).
- ~~A package with no selection item?~~ Owner (2026-10-07): it always has some, because each workspace is seeded with *Foto edit* and *Foto cetak*. **Still open (found while checking):** those two are seeded as workspace item definitions, not added to every service, and a service can be saved with *Layanan ini belum punya item paket* (seen in the F-10 journeys E2E). Discovery decides whether a project with no selection item gets an empty state or whether services/projects must carry them.
- ~~Can one subfolder map to more than one item?~~ No: one subfolder maps to one item; one item may have several subfolders (Owner, 2026-10-07).
