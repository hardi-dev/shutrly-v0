# Component: `Calendar Day`

## Status and approval

- Lifecycle: `PROPOSED` (tier 2, 2026-09-26)
- Direction/token approval: `APPROVED`. `calendar.day.label/number/dot/dot-selected` were added on 2026-09-26.
- Pencil library: `design-system.lib.pen` › **C25 — Calendar day** (`J3EsT8`)
- Evidence: legacy Frame 3 › This Week › Day Strip

## Purpose

One day in the dashboard's week strip and the calendar header: weekday, date and up to 3 session dots.

## Anatomy

| # | Part | Layer name | Description |
|---|---|---|---|
| 1 | Cell | root | 56 wide (`fill_container` in a strip); vertical; padding 10/0 (`calendar.day.padding-y`, SP6 day cell); gap 4 (`calendar.day.gap`); `calendar.day.background`; `calendar.day.radius` (16). |
| 2 | Day | `Day` (`gotez`) | caption 11/600, `calendar.day.label`. id-ID short weekday: Sen Sel Rab Kam Jum Sab Min. |
| 3 | Date | `Date` (`BYi8t`) | subtitle 16/700 (legacy 800 → 700, the weight cap), `calendar.day.number`. |
| 4 | Dots | `Dots` (`gBNhF`) | 5 px tall, gap `space.1` (legacy 3 → 4). `Dot 1` `zB5te` on; `Dot 2` `Z0m2o9` and `Dot 3` `onKaK` off. 5 × 5 ellipses in `calendar.day.dot`. |

## Variants

The private base is `_CalendarDay/Base` (`RmXbc`).

| State | ID | Tokens |
|---|---|---|
| Default | `v87EDR` | as above |
| Selected | `Hbsc8` | `background-selected` → `surface.inverse`; day `label-selected` and dots `dot-selected` → `accent.on-inverse`; date `number-selected` → `text.inverse`; 3 dots |
| Focus | `qTeQQ` | 2 px `focus.ring` outside + `focus.glow` |

`dot-selected` aliases `accent.on-inverse` (lime in light mode, deep green in dark mode), so the dots stay visible when the inverse cell turns light in dark mode.

## Content

- A week strip is 7 cells, `fill_container`, gap 8 (`space.2`).
- Dots show sessions that day: 0 to 3, where 3 means 3 or more. Never put numbers in the cell.
- Selected defaults to today. There is one Selected per strip.

## Accessibility

- Each day is a button (or gridcell) with a full label, such as *Kamis, 25 September, 3 sesi*. The dots are `aria-hidden`.
- Selected uses `aria-pressed` (or `aria-selected`) and is shown by the inverse fill, not colour alone.
- Arrow keys move between days. Focus is always visible.

## Gaps

- No hover state or token.
- The dots gap binds `space.1` directly, because there's no component alias.

## Implementation references

- Pencil: `C25 — Calendar day` (`J3EsT8`), base `RmXbc`
- Rules: token-usage.md G3, SP6, §2 *Accent*
