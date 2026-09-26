# Component: `Input`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (Owner: "approved" — review of C02–C26). Previously `PROPOSED` (tier 1b, 2026-09-26 — awaiting Owner review)
- Direction/token approval: `APPROVED` (tokens and rules 2026-09-26; `input.search.background` and `input.text-disabled` added 2026-09-26)
- Owner: Shutrly design system (Owner: hardi-dev)
- Last reviewed: 2026-09-26
- Pencil library: `docs/design-system/design-system.lib.pen` › **C03 — Input** (`YcyAG`)
- Consumer references: Text field (tier 2), table search, app header search

## Purpose

The editable box only, with no label or helper text; Text field (tier 2) adds those. One base covers text, prefix (Rp), password, select, date and search by switching optional parts on and off. Search is its own type because its fill is different.

## Local explorer

Run `pnpm storybook` and open **Primitives/Input** to explore the default/search variants,
configurations, and states. The static HTML matrix is [c03-input.html](../exports/c03-input.html).

## Anatomy

| # | Part | Layer name | Required | Description |
|---|---|---|---:|---|
| 1 | Container | root | Yes | 40 px high (documented); fill, border, radius and padding-x bound. |
| 2 | Leading icon | `Icon leading` | No | 16 px semantic Icon (for example `search`), `input.placeholder` colour. |
| 3 | Prefix | `Prefix` | No | Unit text such as "Rp". |
| 4 | Placeholder | `Placeholder` | One of 3/5 | An example value in `input.placeholder`. |
| 5 | Value | `Value` | One of 3/5 | The entered text, in `input.text`. |
| 6 | Trailing icon | `Icon trailing` | No | Semantic Icon: `chevron-down` (select), `calendar` (date), `eye` (password), `circle-alert` (error). |
| 7 | Shortcut | `Shortcut` | No | Nested **Kbd** (C17) instance, e.g. ⌘K. |

## Variants and properties

The private base is `_Input/Base` (`kWK5j`), with layers `Icon leading` `VnKAn`, `Prefix` `MePi8`, `Placeholder` `tvTDd`, `Value` `CykHo`, `Icon trailing` `Qp2xi` and `Shortcut` `UFzsV`.

| Property | Figma type | Values / default | pen.dev mechanism |
|---|---|---|---|
| `type` | Variant | `default`, `search` | component `Input/<Type>/…` |
| `state` | Variant | `default`, `hover`, `focus`, `error`, `disabled` (search: first 3) | component `…/<State>` |
| `iconLeading`, `prefix`, `iconTrailing`, `shortcut` | Boolean | `false` | `descendants: { <layer>: { enabled } }` |
| `filled` | Boolean | `false` | Placeholder `enabled:false` + Value `enabled:true` |
| `placeholder`, `value`, `prefix` | Text | — | `descendants: { <layer>: { content } }` |
| `iconLeadingName`, `iconTrailingName` | Instance swap | `search`, `chevron-down` | `descendants: { <icon>: { icon } }` |

| Type \ State | Default | Hover | Focus | Error | Disabled |
|---|---|---|---|---|---|
| Default | `lJ39W` | `J0Hpih` | `Hx4Lp` | `XCIEx` | `KibRB` |
| Search | `vmSeU` | `pRtA5` | `rzXbh` | — | — |

**Configurations** (presets drawn on the canvas, not separate components): filled, prefix (*Harga paket*), password, select (*Layanan*), date (*Tanggal sesi*) and search in a table.

## States

- **Hover:** `input.border-hover`.
- **Focus:** a 2 px `input.border-focus`, plus `focus.glow`.
- **Error:** a 2 px `input.border-error`, plus a trailing `circle-alert` in `input.error-text`. The message comes from Text field.
- **Disabled:** `input.background-disabled`, `input.border-disabled` and `input.text-disabled`.

## Token dependencies

| Part | Token |
|---|---|
| Fill | `input.background` (search: `input.search.background` → `surface.subtle`; disabled: `input.background-disabled`) |
| Border | `input.border` / `-hover` / `-focus` / `-error` / `-disabled` |
| Text | `input.text`; `input.placeholder` (also icons and prefix); `input.text-disabled`; `input.error-text` |
| Spacing | `input.padding-x` (12); `input.content-gap` (8) |
| Radius | `input.radius` (8) |

The height of 40 is documented (`input.height` exists as a number token; Pencil can't bind height).

## Usage-rule compliance

- **G3:** every part binds a component token.
- **SP1:** whole steps.
- **§4.2:** input 0/12 at 40 px.
- **§8 / GAP-06:** `border.input` is below 3 : 1. This is accepted, with visible labels, the 40 px height and 2 px focus/error borders as mitigation.

## Accessibility

- Always paired with a visible label (Text field); a placeholder is not a label.
- An error is never shown by colour alone: an icon and a message go with it.
- The password eye is a ghost Icon button with `aria-label` and `aria-pressed`.
- Icon mappings come from the shared [Icon](icon.md) Hugeicons Free registry; actions are labelled buttons around the icon.
- Search uses `role=searchbox` and `aria-keyshortcuts` when the shortcut is shown.

## Implementation references

- Pencil: `C03 — Input` (`YcyAG`), base `kWK5j`
- Code component: `src/ui/primitives/input/input.tsx`
- Shared icon primitive: `src/ui/primitives/icon/icon.tsx`
- Rules: token-usage.md G3, SP1, §4.2, §8 (GAP-06)
