# Component: `<component-name>`

## Status and approval

- Lifecycle: `PROVISIONAL` | `OBSERVED` | `PROPOSED` | `APPROVED` | `PERSISTED` | `DEPRECATED`
- Direction/token approval: `PENDING` | `APPROVED`
- Owner: `<team or person>`
- Last reviewed: `<YYYY-MM-DD>`
- Pencil library: `docs/design-system/design-system.lib.pen`
- Pencil node/component ID: `<id>`
- Consumer references: `<feature files or none>`

Do not persist this component into the library until the visual direction and expanded token set are explicitly approved.

## Purpose

Describe what this component does and when it should be used.

## Anatomy

List the meaningful parts of the component. Keep names stable so design and code can refer to the same structure.

| Part | Required | Description |
|---|---:|---|
| `<part>` | Yes/No | `<role and behavior>` |

## Variants and properties

Use variants for meaningful visual or behavioral differences. Use properties for controlled content, visibility, instance swaps, or slots. Avoid a catch-all property with combined values.

| Property | Type | Values/default | Purpose |
|---|---|---|---|
| `size` | Variant | `sm`, `md`, `lg` / `md` | `<meaning>` |
| `state` | Variant | `default`, `hover`, `disabled` / `default` | `<meaning>` |
| `label` | Text | `<example>` | `<meaning>` |

## States

Document states required by the product and interaction model.

- Default:
- Hover:
- Focus-visible:
- Pressed/active:
- Disabled:
- Loading:
- Error:
- Empty or unavailable:

## Slots and content rules

- Allowed child content:
- Slot behavior:
- Maximum/minimum content:
- Text wrapping and overflow:
- Icon rules:

## Token dependencies

Reference approved token paths; do not duplicate raw values here. Mark each dependency `OBSERVED`, `PROPOSED`, `APPROVED`, or `PERSISTED` while the system is being developed.

Every reusable component needs component tokens for **colour, padding/gap and radius**. A component with colour tokens only fails verification. If a value comes from an observed legacy frame, snap it to the approved scale and record the original in Notes (for example `9 → 8`).

| Component decision | Token path | Status | Notes |
|---|---|---|---|
| Background | `component.button.primary.background` | `APPROVED` | `<theme/state notes>` |
| Text color | `component.button.primary.text` | `APPROVED` | `<contrast notes>` |
| Padding | `component.button.md.padding-x` / `-y` | `PERSISTED` | `<observed → snapped>` |
| Gap | `component.button.gap` | `PERSISTED` | icon ↔ label |
| Radius | `component.button.radius` | `PERSISTED` | inner ≤ outer radius |

Component heights such as a 40 px input are documented here, not bound: Pencil cannot bind `width`/`height` to variables.

## Usage-rule compliance

Cite the rules in `docs/design-system/token-usage.md` that this component relies on, for example G3 (component tokens), SP5 (component owns its spacing), SP6 (half-steps) and §4.2 inset type. List any optical exception (at most ±2 px) here, as §4.6 requires.

## Library and consumer rules

- Source component lives in `design-system.lib.pen`.
- Feature files must import the library and use linked instances.
- Do not copy geometry or detach instances unless the user explicitly approves an exception.
- Record any exception, local override, or broken-library-link finding.

## Accessibility

- Keyboard behavior:
- Focus treatment:
- Contrast requirements:
- Name/label requirements:
- Status and error announcements:
- Touch target requirements:

## Usage guidance

### Use when

- `<appropriate use>`

### Avoid when

- `<inappropriate use>`

### Do

- `<recommended practice>`

### Don't

- `<anti-pattern>`

## Implementation references

- Pencil component/file:
- Related code component:
- Related feature specs:
- Related business or accessibility rules:
- Design-system version/release:
