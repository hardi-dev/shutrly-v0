# Component: `List Card`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-28 (Owner: "ya" — message-template v3)
- Pencil library: `design-system.lib.pen` › **C42 — List card** (`twUcY`)
- Evidence: approved mobile message-template list cards in `exploration.pen`

## Purpose

Presents a compact list of related destinations or settings inside one bordered card.

## Anatomy

`List Card` is `swIYb`. Its `Items` slot (`A1hw5`) accepts the related reusable rows:

| Row | ID | Contract |
|---|---|---|
| Private base | `LBknS` | 44 px literal height (`list-card.item.height` → `size.list-row`); padding-x 12; gap 12; bottom `list-card.item.border`. |
| Default | `uJwfh` | Keeps the bottom separator. |
| Last | `XhLSK` | Removes the bottom separator. |

Each row has `Icon wrap` (`XUpib`), swappable `Icon` (`iD6nb`), `Title` (`HhRDD`), optional `Meta` (`NAcrj`), and trailing `Chevron` (`j06tV`). The card uses `list-card.background`, `list-card.border`, radius 12, and vertical padding 4.

## Two-line and skeleton rows (2026-10-01, F-04)

Approved by the Owner with the `component.list-card.item.*` additions (`padding-y`, `text-gap`, `icon-radius`, `skeleton`, `skeleton-radius`).

| Row | ID | Contract |
|---|---|---|
| Private base | `hl0Fg` `_ListCardItem/TwoLine/Base` | padding `item.padding-y` (12) / `item.padding-x` (12); gap 12; 36 icon well (`item.icon-radius`, 18 icon); `Text` = Title (body, semibold) + Meta (body-sm), `item.text-gap` (2); **Trailing** slot. |
| Two-line | `PV6HB` | Bottom separator on. |
| Two-line/Last | `Bf3eg` | Separator off. |
| Skeleton base | `V5cGdN` `_ListCardItem/Skeleton/Base` | Same box; icon placeholder and bars in `item.skeleton` / `item.skeleton-radius`; optional `Trailing bar`. |
| Skeleton | `ksPQI` / Skeleton/Last `KKvqb` | For loading lists; one skeleton row per expected row (3 by default). |

**Trailing slot:** either a Chevron (the whole row is a link, as in F-03), or a Status Chip and/or Action Menu SM (the row itself is not interactive, as in F-04). Never both a link row and a button inside it.

**Trailing amendment — APPROVED 2026-10-02 (F-05).** In non-interactive rows, Trailing may also hold, in this order:

1. a Status Chip;
2. a **value text**, such as a price or an amount (body, semibold, `component.list-card.item.title`);
3. **Naikkan / Turunkan** reorder buttons (Icon Button Ghost SM, `arrow-up` / `arrow-down`) for ordered lists;
4. the Action Menu SM.

On phones, reordering moves into the row menu. See the *Trailing: value + reorder* exhibit on C42 (`jZ1ur`).

## Rules

- Use two or more rows. A single destination should be a standalone button or link.
- Use `/Last` exactly once, for the final visible row; all previous rows use `/Default`.
- Meta is short secondary information, not a second description line.
- One-line rows: the entire row is interactive. Do not place a second button inside it. Two-line rows follow the Trailing slot rule above.

## Accessibility

- Use a semantic list. Interactive rows are links or buttons with a 44 px target.
- Decorative chevrons are hidden from assistive technology. Include Meta in the accessible name only when it changes the meaning.

## Implementation references

- Tokens: `component.list-card.*`, `size.list-row`
- Code: two-line rows are local in F-03 (`template-list-screen`); a shared `ListCardItem` is planned in F-04.
- Default composition: `R67AX` + `O55Yt`
