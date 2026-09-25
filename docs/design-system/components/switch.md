# Component: `Switch`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (Owner: "approved" — review of C02–C26). Previously `PROPOSED` (tier 1, 2026-09-26 — awaiting Owner review)
- Direction/token approval: `APPROVED` (tokens and rules 2026-09-26; hover, gap, padding, radius and label tokens added by Owner decision 2026-09-26)
- Owner: Shutrly design system (Owner: hardi-dev)
- Last reviewed: 2026-09-26
- Pencil library: `docs/design-system/design-system.lib.pen` › **C07 — Switch** (`PEqub`)
- Consumer references: gallery settings (download, watermark, price visibility)

## Purpose

Turns a single setting on or off, and the change takes effect immediately (no Save). The label on the left names the setting, and the track on the right shows its state (the legacy layout the Owner curated).

## Anatomy

| # | Part | Layer name | Required | Description |
|---|---|---|---:|---|
| 1 | Row | root | Yes | Label plus track; its width is set by the instance (default 220, `fill_container` in settings lists). |
| 2 | Label | `Label` | Yes | Fixed width, fills the row and wraps if long. `font.size.body` / `font.weight.medium`. |
| 3 | Track | `Track` | Yes | 36 × 20 pill. Knob at the start = off, at the end = on. |
| 4 | Knob | `Knob` | Yes | 16 px ellipse. |

## Variants and properties

The private base is `_Switch/Base` (`i26Za`), with layers `Label` `oq6nY`, `Track` `nyXXN` and `Knob` `KiRAj`.

| Property | Figma type | Values / default | pen.dev mechanism |
|---|---|---|---|
| `value` | Variant | `off`, `on` / `off` | component `Switch/<Value>/…` (track fill + knob position) |
| `state` | Variant | `default`, `hover`, `focus`, `disabled` / `default` | component `…/<State>` |
| `label` | Text | `"Izinkan unduhan"` | `descendants: { Label: { content } }` |

| Value \ State | Default | Hover | Focus | Disabled |
|---|---|---|---|---|
| Off | `oSTqI` | `bOH3M` | `RqUsV` | `i8Ddp` |
| On | `zSBcA` | `E6JzR` | `TQqH5` | `HU4S7` |

## States

- **Hover:** `switch.track-off-hover` or `switch.track-on-hover`.
- **Focus:** a 2 px outer `focus.ring` on the track, plus `focus.glow`.
- **Disabled:** `opacity.disabled`.
- **Loading:** if saving is slow, keep the new position and show progress elsewhere (not designed; GAP-02).

## Slots and content rules

- Name the setting positively (*Izinkan klien mengunduh*, not *Nonaktifkan unduhan*).
- Long labels wrap, and the track stays vertically centred.
- In a settings list, stack switches 16 apart (`space.4`).

## Token dependencies

| Component decision | Token path | Alias | Status |
|---|---|---|---|
| Track · on | `component.switch.track-on` | `action.primary` | PERSISTED |
| Track · on hover | `component.switch.track-on-hover` | `action.primary-hover` | PERSISTED (added 2026-09-26) |
| Track · off | `component.switch.track-off` | `control.track-off` | PERSISTED |
| Track · off hover | `component.switch.track-off-hover` | `control.track-off-hover` (new semantic: neutral.400 \| neutral.600) | PERSISTED (added 2026-09-26) |
| Knob | `component.switch.knob` | `control.knob` | PERSISTED |
| Label | `component.switch.label` | `text.primary` | PERSISTED (added 2026-09-26) |
| Knob inset | `component.switch.padding` | `space.0-5` (2) | PERSISTED (added 2026-09-26) |
| Label ↔ track | `component.switch.gap` | `space.2` (8) | PERSISTED (added 2026-09-26) |
| Radius | `component.switch.radius` | `radius.full` | PERSISTED (added 2026-09-26) |

The track (36 × 20) and knob (16) are documented, not bound.

## Usage-rule compliance

- **G3:** every part binds `component.switch.*`.
- **SP6:** the half-step `space.0-5` is used only for the knob inset, inside a small component.
- **§5:** `radius.full` for the switch.

## Accessibility

- `role=switch` with `aria-checked`; Space toggles. The label is the accessible name, and the whole row is clickable.
- The state isn't shown by colour alone: the knob position carries it.
- **Contrast exception:** the off track (neutral.300) on white is below 3 : 1; the knob position is the indicator. The on track is 4.94 : 1 with a white knob.
- On the client gallery, pad the row so the target is ≥ 44 px (SP11).

## Usage guidance

| Situation | Use |
|---|---|
| Applies instantly | **Switch** |
| Applied on Save | Checkbox |
| One of several | Radio |

Never use a switch for a destructive action.

## Implementation references

- Pencil: `C07 — Switch` (`PEqub`), base `i26Za`
- Rules: token-usage.md G3, SP6, SP11, §5, §8
