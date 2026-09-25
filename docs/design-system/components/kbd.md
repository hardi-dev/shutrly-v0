# Component: `Kbd`

## Status and approval

- Lifecycle: `PROPOSED` (tier 1b, 2026-09-26)
- Direction/token approval: `APPROVED` (`kbd.*` added 2026-09-26)
- Pencil library: `design-system.lib.pen` › **C17 — Kbd** (`HV6UQ`)
- Pencil component: `Kbd` (`UdwCn`), layer `Keys` (`Xmo7V`)
- Consumer: Input `Shortcut` layer (search ⌘K)

## Purpose

Shows a keyboard shortcut next to the control it triggers. Display only.

## Content

- Use platform symbols (⌘ ⇧ ⌥) on macOS and "Ctrl" on Windows.
- One shortcut per Kbd. For a chord, use two Kbds with a `space.1` gap.

## Token dependencies

- `kbd.background` → `surface.panel`; `kbd.border` → `border.default`; `kbd.text` → `text.secondary`.
- `kbd.padding-y` / `-x` → 2 / 6 (SP6 small component; legacy 1/5 snapped).
- `kbd.radius` → `radius.xs` (§5 lists kbd).
- Type: caption / semibold.

## Accessibility

- Use `<kbd>`. It can be decorative when the control has `aria-keyshortcuts`.
- `text.secondary` on the panel is ≥ 4.5 : 1.

## Implementation references

- Pencil: `C17 — Kbd` (`HV6UQ`)
