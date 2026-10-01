# Component: `Status Chip`

## Status and approval

- Lifecycle: `APPROVED` 2026-10-01. The Owner generalised C12 *Stage Chip* into *Status Chip* for F-04 and later features, and approved the `component.chip.status.*` tokens ("approve token"). The Stage Chip variants were approved 2026-09-26 and are kept as presets.
- Pencil library: `design-system.lib.pen` › **C12 — Status chip** (`uofHz`)
- Consumers: F-04 source rows (*Aktif* / *Nonaktif*) and the provider options (*Segera hadir*); project stage cells and cards (Stage presets). Expected: F-05 service status, F-08 team, F-09 sync state, F-14 invoice status.

## Purpose

A short, non-interactive status label with a tone. The meaning is always in the label text; the tone and dot only support it.

## Anatomy

| # | Part | Layer | Required | Description |
|---|---|---|---:|---|
| 1 | Container | root | Yes | Pill; hugs its content. Fill, padding, gap and radius are bound. |
| 2 | Dot | `Dot` (`L9XA7y`) | No (on by default) | 6 px ellipse in the tone's text colour. |
| 3 | Label | `Label` (`SD1o7`) | Yes | `font.size.caption` / `font.weight.semibold`, in the tone's text colour. |

The private base is `_StatusChip/Base` (`oL43h`), formerly `_StageChip/Base` with the same ID, so existing instances stay linked.

## Variants and properties

| Property | Values / default | pen.dev mechanism |
|---|---|---|
| `tone` | `success`, `info`, `warning`, `danger`, `accent`, `neutral` | component `Status Chip/<Tone>` |
| `label` | short text (id-ID), required | override `SD1o7.content` |
| `dot` | on (default) / off | override `L9XA7y.enabled` |

| Component | ID | Use for |
|---|---|---|
| `Status Chip/Success` | `GyfYn` | active, done, paid |
| `Status Chip/Info` | `D7LAk7` | scheduled, informational state |
| `Status Chip/Warning` | `g26Cg6` | needs attention |
| `Status Chip/Danger` | `l0akB` | failed, overdue |
| `Status Chip/Accent` | `h4md7` | in production / in progress |
| `Status Chip/Neutral` | `w7OAR` | inactive, unavailable; with the dot off for *Segera hadir* |

### Stage presets

Project stages keep fixed labels and their own `component.chip.stage.*` tokens, which alias the same semantic colours as the matching tone:

| Preset | ID | Tone |
|---|---|---|
| `Stage Chip/Menunggu DP` | `i9SFm` | danger |
| `Stage Chip/Dijadwalkan` | `LQGDd` | info |
| `Stage Chip/Pemotretan` | `w9aTAe` | accent |
| `Stage Chip/Editing` | `ZVQLe` | warning |
| `Stage Chip/Terkirim` | `wAja0` | success |

A preset's label is the stage name and is never edited; use a Status Chip for anything else.

## States

Static only: no hover, focus or disabled state, because the chip isn't interactive. To change a status, put a menu button next to the chip.

## Content rules

- Labels are 1–2 words, sentence case, never truncated.
- Choose the tone by meaning (token-usage §2 *Status*), not by look.
- Hide the dot only where the chip marks availability rather than a state (*Segera hadir*).
- One status chip per row or card.

## Token dependencies

| Decision | Token | Status |
|---|---|---|
| Background per tone | `component.chip.status.<tone>.background` | PERSISTED 2026-10-01 |
| Dot + label per tone | `component.chip.status.<tone>.text` | PERSISTED 2026-10-01 |
| Padding | `component.chip.status.padding-y` / `-x` → `space.0-5` / `space.2` | PERSISTED 2026-10-01 |
| Gap | `component.chip.status.gap` → `space.1-5` | PERSISTED 2026-10-01 |
| Radius | `component.chip.status.radius` → `radius.full` | PERSISTED 2026-10-01 |
| Stage presets | `component.chip.stage.<stage>.*` (unchanged) | PERSISTED 2026-09-26 |
| Label type | `font.size.caption`, `font.weight.semibold` | PERSISTED |

Component tokens may not alias other component tokens (validator layer rule), so `chip.stage.*` aliases semantic colours directly.

## Accessibility

- Meaning is carried by the label, never colour alone (C-008).
- Every tone's text on its background is ≥ 4.5:1 in both modes. Neutral uses `text.secondary` on `surface.muted`: 6.09:1 light, 7.1:1 dark.
- Read as plain text. Give context through the column header or the row's accessible name (e.g. "Google Drive Utama, Aktif").

## Implementation references

- Pencil: C12 (`uofHz`), base `oL43h`
- Tokens: `component.chip.status.*`, `component.chip.stage.*`
- Rules: `token-usage.md` G1, G3, G5, §2 *Status*
- Code: not built yet. Planned in F-04 (`src/ui/primitives/status-chip`).
