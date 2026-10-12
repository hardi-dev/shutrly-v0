# F-25 Setup checklist — Visual design

Status: APPROVED (Owner 2026-10-12: "approve") · Pencil source: [setup-checklist.pen](setup-checklist.pen) · Rules: [token-usage.md](../../design-system/token-usage.md), APPROVED, so they are binding · Spec: [spec.md](spec.md) · AC: [acceptance-criteria.md](acceptance-criteria.md)

## Direction

- **Exploration (2026-10-12, in this file, since deleted):** A *Guided list* (one card, a row per step), B *Next step first* (large card for the current step plus an *Up next* list), C *Grouped by when it's needed* (timeline plus an *Already set up* list). The Owner chose **A**, then refined it through A1–A5:
  - centered in the content area (desktop also vertically: Owner "keep centered");
  - a done step turns its icon into a green tick with a green *Done* chip;
  - the marker chip sits right after the title;
  - one compact description line per step, all about the same length (copy-deck §4.3a);
  - descriptions one step quieter than titles (`text.muted`);
  - **one button per state**: only the current step has a button; other open steps are whole-row links (A4, chosen over A5 *strict order with Skip*, which needed stored state);
  - on a phone the button sits under the description, sized to its label and left-aligned (option A; right-aligned and in-row versions were tried and dropped).
