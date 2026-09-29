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

## Rules

- Use two or more rows. A single destination should be a standalone button or link.
- Use `/Last` exactly once, for the final visible row; all previous rows use `/Default`.
- Meta is short secondary information, not a second description line.
- The entire row is interactive. Do not place a second button inside it.

## Accessibility

- Use a semantic list. Interactive rows are links or buttons with a 44 px target.
- Decorative chevrons are hidden from assistive technology. Include Meta in the accessible name only when it changes the meaning.

## Implementation references

- Tokens: `component.list-card.*`, `size.list-row`
- Default composition: `R67AX` + `O55Yt`
