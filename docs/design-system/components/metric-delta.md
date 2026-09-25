# Component: `Metric Delta`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (Owner: "approved" — review of C02–C26). Previously `PROPOSED` (tier 1b, 2026-09-26)
- Direction/token approval: `APPROVED`
- Pencil library: `design-system.lib.pen` › **C15 — Metric delta** (`I7T5uL`)
- Consumer: Metric tile (tier 2)

## Purpose

A small change indicator on a metric tile, such as "+12,4%" or "3 invoice". Display only.

## Anatomy

| # | Part | Layer name | Required | Description |
|---|---|---|---:|---|
| 1 | Container | root | Yes | Padding 2/6, `radius.xs`. |
| 2 | Value | `Value` | Yes | `font.size.caption` / `font.weight.bold`. |

## Variants and properties

The private base is `_MetricDelta/Base` (`Y5oibW`), with layer `Value` `GqwpL`.

| Property | Type | Values | Mechanism |
|---|---|---|---|
| `tone` | Variant | `positive` `x7rlD`, `warning` `GU07z` | component `Metric Delta/<Tone>` |
| `value` | Text | "+12,4%" | `descendants` content |

## Content

- A signed percentage with the id-ID decimal comma (+12,4%), or a count with its unit (3 invoice).
- There's no negative (red) tone yet: `DESIGN TOKEN GAP` if one is ever needed.

## Token dependencies

- `metric.delta.<tone>.background` / `.text` → `status.positive.*` or `status.warning.*`
- `metric.delta.padding-y` / `-x` (2 / 6; allowed as a badge under SP6)
- `metric.delta.radius` (`radius.xs`)

## Accessibility

- The text carries the meaning (sign plus unit), not the colour. Foreground on background is ≥ 4.5 : 1 in both modes.
- Screen readers get a spoken form ("naik 12,4 persen") via visually hidden text.

## Implementation references

- Pencil: `C15 — Metric delta` (`I7T5uL`), base `Y5oibW`
