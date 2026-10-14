# F-26 Dashboard overview — Visual design

Status: APPROVED (Owner 2026-10-15: "approve, use Active projects as title") · Pencil source: [dashboard-overview.pen](dashboard-overview.pen) · Rules: [token-usage.md](../../design-system/token-usage.md), APPROVED, so they are binding · Spec: [spec.md](spec.md) · AC: [acceptance-criteria.md](acceptance-criteria.md)

## Direction

- **Starting point (2026-10-14):** the Owner's own plan in the design library, C30 *App shell · 1920* (greeting, metric tiles, *Booking & Produksi* table), chosen over a four-summary draft (*Needs you*, *Upcoming sessions*, *Projects by status*, *Galleries expiring soon*) and two other layouts. The money tiles and the turnaround tile were replaced by counts the schema can answer.
- **Decisions on the canvas (Owner, 2026-10-14):**
  - tiles in lifecycle order: *New projects*, *To review*, *In editing*, *Delivered*; labels fit one line; no period caption;
  - trend badge and 7-month sparkline on the two monthly tiles; a ring on the two live tiles (chosen over a split bar, age bars and a shoot-date split);
  - table: project and client, next session, status, agreed price, ⋯ (the project list's menu, reused); no *Service* column; no tabs; 10 rows; the project list's search and filter in the header;
  - *New project* in the page header; no greeting; subtitle from the copy deck;
  - content in the 720 centered column (`size.content-narrow`), chosen over the full 1096 container.
- **Explored and set aside (2026-10-15):** four layouts around one Owner question each (*Next up*, *This week*, *Pipeline*, *Message clients*) and four *This week* alternatives. Kept on the canvas for later: `lFjsS` *Explore (kept for later): Day strip with crew* (session place and crew from `session_assignment`). It is not part of this design.
- **Canvas layout:** desktop at x 0, mobile at x 1540, tablet at x 2030; one state per row, ordered downwards (rows 1700 apart).
- **Language:** frames are in English (the app's default, BR-L10N-001); Indonesian comes from the copy-deck rows.
- **antislop** (Owner's choice for this session: *during*): every value on the canvas maps to a stored field, sample names are fixtures, and the em dash is not used in UI text (*No sessions scheduled* replaced it).

## Library link

- `dashboard-overview.pen` imports `design-system.lib.pen` with the prefix **`d:`** (theme axis `d:mode` light/dark). Imported by the Owner on 2026-10-14.
- Checked through MCP on 2026-10-14: 626 variables, equal to `pencil-mapping.json › counts.total`; the worktree library is byte-identical to the main checkout's, so the import cannot point at a stale copy.
- Every shell, header, card, tile, table part, row, chip, button, field, empty state and sheet is a **linked instance**; nothing is detached. The only feature-local element is the ring (see *Token-usage exceptions*). There is no local reusable component.

## Screen and state map

| State | Desktop | Mobile | Tablet | Row y | Notes | AC |
|---|---|---|---|---|---|---|
| Overview — default | `fvbbu` | `fkrDj` | `fC7eZ` | 0 | Four tiles; table with 10 of 15 active projects, ordered by next session; search and filter empty | AC-DASH-001, 021–027, 033–035 |
| Overview — row menu open | `EhUPe` | `aoGYG` | — | 1700 | *Wedding Tari & Yoga* (`BOOKED`): *Start shoot*, *Edit project info*, *Send to client* › *Chat on WhatsApp*, *Cancel project*. Desktop: Action Menu opening upward; phone: Bottom Sheet/Actions | AC-DASH-030 |
| Overview — filter applied | `f1IOdF` | `p8HffF` | — | 3400 | Status filter *Booked*; filter button shows the counter *1*; 4 of 4 active projects | AC-DASH-036 |
| Overview — no match | `f4pyy` | `usmgv` | — | 5100 | Search *Lamaran*; table header row hidden; Empty State *No matching projects* with *Clear search* (the project list's no-match state) | AC-DASH-037 |
| Overview — no active projects | `od6HS` | `k01xc` | — | 6800 | Only completed or cancelled projects: tiles 0/0/0/1 with no badges or rings; search and filter hidden; Empty State *No active projects* with *View project list* | AC-DASH-029, AC-DASH-031 |

Not drawn, on purpose:
- **Filter dialog:** the project list's *Filter projects* is reused unchanged: [projects.pen](../projects/projects.pen) `e1VJF` (desktop modal) and `ITvcM` (phone sheet). On the dashboard, *Status* offers the five active statuses only.
- **Loading:** the existing dashboard route loading UI (its titles were translated in F-24); no overview-specific skeleton.
- **Error:** the existing owner error page with retry (spec E2, AC-DASH-019).
- **Workspace without a project:** F-25's checklist, unchanged ([setup-checklist design](../setup-checklist/design.md)).
- **Tablet states other than default:** they follow the desktop frames inside the tablet shell.
- **Dark mode, focus rings, hover:** follow the library tokens and components (GAP-01).

## Component usage

| Library component | Variant (ID) | Used in | Overrides |
|---|---|---|---|
| App Shell (C30) | `d:y9uBJl` | all desktop frames | Sidebar labels in English, workspace *Explore Studio*, nav count badges off; Page Header breadcrumb *Explore Studio › Dashboard*, title, subtitle, hero action *New project* (Button/Primary/MD, `plus`); Toast and Overlay off |
| App Shell/Tablet | `d:lQnS8` | `fC7eZ` | Same header overrides; rail labels in English, rail count badges off |
| Mobile App Shell (C35) | `d:c6qPz7` | all mobile frames | 390 wide; Mobile Header title/subtitle, workspace pill; Bottom Nav *Dashboard* active, *Projects*, *Clients*, *Invoices*; content slot = canvas sheet (`surface.canvas`, top corners `panel.app.radius`, padding `space.5`/`space.4`, gap `space.4`) |
| Page Content container | — | desktop and tablet | Container 720 (see exceptions), gap `panel.app.content.gap` |
| Metric Tile (C26) | `d:AJT5R` | 4 tiles; desktop one row (gap `space.4`), phone 2×2 (gap `space.3`) | Label; value; Delta: Metric Delta/Positive (tiles 1 and 4), Metric Delta/Warning *{count} waiting* (tile 2), off (tile 3); Spark on (tiles 1 and 4), replaced by the ring (tiles 2 and 3) |
| Table (C27) | `d:FCsTI` | *Active projects* | Toolbar: title; subtitle off; Filter slot replaced by a *Search row* (Input/Default 320 with `search` icon + Icon Button/Outline/MD `list-filter`, counter off or on); header labels PROJECT, NEXT SESSION, STATUS, AGREED PRICE, actions column 32; Rows slot = Table Row/Default rows (last row `strokeWidth` 0); footer count and *View all projects →* |
| Table Cell/Client · Text · Strong · Actions | `d:lVDvO` `d:f0oyj` `d:f7pbaS` `d:C1MRI` | rows | widths: project fill, next session 150, status 130 (Status Chip in a frame, as on the project list), agreed price 110, actions 32; *No sessions scheduled* in `text.muted` |
| Status Chip (C12) | Neutral `d:w7OAR` *Draft* · Info `d:D7LAk7` *Booked* · Accent `d:h4md7` *Shooting* · Warning `d:g26Cg6` *Post-production* · Success `d:GyfYn` *Delivered* | table and phone rows | label (the project list's tone mapping) |
| Action Menu/SM | Closed `d:tgN4c` · Open `d:M3v1E5` | ⋯ per row | Open: Items = Menu Item *Start shoot* (`camera`), *Edit project info* (`pencil`), Menu Divider, Menu Group Label *Send to client*, *Chat on WhatsApp* (`message-circle`), Menu Divider, Menu Item/Destructive *Cancel project* (`circle-x`); opens upward on the desktop frame |
| Section Card/Compact/Flush (C43) | `d:Q82mo` | phone list | Description = footer count (off in empty states); rows = List Card Item/Two-line (icon off, title fixed-width, meta *client · next session*, Trailing = chip + Action Menu SM); empty states use the compact content padding |
| Bottom Sheet/Actions | `d:U0wHw` | `aoGYG` | Title and meta; Items = Sheet Items and the *Send to client* group label, as on the project list (`EWFc5`) |
| Empty State | `d:H43gDN` | no match, no active projects | Icon `search-x` / `folder-kanban`; title; body; Action = Button/Secondary/MD without icon. Desktop: inside the Rows slot, wrapper padding `space.4` (the project list's pattern); phone: card content padding `section-card.compact.content.padding` (16), wrapper padding 0; phone override of the Empty State padding `space.8`/`space.4` |
| Button/Secondary/MD | `d:JmfmZ` | phone *View all projects* | full width, label |

## Token-usage exceptions

| Rule | Where | Why | Status |
|---|---|---|---|
| Layout pattern *Centered narrow content* ("use the full container for dashboards") | Container 720 on desktop and tablet | Owner chose 720 over 1096 for this page (spec FC-005); at 720 the table drops the *Service* column | Accepted (Owner 2026-10-14: "720") |
| G3 (components bind `component.*`) / no library ring | Ring on *To review* and *In editing*: two `ellipse` nodes (track `component.metric.spark.bar`, value `component.metric.spark.current`, inner radius 0.68, 28 px) replacing the tile's Spark | The library has no ring; built from the Metric Tile's own chart tokens, kept local by Owner decision (spec FC-006). Candidate for a Metric Tile variant later | Accepted (Owner 2026-10-14: "Chart option D — ring") |
| G3 | *No sessions scheduled* cell text `text.muted` instead of the table cell text token | It marks the absence of a value; the project row stays readable by its title | Accepted, re-measure contrast at verify (T3: `text.muted` ≥ 12 px) |
| SP8 | — | Checked: the phone empty state uses one padding (card content 16), not a stack | No exception |

No `DESIGN TOKEN GAP`; no new token or component. The open design-system gap *no negative (red) metric delta tone* stays open: a downward trend uses Metric Delta/Warning (spec).

## Copy

- From the copy deck, approved: *Dashboard subtitle* (§1, 2026-10-14), the tile labels (§4.3b, 2026-10-14), the project list's search, filter, no-match, status, menu and *No sessions scheduled* rows (§7.1, §7.3).
- Drafted with the Codex CLI and approved by the Owner on 2026-10-15, now in copy deck §4.3b: table title *Active projects* (chosen over *Bookings & production*), column heads, footer count, *View all projects*, *Today* / *Today, {time}*, *{count} waiting*, the *No active projects* empty state (action *View project list*), and the screen-reader texts for ring, sparkline and trend. ID *Harga sepakat* kept from §7 instead of Codex's *Harga disepakati*.
- *Explore Studio* stands for `{workspaceName}`; project, client and session names are sample fixtures.

## Exports

Exported through the Pencil MCP (`Export`, `html-tailwind`) on 2026-10-15 into [exports/](exports/), one file per frame, named `<screen>-<state>-<device>-<frameId>.html`: 11 files, 1,229 KB. [exports/INDEX.md](exports/INDEX.md) is generated by `python3 scripts/sdv/index-exports.py dashboard-overview` (no unmatched files); rerun it after any re-export (`--check` exits 1 when it is out of date).

## Saves

- 2026-10-15 01:25 — `dashboard-overview.pen` 437,054 bytes (Owner ⌘S).
- 2026-10-15 01:28 — `dashboard-overview.pen` 436,988 bytes after the approved copy and title (Owner ⌘S), saved after the exports were written.

## Approval

APPROVED by the Owner on 2026-10-15 ("approve, use Active projects as title"), with the copy above. Feature map: `DESIGNED`.
