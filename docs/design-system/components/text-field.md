# Component: `Text Field`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (Owner: "approved" — review of C02–C26). Previously `PROPOSED` (tier 2, 2026-09-26 — awaiting Owner review)
- Direction/token approval: `APPROVED` (uses existing `component.input.*`)
- Pencil library: `design-system.lib.pen` › **C18 — Text field** (`P42vwq`)
- Consumers: every form; the trigger field of Select (C19) and Multi-select (C20)

## Local explorer

Run `pnpm storybook` and open **Primitives/TextField** to explore the implemented React component,
its complete state matrix, C03 configurations, helper/error states, controlled input behavior, and
light/dark themes. The static HTML matrix is [c18-text-field.html](../exports/c18-text-field.html).

## Purpose

A complete form field: a visible label, the Input box (C03), and a helper or error message. Input is only the box. Text field is what forms use, because a field must always have a visible label (the GAP-06 mitigation).

The nested Input uses the shared [Icon](icon.md) registry for leading/trailing icons and forwards icon actions, including password visibility controls.

## Anatomy

| # | Part | Layer name | Required | Description |
|---|---|---|---:|---|
| 1 | Container | root | Yes | Vertical stack, 320 wide (fill in forms), gap `input.gap` (6). |
| 2 | Label row | `Label row` | Yes | `Label` (label 12/600, `input.label`) + `Optional` suffix "(opsional)" in `input.helper`, off by default. Row gap `space.1`. |
| 3 | Input | `Input` | Yes | Nested **Input/Default/Default** (C03) instance, `fill_container`. |
| 4 | Message | `Message` | No | `Message icon` (circle-alert, error only) + `Helper` (label 12/400). Icon ↔ text gap `input.content-gap` (8). |

## Variants and properties

The private base is `_TextField/Base` (`TFmAG`), with layers `Label row` `OjQDs`, `Label` `Gmk0c`, `Optional` `RsEBb`, `Input` `c67yIW`, `Message` `i0umVC`, `Message icon` `I0aOa6` and `Helper` `uh4XA`.

| State | Component | Nested Input receives |
|---|---|---|
| Default | `Text Field/Default` `HHNPk` | — |
| Hover | `Text Field/Hover` `Feq2q` | `input.border-hover` |
| Focus | `Text Field/Focus` `mZcc4` | 2 px `input.border-focus` + `focus.glow`, filled value |
| Error | `Text Field/Error` `AVpMa` | 2 px `input.border-error`, trailing circle-alert; message icon on, helper in `input.error-text` |
| Disabled | `Text Field/Disabled` `Q64HTj` | `input.background-disabled`, `input.border-disabled`, value in `input.text-disabled`; label and helper in `input.text-disabled` |

| Property | Type | Mechanism |
|---|---|---|
| `label` | Text | `descendants: { Gmk0c: { content } }` |
| `optional` | Boolean | `descendants: { RsEBb: { enabled:true } }` |
| `helper` | Text | `descendants: { uh4XA: { content } }`; hide the whole message with `i0umVC: { enabled:false }` |
| `placeholder` / `value` | Text (nested) | `"c67yIW/tvTDd"` / `"c67yIW/CykHo"` (turn the Placeholder off and the Value on) |
| Input booleans | Boolean (nested) | `"c67yIW/MePi8"` prefix, `"c67yIW/Qp2xi"` trailing icon, `"c67yIW/VnKAn"` leading icon |

### Composite pattern: a stable nested instance

The state variants **don't swap** the nested Input for another Input variant. Swapping the nested ref gives it a new ID in every variant, which breaks instance overrides such as `c67yIW/CykHo` when a screen changes state. Instead, each variant re-applies the matching Input state's token overrides to the one nested Input `c67yIW`. The overrides are tokens only, so they stay in sync through the token pipeline; structural changes to `_Input/Base` still flow through. This is the pattern for every tier 2 composite.

## Content

- The label says *what* (a noun, sentence case). The helper says *why* or *how*, in one short sentence.
- The error **replaces** the helper and says how to fix it (*Masukkan email yang valid, mis. rina@studio.id*). Never show a helper and an error together.
- Mark optional fields with "(opsional)". Don't use a required asterisk.

## Token dependencies

`input.label`, `input.helper`, `input.error-text`, `input.text-disabled`, `input.gap` (6), `input.content-gap` (8), `space.1` (label ↔ optional), plus everything Input binds.

## Usage-rule compliance

- **G3:** component tokens only. `space.1` is used for the label ↔ suffix gap, because no component alias exists.
- **SP3 / SP6:** field anatomy 6 (a half-step inside a small component) is less than 16 between fields.
- **§8 / GAP-06:** the visible label, the 40 px height and the 2 px focus and error borders make up for the 1.5 : 1 input border.

## Accessibility

- A `<label for>` on every field; the placeholder is never the accessible name.
- The helper and error are linked with `aria-describedby`. An error sets `aria-invalid=true`; on submit, errors are announced.
- An error is never shown by colour alone: it has a border, an icon and text.
- Disabled fields are skipped by Tab. Prefer read-only text when the value can't change.

## Implementation references

- Pencil: `C18 — Text field` (`P42vwq`), base `TFmAG`
- Code component: `src/ui/primitives/text-field/text-field.tsx` composed from `src/ui/primitives/input/input.tsx`
- Rules: token-usage.md G3, SP3, SP4, SP6, §8
