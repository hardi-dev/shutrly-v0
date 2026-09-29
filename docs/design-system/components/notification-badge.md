# Component: `Notification Badge`

## Status and approval

- Lifecycle: **MERGED into Count Badge (Danger) 2026-09-29** (F-17, Owner: follow code). Previously `APPROVED` 2026-09-26 (Owner: "approved" — review of C02–C26). Previously `PROPOSED` (tier 1b, 2026-09-26)
- Direction/token approval: `APPROVED`. `badge.danger.*` and the new semantic `status.danger.on-solid` were added on 2026-09-26.
- Pencil library: `design-system.lib.pen` › **C14 — Notification badge** (`uKgTV`)
- Pencil component: `Notification Badge` (`HoAYC`), layer `Count` (`hnJrZ`)
- Consumer: Icon button (C02) `Badge` layer

## Purpose

An unread or alert count on an icon, such as the notification bell. It's solid danger so it reads as "needs attention", unlike the neutral **Count badge** (C13).

## Content

Digits 1–9, then "9+". Hide it at 0.

## Token dependencies

| Part | Token → alias |
|---|---|
| Fill | `badge.danger.background` → `status.danger.solid` (red.600 \| red.400) |
| Count | `badge.danger.text` → `status.danger.on-solid` (neutral.0 \| neutral.950, **new**) |
| Padding | `badge.danger.padding-y` / `-x` → 2 / 6 (SP6 badge; legacy 1/5 snapped) |
| Radius | `badge.danger.radius` → full |
| Type | `font.size.overline` (10) / `font.weight.bold` |

## Accessibility

- Put the count in the parent button's accessible name.
- Contrast is ≥ 4.5 : 1 in both modes: white on red.600, and near-black on red.400 in dark mode. That's why dark mode uses a dark `on-solid`.
- It's never the only signal for an urgent error.

## F-17 update — PROMOTED 2026-09-29

Promoted to `design-system.lib.pen` by `/sdv:save-design-system` (F-17, Owner-approved design; rules v3.1). Library: node `HoAYC` renamed **Count Badge/Danger**; Count `hnJrZ` caption 11 / semibold; padding `badge.danger.*` = 2 / 8. This component is merged into [count-badge.md](count-badge.md). Details: [F-17 design.md](../../features/app-shell-revamp/design.md).

- **CONFLICT with code:** `CountBadge` implements this as `variant="danger"`. The library merges C14 into Count Badge C13 as a Danger variant.
- **Decided (Owner 2026-09-29): the code values win:**
  - type: caption 11 / semibold;
  - padding: `nav.count.*`;
  - cap: `99+`.

  C14 merges into C13 as the Danger variant on promotion.
- On Icon Button **MD** the badge offset is x 20 / y 4. The library's x 24 / y −4 only fits SM.

## Implementation references

- Pencil: `C14 — Notification badge` (`uKgTV`)
