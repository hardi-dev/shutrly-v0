# Component: `Checkbox`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (Owner: "approved" — review of C02–C26). Previously `PROPOSED` (tier 1, 2026-09-26 — awaiting Owner review)
- Direction/token approval: `APPROVED` (tokens and rules 2026-09-26; hover tokens and gap 10 → 8 decided by the Owner 2026-09-26)
- Owner: Shutrly design system (Owner: hardi-dev)
- Last reviewed: 2026-09-26
- Pencil library: `docs/design-system/design-system.lib.pen` › **C05 — Checkbox** (`Ismz6`)
- Consumer references: forms, table row selection (tier 3)

## Purpose

Selects zero or more independent options, or confirms a single statement. Changes apply on Save. *Mixed* is for a parent ("Pilih semua") whose children are only partly selected.

## Anatomy

| # | Part | Layer name | Required | Description |
|---|---|---|---:|---|
| 1 | Row | root | Yes | Box plus label; the whole row is the click target. |
| 2 | Box | `Box` | Yes | 18 × 18; fill, outline and radius bound. |
| 3 | Mark | `Mark` | Checked/Mixed | 13 px lucide `check` or `minus`. |
| 4 | Label | `Label` | Yes | `font.size.body` / `font.weight.medium`. |

## Variants and properties

The private base is `_Checkbox/Base` (`vHs9u`), with layers `Box` `H419S`, `Mark` `Iqg2P` and `Label` `bnoVV`.

| Property | Figma type | Values / default | pen.dev mechanism |
|---|---|---|---|
| `value` | Variant | `unchecked`, `checked`, `mixed` / `unchecked` | component `Checkbox/<Value>/…` |
| `state` | Variant | `default`, `hover`, `focus`, `disabled` / `default` | component `…/<State>` |
| `label` | Text | `"WhatsApp"` | `descendants: { Label: { content } }` |

| Value \ State | Default | Hover | Focus | Disabled |
|---|---|---|---|---|
| Unchecked | `n8NmOH` | `rozLy` | `E7y0r` | `EALFb` |
| Checked | `H41tQ` | `XmGFb` | `pWYVC` | `ygHiA` |
| Mixed | `KHGFT` | `W8g3u` | `gUWnC` | `f7qzGp` |

## States

- **Hover:** unchecked → `checkbox.border-hover`; checked or mixed → `checkbox.background-checked-hover`.
- **Focus:** 2 px outer `focus.ring` on the box, plus the `focus.glow` halo.
- **Disabled:** `opacity.disabled` on the row; explain why nearby (*— belum tersedia*).
- **Error:** shown by the field group's error message (see Text field, tier 2), not by the box.

## Slots and content rules

- The label is short and sentence case, and names the option rather than giving an instruction.
- Group checkboxes under a field label: label ↔ group is 6 (`input.gap`), and items stack 8 apart (`space.2`).

## Token dependencies

| Component decision | Token path | Alias | Status |
|---|---|---|---|
| Box fill (unchecked) | `component.checkbox.background` | `surface.panel` | PERSISTED (added 2026-09-26) |
| Box outline | `component.checkbox.border` | `border.control` | PERSISTED |
| Box outline · hover | `component.checkbox.border-hover` | `border.control-hover` (new semantic: neutral.600 \| neutral.400) | PERSISTED (added 2026-09-26) |
| Box fill · checked | `component.checkbox.background-checked` | `action.primary` | PERSISTED |
| Box fill · checked hover | `component.checkbox.background-checked-hover` | `action.primary-hover` | PERSISTED (added 2026-09-26) |
| Mark | `component.checkbox.mark` | `action.on-primary` | PERSISTED |
| Label | `component.checkbox.label` | `text.primary` | PERSISTED (added 2026-09-26) |
| Radius | `component.checkbox.radius` | `radius.xs` (4) | PERSISTED |
| Gap (box ↔ label) | `component.checkbox.gap` | `space.2` (8) | PERSISTED (was 10, Owner 2026-09-26) |
| Focus | `color.semantic.focus.ring`, `focus.glow` | — | PERSISTED (semantic) |
| Disabled | `opacity.disabled` | 0.4 | PERSISTED |

The box is 18 × 18 and the mark 13 × 13; both are documented, not bound. The outline is 1.5 px.

## Usage-rule compliance

- **G3:** all parts bind `component.checkbox.*`.
- **G4:** the scan found no raw values.
- **SP1 / SP6:** whole steps (the gap is 8).
- **§5:** `radius.xs` for the checkbox.
- **§8:** the outline is ≥ 3 : 1.

## Accessibility

- Native `<input type=checkbox>`, or `role=checkbox` with `aria-checked` true, false or mixed. Space toggles.
- The label is the accessible name, and the whole row is clickable.
- The focus ring is never removed.
- Contrast: the outline (`border.control`) is ≥ 3 : 1; the mark on `action.primary` is 4.94 : 1.

## Usage guidance

- **Do:** use for several independent options.
- **Don't:** use checkboxes for one-of-many (use Radio), or for settings that apply instantly (use Switch).

## Implementation references

- Pencil: `C05 — Checkbox` (`Ismz6`), base `vHs9u`
- Rules: token-usage.md G3, G4, SP1, SP6, §2 *Borders*, §5, §8
