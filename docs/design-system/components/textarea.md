# Component: `Textarea`

## Status and approval

- Lifecycle: `PROPOSED` (tier 1b, 2026-09-26)
- Direction/token approval: `APPROVED` (`input.padding-y` added 2026-09-26)
- Pencil library: `design-system.lib.pen` › **C04 — Textarea** (`ACpOE`)

## Purpose

Multi-line text entry, such as *Catatan untuk klien*. It has the same states and tokens as Input, plus `input.padding-y`, because the box isn't a fixed 40 px line.

## Anatomy

| # | Part | Layer name | Required | Description |
|---|---|---|---:|---|
| 1 | Container | root | Yes | Default 96 px high (about 3 lines, documented). |
| 2 | Placeholder | `Placeholder` | One of 2/3 | An example, in `input.placeholder`. |
| 3 | Value | `Value` | One of 2/3 | The entered text; line height 1.5. |

## Variants and properties

The private base is `_Textarea/Base` (`C4DyK`), with layers `Placeholder` `q9O7ef` and `Value` `B90I4`.

| Property | Type | Values | Mechanism |
|---|---|---|---|
| `state` | Variant | `default` `t7L0yL`, `hover` `i6bud`, `focus` `FXGl1`, `error` `XyHPI`, `disabled` `zVBG4` | component `Textarea/<State>` |
| `filled` | Boolean | `false` | Placeholder ↔ Value `enabled` |
| `placeholder`, `value` | Text | — | `descendants` content |

## States

The same as Input: hover, focus (2 px plus glow), error (2 px) and disabled.

## Token dependencies

`input.background` / `-disabled`, `input.border` / `-hover` / `-focus` / `-error` / `-disabled`, `input.text`, `input.placeholder`, `input.text-disabled`, `input.padding-y` (12, **new**), `input.padding-x` (12) and `input.radius`.

## Usage-rule compliance

- **G3:** every part binds an input component token.
- **SP1:** whole steps (12 / 12).

## Accessibility

- A visible label via Text field. When there's a character limit, announce it with `aria-describedby`.
- Resizes vertically only, in code. Enter inserts a new line and never submits the form.

## Implementation references

- Pencil: `C04 — Textarea` (`ACpOE`), base `C4DyK`
