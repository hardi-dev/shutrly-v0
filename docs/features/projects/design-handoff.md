# F-07 Projects — design handoff (closed)

Read this before you continue `/sdv:design-feature projects`. It records where the design stands, every Owner decision taken during the design review, and how the Pencil file is built, so another agent can continue without the original conversation.

Status: **APPROVED 2026-10-02**: exported, and F-07 is `DESIGNED`. This file is kept as the record of how the Pencil file is built. Earlier status: all states drawn, in review. There are 94 frames: the list, *Proyek baru*, the detail in every status, the dialogs and the toasts. [design.md](design.md) is written and holds the frame index, copy and rule exceptions. What's left: the Owner's approval, ⌘S, the exports and the status change (see *Remaining work*).

## Read first
- [spec.md](spec.md) and [acceptance-criteria.md](acceptance-criteria.md): AC-PRJ-001…030. Both are updated with every decision below.
- `docs/domain/business-rules.md`: BR-PRJ-001, 004, 008–010 and BR-TEAM-002/003 (sessions, new).
- `docs/design-system/token-usage.md` (rules v3.1, APPROVED): cite G1–G8 and SP1–SP11.
- [../clients/design.md](../clients/design.md): the pattern this feature follows (the same shells, table, Section Card, dialogs and sheets). It is also the template for the `design.md` you will write.
- `docs/product/feature-map.md` › *Project menu*: menu items owed by F-10…F-14.

## Pencil file
- File: `docs/features/projects/projects.pen`. Open it with `open -a Pen <abs path>` and use the Pencil MCP only; never read the `.pen` file directly.
- **The library is imported with the prefix `H:`** (not `Y:` as in `clients.pen`). Every library ref and variable is `H:<id>` or `$H:<token>`.
- In `execute`, globals don't survive between calls. To edit inside instances, find nodes with `Get(frameId, visitor, {resolveInstances:true})`, then `Update` or `Replace` the returned `n.id`. Override nodes inside slots can be deleted with `Delete`.
- Recurring warnings about library internals (`H:CykHo`, `H:leQSn`, `H:QcKHK` collapsed and so on) are harmless.
- The Owner saves with ⌘S. Check the size and mtime before committing.

### Library refs used
| What | Ref |
|---|---|
| App Shell (desktop, 1440) / Mobile App Shell (390) | `H:y9uBJl` / `H:c6qPz7` |
| Nav Item active / default (sidebar slot *Proyek* `H:fNszT/H:nHXqh`, *Dasbor* `H:fNszT/H:llfv5`) | `H:CInVy` / `H:K0UQ06` |
| Bottom Nav active / default (slot *Proyek* `H:SpGXb/H:Ryjdm`, *Dasbor* `H:SpGXb/H:uzabE`) | `H:bKADv` / `H:x1Mgr3` |
| Page Header tabs (`H:Sw0yD/H:MST3f/H:aga8t`, `ngkYY`, `BVhm4`): Tab active / default | `H:WbyBE` / `H:M43F7D` |
| Mobile Header / Compact Bar (sub-page; title `H:I0gdll`, parent `H:jbTiE`) | `H:o8T8zb` / `H:J3Ppgp` |
| Table / Row / Cell Text (Primary `H:Q4FlPn`, Secondary `H:m3GsQx`) / Cell Actions / Skeleton row | `H:FCsTI` / `H:r7YZY` / `H:f0oyj` / `H:C1MRI` / `H:eFemy` |
| Segmented Control full width / item active / default | `H:iIcai` / `H:NcbI1` / `H:AptHz` |
| Section Card Default / Compact / Default Flush / Compact Flush | `H:rHONT` / `H:lYGAJ` / `H:G8WO8q` (content `H:f60zS`) / `H:Q82mo` (content `H:AdZ4y`) |
| List Card Item Two-line / Last / Skeleton | `H:PV6HB` / `H:Bf3eg` / `H:ksPQI` |
| Status Chip success / info / warning / danger / accent / neutral | `H:GyfYn` / `H:D7LAk7` / `H:g26Cg6` / `H:l0akB` / `H:h4md7` / `H:w7OAR` |
| Text Field / Error · Select · Multi-select · Combobox · Textarea | `H:HHNPk` / `H:AVpMa` · `H:Wc7hd` · `H:X8ErE9` · `H:CiTrY` · `H:t7L0yL` |
| Button Primary / Secondary / Secondary pending · Icon Button Outline | `H:Q49yf7` / `H:JmfmZ` / `H:iQ7e5` · `H:m9dUlL` |
| Action Menu SM / SM open · Menu · Menu Item / destructive · Group label · Divider | `H:tgN4c` / `H:M3v1E5` · `H:g6dKmz` · `H:iSqRB` / `H:Amnm5` · `H:yNxME` · `H:z7QON` |
| Modal MD · Bottom Sheet Form / Actions · Sheet Item / destructive | `H:f8ym9` · `H:vSBbR` / `H:U0wHw` · `H:FRtU1` / `H:FAObX` |
| Empty State · Checkbox checked / unchecked | `H:H43gDN` · `H:H41tQ` / `H:n8NmOH` |

