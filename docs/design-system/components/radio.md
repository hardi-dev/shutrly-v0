# Component: `Radio`

## Status and approval

- Lifecycle: `PROPOSED` (tier 1, 2026-09-26 — awaiting Owner review)
- Direction/token approval: `APPROVED` (tokens and rules 2026-09-26)
- Owner: Shutrly design system (Owner: hardi-dev)
- Last reviewed: 2026-09-26
- Pencil library: `docs/design-system/design-system.lib.pen` › **C06 — Radio** (`v16e9b`)

## Purpose

Picks exactly one option from a short, visible list of 2–5 options. Radio shares the checkbox tokens, so the two controls read as one family.

## Anatomy

| # | Part | Layer name | Required | Description |
|---|---|---|---:|---|
| 1 | Row | root | Yes | Dot plus label; the whole row is the click target. |
| 2 | Dot | `Dot` | Yes | 18 × 18 ellipse. Unselected: 1.5 px outline. Selected: 5 px inner ring around a white centre. |
| 3 | Label | `Label` | Yes | `font.size.body` / `font.weight.medium`. |

## Variants and properties

The private base is `_Radio/Base` (`QK374`), with layers `Dot` `i9SvB` and `Label` `dK1OA`.

| Property | Figma type | Values / default | pen.dev mechanism |
|---|---|---|---|
| `value` | Variant | `unselected`, `selected` / `unselected` | component `Radio/<Value>/…` |
| `state` | Variant | `default`, `hover`, `focus`, `disabled` / `default` | component `…/<State>` |
| `label` | Text | `"Edited"` | `descendants: { Label: { content } }` |

| Value \ State | Default | Hover | Focus | Disabled |
|---|---|---|---|---|
| Unselected | `Imyla` | `x3hzlO` | `UkSaY` | `u3UCo` |
| Selected | `SSy18` | `YAti1` | `xI8Gg` | `lOBiD` |

## States

- **Hover:** unselected → `checkbox.border-hover`; selected → the ring becomes `checkbox.background-checked-hover`.
- **Focus:**
  - Unselected: a 2 px `focus.ring` plus `focus.glow`.
  - Selected: `focus.glow`. An ellipse can take only one stroke, so code adds the offset 2 px ring.
- **Disabled:** `opacity.disabled`.

## Slots and content rules

- Always a group with a field label (`<fieldset>` / `<legend>`). Stack options 8 apart.
- Pre-select one option only when there's a sensible default. Keep the wording short and parallel.

## Token dependencies

Radio reuses `component.checkbox.*`:

| Part | Token |
|---|---|
| Unselected fill | `checkbox.background` |
| Outline | `checkbox.border` / `-hover` |
| Selected ring | `checkbox.background-checked` / `-hover` |
| Selected centre | `checkbox.mark` |
| Label | `checkbox.label` |
| Gap | `checkbox.gap` (8) |

Focus uses `focus.ring` and `focus.glow`; disabled uses `opacity.disabled`. The shape is round (an ellipse), so there's no radius token.

## Usage-rule compliance

- **G3:** every part binds a checkbox component token.
- **SP1:** whole steps only.
- **§8:** the outline is ≥ 3 : 1.

## Accessibility

- A native radio group. Arrow keys move and select within the group; Tab enters and leaves it.
- The label is the accessible name.
- Contrast: the outline is ≥ 3 : 1, and the selected ring is `action.primary`.

## Usage guidance

| Situation | Use |
|---|---|
| Exactly one, 2–5 options visible | **Radio** |
| Exactly one, 6+ options | Select (not built) |
| Zero or more | Checkbox |
| Instant on/off | Switch |

## Implementation references

- Pencil: `C06 — Radio` (`v16e9b`), base `QK374`
- Rules: token-usage.md G3, SP1, §8
