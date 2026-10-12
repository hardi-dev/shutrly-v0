# F-08 Team — design

> Localization amendment (Owner 2026-10-06): [product policy](../../product/localization.md), BR-L10N-* and [ADR-025](../../architecture/decisions/ADR-025-next-intl-bilingual-localization.md) supersede language-only instructions in this document. English is the default; EN/ID switching and complete localized copy are required. Earlier Indonesian labels/defaults remain reference examples, not an approved single-language implementation. Feature business behavior is unchanged. Update reviewed copy and approved Pencil exports before implementation; legacy data and recipient-language policies remain pending.

- **Pencil file:** [team-sessions.pen](team-sessions.pen), created from the `feature-consumer.pen` template.
  - It imports `design-system.lib.pen`, and Pen registered the import with the prefix **`m:`**, not `H:` as in `projects.pen`. Every library ref and variable is `m:<id>` / `$m:<token>`.
  - The library link is live: 597 variables, the same count as the library.
- **Rules:** `docs/design-system/token-usage.md` v3.1 (APPROVED).
- **Direction:** the F-07 project detail (App Shell C30 / Mobile App Shell C35, Section Card C43, List Card Item/Two-line C42), extended in the *Jadwal* card.
  - The two base frames are rebuilt from F-07's *Dibooking* detail (`X5y4S3` / `hLX50` in `projects.pen`), with `H:` mapped to `m:`.
  - Every state frame is a copy of a base frame. A dialog sits in the App Shell *Overlay* layer and a toast in its *Toast* layer, as in F-07.
- **Status:** **APPROVED 2026-10-03** (Owner). There are 48 HTML exports in [`exports/`](exports/), one frame per file (`<area>-<state>-<device>-<frameId>.html`, html-tailwind). The board `Yx7xX` isn't exported.

## Decision log (Owner, 2026-10-03)

Each decision is recorded in the spec, AC and domain as noted.

1. **Exploration:** three *Jadwal* options were drawn on the board *Eksplorasi / Jadwal & tim* (`Yx7xX`):
   - A, the team listed under each session;
   - B, a compact *Jadwal* plus a separate *Tim & honor* card;
   - C, Jira-style child issues with a progress bar and lozenges.

   The Owner kept **B** for discussion and removed A and C.
2. **No money on the project page**, then **no money in F-08 at all.**
   - Rates, fees and paid / unpaid tracking moved to a new TODO feature, F-18 *Team fees*, and BR-TEAM-007 is deprecated.
   - The member detail page went too, since it only existed for payments (spec A-1, AC-TEAM-012/016–019/025 removed).
3. **No separate *Tim* card.** *Jadwal* shows only an **avatar group** per session: at most 3 initials avatars (Avatar/SM with a `surface/panel` ring), then a *+n* overflow chip.
4. **No team yet:** the session shows an **Icon Button/Ghost/SM `user-plus`**, the same component and size as the ⋯ trigger.
   - The Owner asked for the existing icon buttons to be checked first. Ghost/SM (32 × 32, row actions) fits; Outline/MD (40) is too big for a list row.
5. ***Atur tim*** (Modal MD / Bottom Sheet/Form) manages one session's team: *Tim · {session}*, the session's date, times and location, then member rows (avatar, name, role) with *Tambah anggota* and *Selesai*.
6. **Row action is a delete button, not ⋯.** Each row has Icon Button/Ghost/SM `trash-2`, with the icon in `color/semantic/status/danger/fg`.
   - Assignments are never edited: to change a role, the Owner removes the member and adds them again (BR-TEAM-006; AC-TEAM-014, AC-TEAM-024 removed).
7. **No empty *Atur tim*.**
   - A session without a team opens the Penugasan form directly, from the `user-plus` button or ⋯ › **Tambah tim**.
   - A session with a team shows ⋯ › **Atur tim** (and the avatar group opens it too).
   - Removing the last member closes *Atur tim* (spec A-12; AC-TEAM-011/014/026).
8. **Session ⋯ menu:** *Tambah tim* or *Atur tim*, then *Ubah sesi*, a divider, and *Hapus sesi*. On desktop the open menu is drawn opening upward, so the card doesn't clip it and the next card doesn't cover it. In code it is a portal.

## Frames

Rows stack top to bottom with 160 between them. Desktop frames are at x 0 (1440 wide) and phone frames at x 1560 (390 wide). Page frames are as tall as their content; dialog, sheet and toast frames are one viewport (1024 / 844).

