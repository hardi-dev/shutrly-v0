# Component: `Nav Item` (+ `Nav Group Label`)

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (Owner: "approved" — review of C02–C26). Previously `PROPOSED` (tier 2, 2026-09-26)
- Direction/token approval: `APPROVED`. `nav.item.background-hover` and `nav.group-label` were added on 2026-09-26.
- Pencil library: `design-system.lib.pen` › **C22 — Nav item** (`UZTgh`)
- Evidence: the legacy dashboard sidebar (`exploration.pen` › Dashboard — Product-grounded › Sidebar)

## Purpose

One destination in the Owner app sidebar. Exactly one item is Active.

## Anatomy

| # | Part | Layer name | Description |
|---|---|---|---|
| 1 | Container | root | 228 wide (sidebar content); padding 8/12 (`nav.item.padding-y/-x`; legacy 9/12 → 8); gap 10 (`nav.item.gap`); `nav.item.radius`. |
| 2 | Icon | `Icon` (`MpR9k`) | 16 px lucide, `nav.item.icon`. |
| 3 | Label | `Label` (`m6S2m`) | body 14/500, `nav.item.text`, `fill_container`. |
| 4 | Count | `Count` (`E6JiYt`) | Nested **Count Badge** (C13); off by default. Its text is at `E6JiYt/BTnxI`. |

## Variants

The private base is `_NavItem/Base` (`cvsvP`).

| State | ID | Tokens |
|---|---|---|
| Default | `K0UQ06` | — |
| Hover | `Ijxgm` | `nav.item.background-hover` → `surface.sunken` |
| Active | `CInVy` | `nav.item.background-active` → `action.primary`; icon and label `nav.item.text-active` |
| Focus | `XBgH6` | 2 px `focus.ring` outside + `focus.glow` |

**Nav Group Label** (`Rjoxp`, text `p1hGy`) names a group of items, such as "KATALOG". It uses overline type (10/bold/+0.6, UPPERCASE, which snaps legacy 11/600 to the overline style), fill `nav.group-label` → `text.muted` (legacy `#A1A1AA` darkened for AA), and padding `space.1` / `nav.item.padding-x`, so its text lines up with item labels at x 12.

## Layout (board 08)

- Items in a group: gap 4 (`space.1`). Between groups: gap 12 (`space.3`).
- Rarely used destinations sit at the bottom, pushed down by a flexible spacer (SP7).

## Content

- The label is the page name in one or two words. Long labels wrap in Pen; code truncates them with an ellipsis and a title.
- The count is for neutral totals only. Alerts go on the notification bell.
- Always show the icon with the label; never icon-only in the expanded sidebar.

## Accessibility

- Links sit inside `<nav aria-label="Utama">`. The Active item has `aria-current=page` and a filled background, so it isn't shown by colour alone.
- The count is part of the accessible name (*Proyek, 12*).
- The target is 36 px high: fine for the owner web app (≥ 24 px).

## Gaps

- `nav.count.*` should become `count-badge.*` if the badge spreads beyond navigation.

## Implementation references

- Pencil: `C22 — Nav item` (`UZTgh`), base `cvsvP`
- Rules: token-usage.md G3, SP4, SP6, SP7, §2 *Action & focus*