- **Canvas layout:** desktop at x 0, mobile at x 1520, tablet at x 2080; one state per row, ordered downwards (rows 1060 apart).
- **Language:** frames are in English (the app's default, BR-L10N-001); Indonesian comes from the approved copy-deck rows.

## Library link

- `setup-checklist.pen` imports `design-system.lib.pen` with the prefix **`X:`** (theme axis `X:mode` light/dark). Imported by the Owner on 2026-10-12.
- Checked through MCP on 2026-10-12: 626 variables, equal to `pencil-mapping.json › counts.total`; the worktree library is byte-identical to the main checkout's, so the import can't point at a stale copy.
- Every shell, card, row, chip, button, field and alert is a **linked instance**; nothing is detached. There is no local reusable component. The row changes below are **instance overrides**, kept in this file by Owner decision (2026-10-12: "keep overrides"), not a library variant.

## Screen and state map

| State | Desktop | Mobile | Tablet | Row y | Notes | AC |
|---|---|---|---|---|---|---|
| Dashboard — new workspace | `liGsJ` | `Rbpwx` | `X0t9KY` | 0 | 0 of 4; step 1 current (*Add service*); steps 2–3 locked; step 4 open row link | AC-SETUP-001, AC-SETUP-013, AC-SETUP-020 |
| Dashboard — step 1 done | `u4OTj3` | `eEfVG` | — | 1060 | 1 of 4; step 1 done; step 2 current (*Add package items*); steps 3–4 open row links; desktop shows step 3 in its hover state | AC-SETUP-006, AC-SETUP-012, AC-SETUP-020 |
| Dashboard — only the first project left | `J29pj` | `KsvGt` | — | 2120 | 3 of 4; steps 1, 2, 4 done; step 3 current (*New project*) | AC-SETUP-008, AC-SETUP-014, AC-SETUP-020 |
| New project — no active service | `nUEqD` | `iPdZV` | — | 3180 | Only *Client and service* is drawn: Client combobox, Service field disabled with *No active services yet*, Alert/Info with *Add service*, *Save draft* and *Create project* disabled. The rest of the page is unchanged F-07 design | AC-SETUP-016 |

Not drawn, on purpose:
- **After the first project:** the dashboard returns to today's placeholder; its design is F-02 `workspace.pen` › Dashboard empty state (`gCkJa` / `K6WCRa`). *(Superseded by F-26 [dashboard-overview](../dashboard-overview/spec.md), Owner 2026-10-13: after the first project the dashboard shows the overview, without* Set up branding*.)*
- **Loading / error:** server-rendered page with the existing route loading UI and owner error handling (spec E1); no checklist-specific state.
- **Dark mode, focus rings:** follow the library tokens and components; not drawn separately (GAP-01).

## Component usage

| Library component | Variant (ID) | Used in | Overrides |
|---|---|---|---|
| App Shell (C30) | `X:y9uBJl` | D1–D4 | Sidebar labels in English, workspace *Explore Studio*, nav count badges off; Page Header breadcrumb/title/subtitle; hero action off; Toast and Overlay off. D4: *Projects* nav item active |
| App Shell/Tablet | `X:lQnS8` | T1 | Same header overrides; rail count badges off |
| Mobile App Shell (C35) | `X:c6qPz7` | M1–M4 | Mobile Header pill/title/subtitle; Bottom Nav tabs in English (*Dashboard* active, M4 *Projects*); content slot = canvas sheet (`surface.canvas`, top corners `panel.app.radius`, padding `space.5`/`space.4`) |
| Section Card/Default/Flush · Compact/Flush (C43) | `X:G8WO8q` · `X:Q82mo` | checklist card (720 desktop/tablet, full width phone) | Title, description; Actions slot = progress text (`text.secondary`, body-sm semibold) |
| Section Card/Default · Compact | `X:rHONT` · `X:lYGAJ` | *Client and service* (D4/M4) | Description off |
| List Card Item/Two-line · /Last (C42) | `X:PV6HB` · `X:Bf3eg` | every step row | see *Row overrides* |
| Status Chip (C12) | Warning `X:g26Cg6` *Required* · Info `X:D7LAk7` *Recommended* · Neutral `X:w7OAR` *Optional* · Success `X:GyfYn` *Done* | marker after the title | label |
| Button/Primary/MD/Default (C01) | `X:Q49yf7` | the current step's button | label; phone: hugs its label |
| Combobox/Default · Select/Disabled | `X:CiTrY` · `X:umHpv` | D4/M4 | labels, placeholder/value, helper off |
| Alert/Info (C24) | `X:S5bhVn` | D4/M4 no-service alert | icon `info`, title, body, action *Add service* on |
| Button/Secondary·Primary MD/LG Disabled | `X:iQ7e5` `X:lBKcT` `X:nqNHl` `X:V8sGx` | D4/M4 form actions | labels |

### Row overrides (List Card two-line row)

| Part | Current / open | Done | Locked |
|---|---|---|---|
| Icon well `c4tOj9` | library default | fill `status.success.bg` | library default |
| Icon `wDTkG` | step icon (briefcase, list-checks, folder-plus, badge-check) | `check`, `status.success.fg` | `lock`, `text.muted` |
| Title `O7pUR` | replaced by *Title row* (title + chip, gap `space.2`); title `text.primary` | title `text.secondary` | title `text.secondary` |
| Description `k9OCFf` | `text.muted` | `text.muted` | locked hint, `text.muted` |
| Trailing slot `zUF3j` | current: Button Primary MD; open: chevron-right 16 `text.muted` | empty | empty |

Desktop/tablet Trailing has a fixed height of 42 (the MD button's height) so every row is the same height whether or not it has a button. On a phone the current row is wrapped in a *Current step* frame: the row (Last variant, no separator) plus an *Action row* with the button.

## Token-usage exceptions

| Rule | Where | Why | Status |
|---|---|---|---|
| G3 (component tokens inside components) | Row description `text.muted` instead of `list-card` meta token; done icon well `status.success.bg` and icon `status.success.fg` instead of `list-card.item.icon-*` | The design needs a quieter description and a success state the List Card has no token for; kept as overrides by Owner decision instead of a library variant | Accepted (Owner 2026-10-12, "keep overrides") |
| T3 (`text.muted` only for non-essential text) | Row descriptions | One-line helper text ≥ 13 px; the title and chip carry the meaning; neutral 500 on panel ≈ 4.8:1 (light), neutral 400 on neutral 850 (dark) — re-measure at verify | Accepted |
| SP1 (4 px scale) | Phone *Action row* left padding 60 | Aligns the button with the title: row padding 12 + icon well 36 + gap 12; a sum of tokens, not an invented value | Accepted |

No `DESIGN TOKEN GAP`; no new token or component.

## Copy

All text is from [copy-deck.md](../bilingual-copy-revamp/copy-deck.md) §4.3a, approved by the Owner on 2026-10-12 (step bodies and locked hint rewritten compact for this design, Codex option 2, terms in lower case, *kamu*). *Explore Studio* stands for `{workspaceName}`. D4/M4 use the existing §7.2 rows plus the two §7.2 replacements in §4.3a.

## Exports

Exported through the Pencil MCP (`Export`, `html-tailwind`) on 2026-10-12 into [exports/](exports/), one file per frame, named `<screen>-<state>-<device>-<frameId>.html`: 9 files, 674 KB. [exports/INDEX.md](exports/INDEX.md) is generated by `python3 scripts/sdv/index-exports.py setup-checklist` (no unmatched files); rerun it after any re-export (`--check` exits 1 when it is out of date).

## Saves

- 2026-10-12 17:35 — `setup-checklist.pen` 124,801 bytes after the copy update (Owner ⌘S).

## Approval

APPROVED by the Owner on 2026-10-12 ("approve"), with the decisions: keep the desktop card centered, sync the spec to the design, keep the row changes as overrides, phone button left-aligned. Feature map: `DESIGNED`.