| State | Desktop | Phone | AC |
|---|---|---|---|
| Detail *Dibooking*, *Jadwal* with an avatar group (*Wisuda*: DP, SL, JS, +1) and `user-plus` (*Foto keluarga*) | `syjCy` | `f1QAD` | AC-TEAM-026 |
| Session ⋯, session with a team (*Atur tim*) | `zYlB9` | `AqTCk` | AC-TEAM-011, 026 |
| Session ⋯, session without a team (*Tambah tim*) | `v0fmfB` | `gbaf4` | AC-TEAM-011 |
| *Atur tim*, populated (`trash-2` rows) | `dnXdG` | `HhdMX` | AC-TEAM-014, 026 |
| Penugasan form *Tambah anggota · Wisuda* (Anggota, Peran) | `K5CBQ6` | `X06qm5` | AC-TEAM-011, 013 |
| Penugasan form, no active members: Empty State `m:H43gDN` (`users`, *Belum ada anggota tim aktif*, Secondary *Buka Tim* `user-round-cog`), the same pattern as F-07 *Proyek / List / Empty Aktif* (`tHeNM`); *Tambah* disabled | `v04DP` | `QINZH` | spec › No members yet |
| *Hapus dari sesi* confirm (Modal SM, Danger / Bottom Sheet/Actions) | `uJjME` | `HUoRy` | AC-TEAM-014 |
| *Hapus sesi* with a team (*Sesi ini punya 2 anggota tim…*) | `HCBUs` | `VrrVd` | AC-TEAM-020 |
| Cancelled project, *Atur tim* read-only | `aspbw` | `vCcGo` | AC-TEAM-015 |
| Toast *Anggota ditambahkan* | `ccSTz` | `Wvb0o` | AC-TEAM-011 |
| Board: exploration, Opsi B3 and the session menu | `Yx7xX` | — | — |

### Tim (`/team`, `/team/archived`, `/team/roles`)

The pattern follows F-06 *Klien*:
- **Desktop:** the library Table in the centred 720 column, with a toolbar (*Daftar anggota* + count on the left, search 320 on the right). The Page Header tabs are **Aktif · Arsip · Peran** (C45, like F-05 *Layanan · Kategori · Item paket*).
- **Table footer:** the footer (`m:S43GJ`, top border, *Muat lebih banyak*) is hidden whenever nothing more can load: in every drawn table, and in the empty, no-match and loading states. Otherwise it leaves an empty bordered strip under the list (Owner review 2026-10-03). In code, render the footer only while there's a next page.
- **Phone:** Mobile Header *Tim*, then Segmented Control/Full width *Aktif · Arsip · Peran*, the search, and a Section Card/Compact/Flush list. *Tim* isn't in the bottom nav (spec A-1), so no tab is active.

| State | Desktop | Phone | AC |
|---|---|---|---|
| *Aktif*, 8 members. Desktop columns ANGGOTA (fill) · WHATSAPP 184 · PERAN 200 · ⋯ 32; phone meta is the roles | `R4JLbp` | `QsBVq` | AC-TEAM-001 |
| Row menu: *Ubah*, *Buka WhatsApp*, *Arsipkan*, *Hapus*. Desktop Action Menu opening upward; phone Bottom Sheet/Actions | `ICyJY` | `dizJ5` | AC-TEAM-007 |
| *Arsip* (*Budi Hartono*, *1 anggota diarsipkan*) | `zvKkW` | `jyy96` | AC-TEAM-002 |
| Empty *Aktif*: Empty State `users`, *Belum ada anggota tim* + *Tambah anggota* | `XHPVx` | `sml7R` | AC-TEAM-002 |
| No match (*zzz*): Empty State `search-x` + *Hapus pencarian* | `X0OsOw` | `FHTJ2` | AC-TEAM-003 |
| Loading (skeleton rows, count hidden) | `Hz8cz` | `FfYa6` | C-007 |
| *Peran*: PERAN (fill) · DIPAKAI 184 (*3 anggota* / *Belum dipakai*) · ⋯; no search; hero action *Tambah peran* | `b1DnTm` | `aNkc0` | AC-TEAM-008, 009 |
| Member form *Tambah anggota*: Nama, Nomor WhatsApp (hint), Email (opsional), Peran (Multi-select) | `av9sE` | `r5IYX` | AC-TEAM-004 |
| Member form errors (empty name, number taken by an archived member, invalid email, no role) | `Y1tZB` | `wpnMB` | AC-TEAM-005, 006 |
| Member form, Peran open with *Tambah peran baru* (dropdown opening upward) | `THBBh` | `ZxAYa` | AC-TEAM-010 |
| *Tambah peran*, duplicate (*Peran ini sudah ada.*) | `JYIKq` | `zpgoX` | AC-TEAM-009 |
| *Hapus peran* blocked (*Peran ini masih dipakai 3 anggota.*) | `I8yro` | `YbB7p` | AC-TEAM-009 |
| *Hapus anggota* blocked (*Anggota ini punya penugasan. Arsipkan saja.*) | `sKwuK` | `e127GO` | AC-TEAM-007 |
| Toast *Dimas Pratama diarsipkan* + *Batalkan* | `Q8V2f` | `Z9dfx` | AC-TEAM-007 |

