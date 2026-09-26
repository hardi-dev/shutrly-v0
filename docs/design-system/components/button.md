# Component: `Button`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (Owner: "saved, approved") — pilot; its pattern is the template for all library components
- Direction/token approval: `APPROVED` (tokens 2026-09-26 · rules 2026-09-26)
- Owner: Shutrly design system (Owner: hardi-dev)
- Last reviewed: 2026-09-26
- Pencil library: `docs/design-system/design-system.lib.pen` › top-level frame **C01 — Button** (`Q12x0F`)
- Pencil node/component IDs: see [Variants and properties](#variants-and-properties)
- Consumer references: none yet

## Local explorer

Run `pnpm storybook` and open **Primitives/Button** to explore the implemented React component,
its complete type × size matrix, icon controls, focus behavior, and light/dark themes. The static
HTML matrix is [c01-button.html](../exports/c01-button.html).

## Purpose

Triggers an action in the current view: save, create, send, confirm. Types: primary, secondary, danger (destructive confirms). Use a link for navigation. Each view region has **one** primary button (token-usage §2 *Action & focus*).

## Anatomy

| # | Part | Layer name | Required | Description |
|---|---|---|---:|---|
| 1 | Container | root | Yes | Fill, stroke, radius, padding and gap. Hugs its content. |
| 2 | Leading icon | `Icon leading` | No | 16 px lucide icon before the label: *what* the action is (plus, send). Boolean, **off** by default; icon can be swapped. |
| 3 | Label | `Label` | Yes | One line, `font.size.body` / `font.weight.semibold`. |
| 4 | Trailing icon | `Icon trailing` | No | 16 px lucide icon after the label: *where* it goes (arrow-right) or that it opens a menu (chevron-down). Boolean, **off** by default; icon can be swapped. |

## Variants and properties

pen.dev has no component sets or variant properties, so:

- **Variant axes** are one reusable component per combination, named `Button/<Type>/<Size>/<State>`.
- The axes are repeated in each component's `context` and in `pencil-mapping.json › components.button`. pen.dev drops `metadata` on instance nodes, so it can't hold them.
- Every variant is an **instance of the private base** `_Button/Base` (`s93Zz0`). Structure changes happen once, in the base, and all variants inherit them.

| Property | Figma type | Values / default | pen.dev mechanism |
|---|---|---|---|
| `type` | Variant | `primary`, `secondary`, `danger` (added 2026-09-26) / `primary` | component `Button/<Type>/…` |
| `size` | Variant | `md`, `lg` / `md` | padding → `button.<size>.padding-*` |
| `state` | Variant | `default`, `hover`, `focus`, `disabled` / `default` | component `…/<State>` |
| `iconLeading` | Boolean | `false` | `descendants: { "Icon leading": { enabled: true } }` |
| `iconLeadingName` | Instance swap | `plus` | `descendants: { "Icon leading": { icon: "send" } }` |
| `iconTrailing` | Boolean | `false` | `descendants: { "Icon trailing": { enabled: true } }` |
| `iconTrailingName` | Instance swap | `chevron-down` | `descendants: { "Icon trailing": { icon: "arrow-right" } }` |
| `label` | Text | `"Simpan"` | `descendants: { Label: { content: "…" } }` |

| Component | ID | Size (px) |
|---|---|---|
| `_Button/Base` (private) | `s93Zz0` | — |
| `Button/Primary/MD/Default` | `Q49yf7` | h 42 |
| `Button/Primary/MD/Hover` | `G4eW8p` | h 42 |
| `Button/Primary/MD/Focus` | `hEMFc` | h 42 |
| `Button/Primary/MD/Disabled` | `lBKcT` | h 42 |
| `Button/Primary/LG/Default` | `aBT7T` | h 50 |
| `Button/Primary/LG/Hover` | `Ye7Xm` | h 50 |
| `Button/Primary/LG/Focus` | `p9KLdp` | h 50 |
| `Button/Primary/LG/Disabled` | `V8sGx` | h 50 |
| `Button/Secondary/MD/Default` | `JmfmZ` | h 42 |
| `Button/Secondary/MD/Hover` | `p7DaJb` | h 42 |
| `Button/Secondary/MD/Focus` | `UCgbC` | h 42 |
| `Button/Secondary/MD/Disabled` | `iQ7e5` | h 42 |
| `Button/Secondary/LG/Default` | `c3U6N` | h 50 |
| `Button/Secondary/LG/Hover` | `ZuSbE` | h 50 |
| `Button/Secondary/LG/Focus` | `fg9QG` | h 50 |
| `Button/Secondary/LG/Disabled` | `nqNHl` | h 50 |

## States

- **Default:** as specified.
- **Hover:** primary uses `button.primary.background-hover`; secondary uses `button.secondary.background-hover` (`surface.sunken`, added 2026-09-26) and keeps its border.
- **Focus-visible:** 2 px outer `focus.ring` plus the `focus.glow` halo. pen.dev can't draw a ring *offset*; code adds `outline-offset: 2px`, so the ring stays visible against the primary blue.
- **Pressed/active:** same as hover (token-usage §2: "hover/pressed state of the same element only").
- **Disabled:** `opacity.disabled` (0.4) on the whole button; not focusable.
- **Loading:** not designed (GAP-02).
- **Error / empty:** not applicable.

## Slots and content rules

- No slot. The content is fixed: an optional leading icon, the label, and an optional trailing icon. At most one icon per side.
- The label is one line, sentence case, verb first (*Simpan*, *Kirim tautan*, *Proyek baru*). No end punctuation.
- **Too much:** the button hugs its label and never truncates or wraps; shorten the copy instead. Tested with 5 words (*Kirim tautan galeri ke klien*).
- **Too little:** never an empty button, and never icon-only. An icon button needs its own component (out of scope).
- **Icons:** lucide, 16 px, same colour as the label. Swap the icon, never recolour it.

## Token dependencies

| Component decision | Token path | Alias → light / dark | Status |
|---|---|---|---|
| Primary background | `component.button.primary.background` | `action.primary` → `#2F5BFF` / `#2F5BFF` | PERSISTED |
| Primary hover | `component.button.primary.background-hover` | `action.primary-hover` → `#1F55E0` / `#1F55E0` | PERSISTED |
| Primary label + icon | `component.button.primary.text` | `action.on-primary` → `#FFFFFF` / `#FFFFFF` | PERSISTED |
| Secondary background | `component.button.secondary.background` | `surface.panel` → `#FFFFFF` / `#18181B` | PERSISTED |
| Secondary hover | `component.button.secondary.background-hover` | `surface.sunken` → `#F4F4F5` / `#1F1F23` | PERSISTED (added 2026-09-26) |
| Secondary border | `component.button.secondary.border` | `border.default` → `#E4E4E7` / `#27272A` | PERSISTED |
| Secondary label + icon | `component.button.secondary.text` | `text.primary` → `#18181B` / `#FAFAFA` | PERSISTED |
| Danger background | `component.button.danger.background` | `status.danger.solid` → `#DC2626` / `#F87171` | PERSISTED (2026-09-26) |
| Danger hover | `component.button.danger.background-hover` | `status.danger.solid-hover` → `#B91C1C` / `#FCA5A5` | PERSISTED (2026-09-26) |
| Danger label + icon | `component.button.danger.text` | `status.danger.on-solid` → `#FFFFFF` / `#09090B` | PERSISTED (2026-09-26) |
| Padding MD | `component.button.md.padding-y` / `-x` | `space.3` / `space.9` → 12 / 36 — 3:1 (was 10 / 16; amended 2026-09-26) | PERSISTED |
| Padding LG | `component.button.lg.padding-y` / `-x` | `space.4` / `space.12` → 16 / 48 — 3:1 (was 12 / 24; amended 2026-09-26) | PERSISTED |
| Gap (icons ↔ label) | `component.button.gap` | `space.2` → 8 | PERSISTED |
| Radius | `component.button.radius` | `radius.full` → pill | PERSISTED |
| Focus ring | `color.semantic.focus.ring` | → `#2F5BFF` (2 px) | PERSISTED (semantic; no component alias) |
| Focus halo | `color.semantic.focus.glow` | → `#2F5BFF40` / `#2F5BFF66` | PERSISTED (semantic) |
| Disabled | `opacity.disabled` | 0.4 | PERSISTED |
| Label type | `font.size.body`, `font.weight.semibold`, `font.family.base` | 14 / 600 / Plus Jakarta Sans | PERSISTED |

Heights are documented, not bound (Pencil can't bind `width`/`height`): MD 42 px, LG 50 px.

## Usage-rule compliance

- **G3:** every colour, padding, gap and radius binds `component.button.*`. Focus and disabled use semantic tokens because no component alias exists.
- **G4:** no raw values. The canvas scan found 0 raw colours, 0 primitives and 0 broken references.
- **SP5:** internal padding is owned by the component; screens never override it.
- **SP1 / SP6:** whole steps only. Padding was 10/16; amended 2026-09-26 to a 3:1 squish (12/36, 16/48). `space.9` = 36 was added to the scale for this.
- **§4.2:** squish inset at 3:1 (12/36, 16/48).
- **§5:** `radius.full` for buttons.
- **§4.6 optical exceptions:** none.

## Library and consumer rules

- The source components live in `design-system.lib.pen` › **C01 — Button**.
- Screens use instances of `Button/<Type>/<Size>/Default` and change only `Label` and the `enabled` / `icon` of `Icon leading` and `Icon trailing`.
- Never instance `_Button/Base` in a screen. Never detach, and never override the fill, padding or radius of an instance.
- Hover, focus and disabled variants are for specs and prototypes; in code they are states of one component.

## Accessibility

- **Keyboard:** role `button`; activates on Enter and Space.
- **Focus:** `focus.ring` is always visible on keyboard focus and is never removed.
- **Contrast:**
  - The primary label is 4.94 : 1 in both modes.
  - The secondary label uses `text.primary` on `surface.panel`.
  - The secondary border (`border.default`) is below 3 : 1. This is accepted because the label, not the border, identifies the control (WCAG 1.4.11 applies only to boundaries that are needed to identify the control).
- **Name:** the label text. Icons are decorative (`aria-hidden`). A trailing chevron means the button opens a menu: add `aria-haspopup` and `aria-expanded`.
- **Disabled:** prefer explaining why an action is unavailable over disabling the button. Never put a tooltip on a disabled button (Atlassian).
- **Touch:** MD 42 px is for the owner web app. On the client gallery (mobile) use LG (50 px) for a ≥ 44 px target (SP11).

## Usage guidance

### Use when

- An action happens in place (save, create, send, confirm, cancel).

### Avoid when

- Navigating to another page: use a link.
- Decorating something: `action.primary` is for interactive elements only.

### Do

- Use one primary per region, with secondary for the alternative (e.g. *Batal* + *Simpan*).
- **Danger** (`Button/Danger/<Size>/<State>`, Owner 2026-09-26) only confirms a destructive, irreversible action, usually in a Modal confirm, where it takes the primary's place. Its label repeats the verb (*Hapus proyek*), never *Ya* / *OK*. Contrast: white on `#DC2626` 4.83 : 1; `#09090B` on `#F87171` in dark.
- Right-align actions in dialogs and forms.

### Don't

- Put two primaries side by side.
- Use icon-only buttons with this component.
- Override colours on an instance.

## Component review (EightShapes checklist, 2026-09-26)

| Area | Result |
|---|---|
| Metadata | Names `Button/Type/Size/State`; `context` on all 17; `metadata` not supported on instances (the registry in `pencil-mapping.json` carries the props) |
| Anatomy | Layer names `Icon leading`, `Label`, `Icon trailing`; icons hidden by default |
| Colour | 100 % bound to variables; no primitives |
| Text styles | family, size and weight bound (composite type styles are split, per `unsupported.typography`) |
| Properties | order type → size → state; defaults primary / md / default |
| Content | short, typical, 5-word, leading icon, icon swap, trailing chevron and trailing arrow cases pass without truncation |
| Layout | hug width; padding and gap bound; heights 42 / 50 |
| Composition | none (no nested components) |
| Behaviours | hover, focus, disabled built for both types; pressed = hover; loading is a gap (GAP-02) |

## Implementation references

- Pencil: `design-system.lib.pen` › `C01 — Button` (`Q12x0F`), base `s93Zz0`
- Code component: `src/ui/primitives/button/button.tsx`, C01 type × size × state matrix
- Related rules: token-usage.md G3, G4, SP5, SP6, SP11, §2 *Action & focus*, §4.2, §5, §8
- Research: Figma Help Center (variants, component properties, slots), Figma *Creating and organizing variants*, EightShapes *Component Specifications* and *The Figma Component Review*, Atlassian Button, Primer Button
- Design-system version: unreleased
