# Component: `Count Badge`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (Owner: "approved" — review of C02–C26). Previously `PROPOSED` (tier 1, 2026-09-26 — awaiting Owner review)
- Direction/token approval: `APPROVED` (tokens and rules 2026-09-26)
- Owner: Shutrly design system (Owner: hardi-dev)
- Last reviewed: 2026-09-26
- Pencil library: `docs/design-system/design-system.lib.pen` › **C13 — Count badge** (`PVg5y`)
- Pencil component: `Count Badge` (`dQmPx`), layer `Count` (`BTnxI`)
- Consumer references: Nav item (tier 2), tabs and filters

## Purpose

A neutral number showing how many items sit behind a nav item, tab or filter (for example, *Proyek 12*). It's informational only, not an alert.

## Anatomy

| # | Part | Layer name | Required | Description |
|---|---|---|---:|---|
| 1 | Container | root | Yes | Pill; fill and padding bound. |
| 2 | Count | `Count` | Yes | Digits, `font.size.caption` / `font.weight.semibold`. |

## Variants and properties

A single component with no variant axes, so it has no base.

| Property | Figma type | Values / default | pen.dev mechanism |
|---|---|---|---|
| `count` | Text | `"12"` | `descendants: { Count: { content: "…" } }` |

## States

Static only.

## Slots and content rules

- Digits only.
- At 0, hide the badge; never show "0".
- At 100 or more, show "99+".
- No words and no icons.

## Token dependencies

| Component decision | Token path | Status |
|---|---|---|
| Background | `component.nav.count.background` → `surface.muted` | PERSISTED |
| Text | `component.nav.count.text` → `text.secondary` | PERSISTED |
| Padding | `component.nav.count.padding-y` / `-x` → `space.0-5` / `space.2` (2 / 8) | PERSISTED |
| Radius | `component.nav.count.radius` → `radius.full` | PERSISTED (added 2026-09-26) |

The tokens live under `nav.count` because nav items are the badge's first consumer. If the badge spreads beyond navigation, rename them to `count-badge.*`.

## Usage-rule compliance

- **G3:** every part binds a component token.
- **SP6:** half-steps are allowed in badges.
- **§2 Surfaces:** `surface.muted` is meant for "small neutral badges".

## Accessibility

- `text.secondary` on `surface.muted` is ≥ 4.5 : 1 in both modes.
- Announce the count with its label (*Proyek, 12*): put it inside the parent's accessible name.

## Usage guidance

- **Use for:** neutral totals next to a label.
- **Don't use for:** unread or alert counts, such as the notification bell. Those need a separate danger-toned badge, which is a future component that needs its own component tokens.

## Implementation references

- Pencil: `C13 — Count badge` (`PVg5y`)
- Rules: token-usage.md G3, SP6, §2 *Surfaces*, §8