**Not drawn; the spec defines them:**
- the edit member form (*Ubah anggota*, same form, prefilled);
- the plain delete confirmations (F-06 pattern);
- the *Pulihkan* menu (*Arsip* row);
- the other toasts (Toast/Success);
- loading more (F-06 pattern).

## Components and tokens

- **Library (`m:`), all linked instances:**
  - App Shell `m:y9uBJl` / Mobile App Shell `m:c6qPz7`, Compact Bar `m:J3Ppgp`;
  - Section Card Default `m:rHONT`, Compact `m:lYGAJ`, Default/Flush `m:G8WO8q`, Compact/Flush `m:Q82mo`;
  - List Card Item/Two-line `m:PV6HB` / Last `m:Bf3eg`;
  - Avatar/SM `m:PO3yR` (*Jadwal*) / MD `m:N7uFQ` (*Atur tim*);
  - Icon Button/Ghost/SM `m:VA96y` (`user-plus`, `trash-2`);
  - Action Menu SM `m:tgN4c` / SM Open `m:M3v1E5`, Menu `m:g6dKmz`, Menu Item, Menu Divider;
  - Modal MD `m:f8ym9` / SM `m:cdSbf`, Bottom Sheet/Form `m:vSBbR` / Actions `m:U0wHw`, Sheet Item Default / Destructive;
  - Select `m:Wc7hd` (override paths go through `m:Et1pR/…`; input parts through `m:c67yIW/…`);
  - Empty State `m:H43gDN`;
  - Buttons Primary / Secondary / Danger and their LG and Disabled variants;
  - Status Chip Info / Neutral;
  - Toast/Success `m:QCuMb`.
- **Library, Tim pages:** Table `m:FCsTI` with rows `m:r7YZY`, cells `m:lVDvO` / `m:f0oyj` / `m:f7pbaS` / `m:C1MRI` and skeleton `m:eFemy`; Input `m:lJ39W`; Text Field `m:HHNPk` / Error `m:AVpMa`; Multi-select `m:X8ErE9` / Open `m:q4NjNG` / Error `m:ny8DD`; Segmented Control/Full width `m:iIcai`; Tabs `m:WbyBE` / `m:M43F7D`; Mobile Header `m:o8T8zb`; List Card skeletons `m:ksPQI` / `m:KKvqb`.
- **Local compositions:**
  - the avatar group (overlapping Avatar/SM with a 2 px `surface/panel` ring, gap −6) and its *+n* chip (`surface/sunken`, caption semibold);
  - the *Atur tim* member row;
  - the cancelled note.

## Rule notes and gaps

- **COMPONENT GAP — Icon Button danger:** Icon Button has no danger variant. The `trash-2` icon fill is overridden per instance with the semantic `color/semantic/status/danger/fg`. If other features need it, promote an Icon Button/Ghost/SM/Danger variant (`component/icon-button/danger/icon`).
- **COMPONENT GAP — Avatar group:** the library has a single Avatar only. The group is a local composition. Promote an Avatar Group (max, overflow) if F-09+ needs it.
- **COMPONENT GAP — Sheet Item disabled:** carried over from F-06/F-07; not used now that paid states are gone.
- **Literal sizes** (they can't bind in Pencil): the avatar overlap (−6), the ring (2), the overflow chip (24 × 24), open-menu offsets (menus drawn upward), the container 720, the search 320, and the columns 184 / 200 / 32.
- **Scan (all 48 frames, 2026-10-03):**
  - 0 raw colours.
  - The only fully clipped nodes are intentional: open menus that overflow their trigger, the hidden Page Header tabs on the project detail, and cards below the fold in viewport-tall dialog frames.
- **Not drawn, defined in the spec:** the desktop avatar tooltip *{name} · {role}* (library Tooltip); the assignment-removed toast (Toast/Success pattern); a form opened from *Tambah tim* (same form, title *Tambah anggota · {session}*).

## Approval

APPROVED by the Owner on 2026-10-03, with the instruction *"lanjut 1 & 2"*: export the frames and set the status.

Evidence:
- `team-sessions.pen` saved by the Owner (⌘S, 1,297,910 bytes, 04:25);
- 48 frames (24 states × desktop + phone);
- 0 raw colours, and only intentional clipping;
- exports in `exports/*.html`: 48 files, each checked to hold exactly one frame.

Next: `/sdv:plan-feature team-sessions`.
