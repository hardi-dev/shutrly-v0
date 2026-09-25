# Component: `Metric Tile`

## Status and approval

- Lifecycle: `PROPOSED` (tier 2, 2026-09-26)
- Direction/token approval: `APPROVED`. `metric.tile.label/value` and `metric.spark.gap/radius` were added on 2026-09-26.
- Pencil library: `design-system.lib.pen` › **C26 — Metric tile** (`w2pc7t`)
- Evidence: legacy Frame 4 › Metrics. The Owner's decision is to follow it exactly.

## Purpose

One KPI on the dashboard: a label, a value, a trend delta and a 7-bar sparkline.

## Anatomy

| # | Part | Layer name | Description |
|---|---|---|---|
| 1 | Tile | root | 278 wide (`fill_container` in a row); vertical; padding 16 (`metric.tile.padding`); gap 12 (`metric.tile.gap`); `metric.tile.background` + 1 px `metric.tile.border`; `metric.tile.radius`. Flat, with no shadow (§6). |
| 2 | Head | `Head` | Label and Delta, space-between, with a minimum gap of 8 (`space.2`). |
| 3 | Label | `Label` (`Wtx9f`) | label 12/600, `metric.tile.label` → `text.secondary`. |
| 4 | Delta | `Delta` (`MbBqV`) | Nested **Metric Delta/Positive** (C15); its text is at `MbBqV/GqwpL`. |
| 5 | Value row | `Value row` | Value and Spark, bottom-aligned, space-between, with a minimum gap of 8. |
| 6 | Value | `Value` (`CXKcw`) | metric type 26/700/−0.6, `metric.tile.value` → `text.primary`. |
| 7 | Spark | `Spark` (`dUbG4`) | 28 tall, gap `metric.spark.gap` (4; legacy 3 → 4). Seven 6 px bars with radius `metric.spark.radius` (2); bars 1–6 are `metric.spark.bar`, and the last bar is `metric.spark.current`. |

## Variants and properties

A single component (`AJT5R`) with no axes.

| Property | Type | Mechanism |
|---|---|---|
| `label`, `value` | Text | `descendants` content |
| `delta` | Boolean + text | `MbBqV: {enabled}`; text `MbBqV/GqwpL` |
| `deltaTone` | Instance swap | `Replace(instance+"/MbBqV", {type:"ref", ref:"GU07z", name:"Delta", …})` for warning |
| `spark` | Boolean | `dUbG4: {enabled}` |

The bar heights are data, drawn as example values. Code renders the real series.

## Content

- The label is sentence case, 3 words or fewer. The value is formatted money (*Rp 18,4 jt*) or a count with a unit.
- The delta is a signed percentage or a count with a unit. Positive uses `status.positive`; needing attention uses warning.
- Show 3–4 tiles per row, `fill_container`, gap 16 (`space.4`).

## Accessibility

- The read order is label, value, delta (*Pendapatan, Rp 18,4 juta, naik 12,4 persen*).
- The sparkline is `aria-hidden` unless a text summary is given.
- Contrast: `text.secondary` and `text.primary` on `surface.panel` are ≥ 4.5 : 1 in both modes.

## Gaps

- Tabular figures for money (`DESIGN TOKEN GAP`, handled in code).
- No negative (red) delta tone.
- The Head and Value row minimum gap binds `space.2` directly (no component alias).

## Implementation references

- Pencil: `C26 — Metric tile` (`w2pc7t`)
- Rules: token-usage.md G3, SP4, §3 *metric*, §6
