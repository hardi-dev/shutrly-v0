# Component: `Stage Chip`

## Status and approval

- Lifecycle: `PROPOSED` (tier 1, 2026-09-26 — awaiting Owner review)
- Direction/token approval: `APPROVED` (tokens and rules 2026-09-26)
- Owner: Shutrly design system (Owner: hardi-dev)
- Last reviewed: 2026-09-26
- Pencil library: `docs/design-system/design-system.lib.pen` › **C12 — Stage chip** (`uofHz`)
- Consumer references: Table row (tier 3), timeline, project cards

## Purpose

Shows a project's production stage. The stage-to-colour mapping is fixed (token-usage §2 *Status*). The chip is non-interactive and always shows a dot plus a label, never colour alone.

## Anatomy

| # | Part | Layer name | Required | Description |
|---|---|---|---:|---|
| 1 | Container | root | Yes | Pill; fill, padding and gap bound. Hugs its content. |
| 2 | Dot | `Dot` | Yes | 6 px ellipse in the stage's text colour. |
| 3 | Label | `Label` | Yes | Stage name, `font.size.caption` / `font.weight.semibold`. |

## Variants and properties

One axis, `stage`, in workflow order. There's a private base, `_StageChip/Base` (`oL43h`, layers `Dot` `L9XA7y` and `Label` `SD1o7`), and every variant is an instance of it.

| Property | Figma type | Values / default | pen.dev mechanism |
|---|---|---|---|
| `stage` | Variant | `awaiting-deposit`, `scheduled`, `shooting`, `editing`, `delivered` | component `Stage Chip/<Label>` |
| `label` | — (fixed) | set by the variant | not overridable: the label *is* the stage |

| Component | ID | Stage → role |
|---|---|---|
| `Stage Chip/Menunggu DP` | `i9SFm` | awaiting-deposit → danger |
| `Stage Chip/Dijadwalkan` | `LQGDd` | scheduled → info |
| `Stage Chip/Pemotretan` | `w9aTAe` | shooting → accent.soft |
| `Stage Chip/Editing` | `ZVQLe` | editing → warning |
| `Stage Chip/Terkirim` | `wAja0` | delivered → success |

## States

Static only. There is no hover, focus or disabled state, because the chip isn't interactive. To change a stage, put a menu button next to the chip.

## Slots and content rules

- The label is fixed per variant (id-ID). Never free text, and never truncated. The longest label, *Menunggu DP*, fits the 130 px *Tahap* table column.
- One chip per row or card.

## Token dependencies

| Component decision | Token path | Status |
|---|---|---|
| Background per stage | `component.chip.stage.<stage>.background` | PERSISTED |
| Dot + label per stage | `component.chip.stage.<stage>.text` | PERSISTED |
| Padding | `component.chip.stage.padding-y` / `-x` → `space.0-5` / `space.2` (2 / 8) | PERSISTED |
| Gap (dot ↔ label) | `component.chip.stage.gap` → `space.1-5` (6) | PERSISTED |
| Radius | `component.chip.stage.radius` → `radius.full` | PERSISTED |
| Label type | `font.size.caption`, `font.weight.semibold` | PERSISTED |

The dot is 6 × 6 and the height is about 19 px; both are documented, not bound.

## Usage-rule compliance

- **G3:** everything binds `component.chip.stage.*`.
- **G4:** the scan found no raw values.
- **SP6:** the half-steps (2 and 6) are allowed, because chips are in SP6's list.
- **§4.2:** squish inset (2 / 8).
- **§5:** `radius.full`.
- **§2 Status:** the mapping is fixed. **§7:** the dark status backgrounds already include `opacity.status-tint`.

## Accessibility

- The label text carries the meaning; colour is never the only signal.
- Each `<stage>.text` on its `<stage>.background` is ≥ 4.5 : 1 in both modes (board 02).
- Not focusable; screen readers read it as plain text, with the column header as context.

## Usage guidance

- **Do:** use the variant that matches the stage.
- **Don't:** relabel a variant (the colour would no longer mean the stage), use chips for categories or tags, or make the chip clickable.

## Implementation references

- Pencil: `C12 — Stage chip` (`uofHz`), base `oL43h`
- Code: `components/ui/stage-chip` (not built)
- Rules: token-usage.md G3, G4, SP6, §2 *Status*, §4.2, §5, §7, §8
