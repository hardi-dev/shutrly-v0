# Component: `Nav Item` (+ `Nav Group Label`, compact rail mode)

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (Owner: "approved" — review of C02–C26). Previously `PROPOSED` (tier 2, 2026-09-26)
- Direction/token approval: `APPROVED`, amended by the Owner's shell v3 approval on 2026-09-28. The active state is now a panel pill with a lime icon.
- Pencil library: `design-system.lib.pen` › **C22 — Nav item** (`UZTgh`)
- Evidence: the legacy dashboard sidebar (`exploration.pen` › Dashboard — Product-grounded › Sidebar)

## Purpose

One destination in the Owner app navigation. Exactly one item is Active. The same
component supports the expanded Sidebar and the compact tablet rail through its
`isCompact` mode; this keeps active, hover, focus, and accessibility behavior in
one place.

## Anatomy

| # | Part | Layer name | Description |
|---|---|---|---|
| 1 | Container | root | 228 wide (sidebar content); padding 8/12 (`nav.item.padding-y/-x`; legacy 9/12 → 8); gap 10 (`nav.item.gap`); `nav.item.radius`. |
| 2 | Icon | `Icon` (`MpR9k`) | 16 px lucide, `nav.item.icon`; Active overrides it with `nav.item.icon-active` → `accent.soft-fg`. |
| 3 | Label | `Label` (`m6S2m`) | body 14/500, `nav.item.text`, `fill_container`. |
| 4 | Count | `Count` (`E6JiYt`) | Nested **Count Badge** (C13); off by default. Its text is at `E6JiYt/BTnxI`. |

In compact mode (`isCompact`), the item is a 40 × 40 icon target. The label is
removed from the visible layout and exposed through the Tooltip, while the link
keeps the label as its accessible name. Compact items use the same active and
hover tokens as expanded items.

## Variants

The private base is `_NavItem/Base` (`cvsvP`).

| State | ID | Tokens |
|---|---|---|
| Default | `K0UQ06` | — |
| Hover | `Ijxgm` | `nav.item.background-hover` → `surface.muted` |
| Active | `CInVy` | `nav.item.background-active` → `surface.panel`; label `nav.item.text-active` → `text.primary`; icon `nav.item.icon-active` → `accent.soft-fg` |
| Focus | `XBgH6` | 2 px `focus.ring` outside + `focus.glow` |

**Nav Group Label** (`Rjoxp`, text `p1hGy`) names a group of items, such as "KATALOG". It uses overline type (10/bold/+0.6, UPPERCASE, which snaps legacy 11/600 to the overline style), fill `nav.group-label` → `text.muted` (legacy `#A1A1AA` darkened for AA), and padding `space.1` / `nav.item.padding-x`, so its text lines up with item labels at x 12.

## Layout (board 08)

- Items in a group: gap 4 (`space.1`). Between groups: gap 12 (`space.3`).
- Rarely used destinations sit at the bottom, pushed down by a flexible spacer (SP7).

## Content

- The label is the page name in one or two words. Long labels wrap in Pen; code truncates them with an ellipsis and a title.
- The count is for neutral totals only. Alerts go on the notification bell.
- Always show the icon with the label in the expanded sidebar.
- Use compact mode for the tablet rail: show the icon only and provide the label
  through the Tooltip.

## Accessibility

- Links sit inside `<nav aria-label="Utama">`. The Active item has `aria-current=page` and a filled panel pill; the lime icon is supplementary, so state isn't shown by colour alone.
- The count is part of the accessible name (*Proyek, 12*).
- The target is 36 px high: fine for the owner web app (≥ 24 px).
- Compact targets are 40 × 40 and link the Tooltip with `aria-describedby`.
- An active item does not apply the hover background, so hovering it does not
  reduce the contrast of its active text and icon.

## Gaps

- `nav.count.*` should become `count-badge.*` if the badge spreads beyond navigation.

## F-17 update — PROMOTED 2026-09-29

Promoted to `design-system.lib.pen` by `/sdv:save-design-system` (F-17, Owner-approved design; rules v3.1). Library: tokens `nav.item.background-active` → `action.primary`, `text-active`/`icon-active` → `action.on-primary`, `background-hover` → `surface.panel`, new `icon-hover` → `accent.soft-fg`; `CInVy` label semibold; `Ijxgm` icon `icon-hover`. Rules v3.1 N1 (APPROVED 2026-09-29). Details: [F-17 design.md](../../features/app-shell-revamp/design.md).

- Active becomes `action.primary` with `action.on-primary` icon and label. Hover becomes the former active pill (`surface.panel`, `text.primary`, `accent.soft-fg` icon).
- This also fixes today's invisible hover: `nav.item.background-hover` = `surface.muted` = the Sidebar background.
- It is a **CONFLICT** with token-usage §Action & focus, which needs an amendment through `/sdv:design-rules`.

## Implementation references

- Pencil: `C22 — Nav item` (`UZTgh`), base `cvsvP`
- Rules: token-usage.md G3, SP4, SP6, SP7, §2 *Action & focus*