### Frames
The full frame index is in [design.md](design.md) › *Frames*.
- **Columns:** list at x 0 / 1560; *Proyek baru* at x 2400 / 3960; detail at x 4800 / 6360.
- **Ids:** list/dialog/toast frames start from `QeT50`/`l64V5` (*Proyek baru*) and `X5y4S3`/`hLX50` (detail *Dibooking*).

## Owner decisions taken in the design review (all recorded in spec/AC/domain)
1. **Status chip tones:** *Draf* neutral · *Dibooking* info · *Pemotretan* accent · *Pascaproduksi* warning · *Terkirim* success · *Selesai* success without a dot · *Dibatalkan* neutral.
2. **List table** in the centred 720 column. Columns: PROYEK (fill, about 236: title semibold, at most 2 lines, then *client · service* on 1 line, ellipsis in code) · ACARA 240 · STATUS 124 · ⋯ 32, with **16 px between columns** (`space/4`). The table header has no actions column title.
   - The column gap is a frame-level override (exception to SP5). Proposed library fix: `component/table/column/gap` = `space/4`.
3. **Link:** the whole text of the PROYEK cell links to the detail page; the rest of the row is not a link.
4. **ACARA cell (A-12):** the next session (the earliest from today, or the latest when all are past): *{weekday}, {date} · {start}* with the location below, plus *· +n sesi* when there are more. *Belum ada jadwal* in muted text when the project has none.
5. **Sort (A-4):** *Berjalan* by the shown session's date, earliest first. *Selesai* and *Dibatalkan* latest first. Projects without a session last.
6. **Filter:** an Icon Button Outline (`list-filter`, no text) next to the search. A **red Count Badge** shows the number of active filter groups. It opens Modal MD on desktop and Bottom Sheet Form on phones.
   - Fields: *Status* (Multi-select dropdown with checkboxes, only on *Berjalan*), *Jadwal* (*Dari*–*Sampai* + *Sertakan proyek tanpa jadwal*), *Layanan* (Multi-select), *Klien* (Combobox).
   - Buttons: *Reset* and *Terapkan*.
   - Filters are kept in the URL. There are no filter chips (variant rejected).
