# F-19 Client proof downloads — build notes

Built 2026-10-07 on `feat/client-access` straight from the accepted [intent](intent.md), without spec/AC/Pencil (Owner: "build langsung aja, nanti di catat di akhir"). These notes are that record; the rule lives in BR-DEL-004.

## What it does
- `/g/{token}/photos`: *Unduh ▾* → *Unduh semua* (every visible proof of the gallery, all folders, after a *Unduh semua n foto?* confirm) or *Pilih beberapa*. Each tile has a download button; the viewer has *Unduh foto*. Downloads run one by one with the *Hasil akhir* progress card, *Batalkan* and *Coba lagi*.
- Select mode: *n foto dipilih · Batal · Unduh n foto · Pilih untuk…*. *Pilih untuk…* lists the groups with usage (closed ones disabled) and picks every selected photo at once.
- The per-group pick screen `/g/{token}/picks/{groupId}` is unchanged.

## Rules (Owner 2026-10-07)
- Every visible proof downloads as the original, before and after final delivery; downloads aren't tracked.
- Bulk pick: each new photo × 1 (also in `QUANTITY` groups), photos already picked are skipped, and a selection larger than what is left is refused as a whole (`LIMIT_REACHED` with `remaining`); nothing is written then.

## Code
- `serve-client-file` now serves `isServableToClient` (proofs + delivered finished files).
- `set-picks` use case (group lock, `BULK_PICK_MAX` 500), `list-proof-downloads` (reader `listProofFiles`), actions `setPicksAction`, `listProofDownloadsAction`.
- UI: `use-proof-downloads`, `client-browse-screen/photos-actions`, `photos-status`, grid `downloads` prop, viewer *Unduh foto*; the pick targets handle moved up to the screen. `DownloadProgressCard` is shared with *Hasil akhir*.

## Checks
- Unit/dom: `set-picks` (6), `serve-client-file`, `list-proof-downloads`, `client-browse-screen` + `browse-viewer` (13). Integration: `picks.test.ts` (+3 bulk), `downloads.test.ts` (+proof serving, +listing).
- Browser (dev data): the menu and 48 tile links render; a proof download returns 200 `image/jpeg` as an attachment (the Drive files are complete JPEGs padded with zeros).

## Deviations / open
- No spec, AC or Pencil frames (Owner override); copy marked *built without a Pencil frame*.
- *Unduh semua* on a very large gallery is one browser download per file (as *Hasil akhir*, A-33); no zip.

## Owner change (2026-10-08, manual test, option C)
- Outside select mode the page shows *Unduh ▾* (*Unduh semua*, *Pilih beberapa*) and, while a group is open, **Pilih foto** as the main action. Both open the same select mode.
- In select mode the main action is **Masukkan ke…** (was *Pilih untuk…*); *Unduh n foto* is secondary. Without an open group only *Unduh ▾* shows and *Unduh n foto* is the main action.
