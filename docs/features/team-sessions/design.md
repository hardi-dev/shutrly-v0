# F-08 Team — design

- **Pencil file:** [team-sessions.pen](team-sessions.pen), created from the `feature-consumer.pen` template.
  - It imports `design-system.lib.pen`, and Pen registered the import with the prefix **`m:`**, not `H:` as in `projects.pen`. Every library ref and variable is `m:<id>` / `$m:<token>`.
  - The library link is live: 597 variables, the same count as the library.
- **Rules:** `docs/design-system/token-usage.md` v3.1 (APPROVED).
- **Direction:** the F-07 project detail (App Shell C30 / Mobile App Shell C35, Section Card C43, List Card Item/Two-line C42), extended in the *Jadwal* card.
  - The two base frames are rebuilt from F-07's *Dibooking* detail (`X5y4S3` / `hLX50` in `projects.pen`), with `H:` mapped to `m:`.
  - Every state frame is a copy of a base frame. A dialog sits in the App Shell *Overlay* layer and a toast in its *Toast* layer, as in F-07.
- **Status:** **IN PROGRESS**. The project-detail part is drawn and reviewed with the Owner. The *Tim* pages (*Anggota*, *Peran*, member dialog) aren't drawn yet. Not approved, no exports yet.

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
| Penugasan form, no active members (Alert/Info + *Buka Tim*, *Tambah* disabled) | `v04DP` | `QINZH` | spec › No members yet |
| *Hapus dari sesi* confirm (Modal SM, Danger / Bottom Sheet/Actions) | `uJjME` | `HUoRy` | AC-TEAM-014 |
| *Hapus sesi* with a team (*Sesi ini punya 2 anggota tim…*) | `HCBUs` | `VrrVd` | AC-TEAM-020 |
| Cancelled project, *Atur tim* read-only | `aspbw` | `vCcGo` | AC-TEAM-015 |
| Toast *Anggota ditambahkan* | `ccSTz` | `Wvb0o` | AC-TEAM-011 |
| Board: exploration, Opsi B3 and the session menu | `Yx7xX` | — | — |

**Still to draw:**
- *Tim* › *Anggota*: populated, *Arsip*, empty, no match, loading, row menu;
- *Tim* › *Peran*: list, role dialog with an error, delete blocked;
- the member dialog: default, several roles, errors, inline role;
- the member toasts.

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
  - Alert/Info `m:S5bhVn`, Empty State `m:H43gDN`;
  - Buttons Primary / Secondary / Danger and their LG and Disabled variants;
  - Status Chip Info / Neutral;
  - Toast/Success `m:QCuMb`.
- **Local compositions:**
  - the avatar group (overlapping Avatar/SM with a 2 px `surface/panel` ring, gap −6) and its *+n* chip (`surface/sunken`, caption semibold);
  - the *Atur tim* member row;
  - the cancelled note.

## Rule notes and gaps

- **COMPONENT GAP — Icon Button danger:** Icon Button has no danger variant. The `trash-2` icon fill is overridden per instance with the semantic `color/semantic/status/danger/fg`. If other features need it, promote an Icon Button/Ghost/SM/Danger variant (`component/icon-button/danger/icon`).
- **COMPONENT GAP — Avatar group:** the library has a single Avatar only. The group is a local composition. Promote an Avatar Group (max, overflow) if F-09+ needs it.
- **COMPONENT GAP — Sheet Item disabled:** carried over from F-06/F-07; not used now that paid states are gone.
- **Literal sizes** (they can't bind in Pencil): the avatar overlap (−6), the ring (2), the overflow chip (24 × 24), the open-menu offset (−129), and the container 720.
- **Not drawn, defined in the spec:** the desktop avatar tooltip *{name} · {role}* (library Tooltip); the assignment-removed toast (Toast/Success pattern); a form opened from *Tambah tim* (same form, title *Tambah anggota · {session}*).

## Approval

Not approved yet. Remaining:
1. draw the *Tim* pages;
2. complete this record and get the Owner's approval;
3. the Owner saves (⌘S), then the HTML exports go to `exports/`;
4. set `DESIGNED`, then run `/sdv:plan-feature team-sessions`.