7. **Token change (committed `41ea61e`):** `component.icon-button.border` → `border.input`, so it matches the search field. `tokens.css` was regenerated.
8. **Phone:** the list card's *Baru* button is Button **Primary**.
9. **Row menu ⋯** (desktop: Action Menu; phone: Bottom Sheet/Actions with the meta *client · date · status*). The detail page menu has the same items. The order is:
   1. the status step and *Ubah info*;
   2. a divider, then the **KIRIM KE KLIEN** group;
   3. a divider, then the destructive action.

   | Status | F-07 items |
   |---|---|
   | Draf | Konfirmasi booking · Ubah info · *Chat WhatsApp* · Hapus draf |
   | Dibooking | Mulai pemotretan · Ubah info · *Chat WhatsApp* · Batalkan proyek |
   | Pemotretan | Selesai pemotretan · Ubah info · *Chat WhatsApp* · Batalkan proyek |
   | Pascaproduksi, Terkirim | Ubah info · *Chat WhatsApp* |
   | Selesai, Dibatalkan | *Chat WhatsApp* |

   - In F-07, *Chat WhatsApp* is the fallback: a `wa.me/<number>` link with no template. A client without a number gets *Tambah nomor WhatsApp* instead, which opens the F-06 edit dialog.
   - Later features add template items, named after the template they load: *Kirim konfirmasi booking* (planned new type `BOOKING_CONFIRMATION`), *Kirim invoice*, *Ingatkan pembayaran*, *Kirim link galeri*, *Ingatkan pilih foto*, *Kirim hasil akhir*. See the Target boards and feature-map › Project menu.
   - The sheet group label is local (COMPONENT GAP: Bottom Sheet has no group label).
10. **Sessions moved into F-07** (BR-TEAM-003): name (required, ≤ 100), date (required), start and end time (optional, end after start), location (optional, ≤ 200).
    - They **replace the project's event date**.
    - *Buat proyek* and *Konfirmasi booking* need at least one session. A draft may have none.
    - The last session of a `BOOKED`-or-later project can't be deleted.
    - Sessions are editable except in `CANCELLED`.
    - F-08 keeps team, assignments and session status.
11. **Proyek baru layout:** centred 720 column (desktop), Compact Bar + sticky action bar (phone, no Bottom Nav). The cards, in order:
    1. **Klien & layanan** (Combobox, Select with the base price as helper);
    2. **Isi paket** (flush list: items with ⋯ *Ubah nilai* / *Hapus*, and *Tambah item*). Editable before saving (BR-PRJ-001 updated). Changing the service after edits asks *Ganti layanan? Perubahan isi paket akan hilang.*;
    3. **Detail proyek** (*Judul proyek* + *Harga sepakat* on one row on desktop, *Catatan internal*);
    4. **Jadwal** (sessions, flush list with ⋯ and *Tambah sesi*);
    5. **Field booking** (*Semua field tanpa (opsional) wajib diisi, juga untuk draf.*).

    Then *Simpan draf* (secondary) and *Buat proyek* (primary), right-aligned under the form on desktop and half-width each in the phone action bar. Required fields are not marked; optional ones show *(opsional)*.

## Decisions in the second pass (Owner 2026-10-02)
- The detail direction is kept for every status:
  - desktop Page Header: title + Status Chip, a meta line with the next session, the step button and ⋯;
  - phone: Compact Bar with ⋯, and the step button in a sticky bar;
  - cards: *Info* (facts), *Isi paket*, *Jadwal* and *Field booking*.
- No *Field booking* card when the service has no booking fields.
- *Selesai pemotretan* uses `circle-check-big`.
- On desktop, the *Proyek baru* actions sit only under the form.

## Open questions for the Owner
- Copy to confirm: the extra copy in design.md › *Copy* (empty-state bodies, filter description *Berlaku untuk tab Berjalan.*, *Ganti layanan? …*, toasts).

## Remaining work (in order)
1. The Owner reviews and approves the design (design.md › *Approval*).
2. The Owner saves `projects.pen` (⌘S); check the size and mtime before committing.
3. Export the 92 state frames to `exports/` with `Export([id],"html-tailwind",path)` (file name `<state>-<device>-<id>.html`; skip the boards `H0Gs4u` and `eKgbh`).
4. Set F-07 to `DESIGNED` in the feature map, update `docs/HANDOFF.md`, and recommend `/sdv:plan-feature projects`.
