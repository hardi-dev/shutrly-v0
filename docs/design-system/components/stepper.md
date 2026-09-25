# Component: `Stepper`

## Status and approval

- Lifecycle: `PROPOSED` (tier 1b, 2026-09-26)
- Direction/token approval: `APPROVED`. `stepper.*` was added on 2026-09-26. The "+" button uses `action.primary`, the same semantic as Button primary (Owner: "gunakan primary color, dari button primary").
- Pencil library: `design-system.lib.pen` › **C08 — Stepper** (`vWyiP`)

## Purpose

Adjusts a small whole number in place (*jumlah album*, *sesi tambahan*). For large or free-form numbers, use an Input.

## Anatomy

| # | Part | Layer name | Required | Description |
|---|---|---|---:|---|
| 1 | Container | root | Yes | Pill; padding 4, gap 4, panel fill with `border.input`. |
| 2 | Decrement | `Decrement` | Yes | 32 × 32 neutral button with a `minus` icon. |
| 3 | Value | `Value` | Yes | 32 wide, centred, `font.size.body` bold. |
| 4 | Increment | `Increment` | Yes | 32 × 32 **primary** button with a `plus` icon. |

## Variants and properties

The private base is `_Stepper/Base` (`G5nIg`), with layers `Decrement` `eDLhv`, `Value` `VcrsX` and `Increment` `Ezlnc`.

| Property | Type | Values | Mechanism |
|---|---|---|---|
| `state` | Variant | `default` `mNfw5`, `focus` `LIq8i`, `at-minimum` `wOE8e`, `disabled` `ylYb6` | component `Stepper/<State>` |
| `value` | Text | "2" | `descendants` content |

**Hover** is per step button, using `stepper.button.background-hover` and `stepper.button-primary.background-hover`. The canvas shows it as a preview row, not as separate variants. At the maximum, disable + the same way − is disabled at the minimum.

## Token dependencies

| Part | Token → alias |
|---|---|
| Container | `stepper.background` → `surface.panel`; `stepper.border` → `border.input`; `stepper.radius` → full; `stepper.padding` / `.gap` → `space.1` |
| − button | `stepper.button.background` / `-hover` → `surface.sunken` / `surface.muted`; `stepper.button.icon` → `text.primary` |
| + button | `stepper.button-primary.background` / `-hover` → `action.primary` / `-hover`; `stepper.button-primary.icon` → `action.on-primary` |
| Value | `stepper.value` → `text.primary` |

## Accessibility

- Code it as a spinbutton (`aria-valuenow`, `min`, `max`), or as `input type=number` with buttons labelled *Kurangi* and *Tambah*. Arrow Up/Down change the value.
- The buttons are 32 px (≥ 24, WCAG 2.2). On the client gallery, give them a ≥ 44 px hit area.
- The container border is below 3 : 1 (GAP-06, same mitigation as inputs).

## Implementation references

- Pencil: `C08 — Stepper` (`vWyiP`), base `G5nIg`
