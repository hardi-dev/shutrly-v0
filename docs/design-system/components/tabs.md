# Component: `Tabs`

## Status and approval

- Lifecycle: `APPROVED` 2026-10-02. Explored in `exploration.pen` board 12 (Option A2), used locally in F-05, then promoted (Owner: "follow your suggestion").
- Pencil library: `design-system.lib.pen` › **C45 — Tabs** (`Pu7zm`)
- Consumers: F-05 *Layanan* (Layanan · Kategori · Item paket), through Page Header/Tabs. Expected: project detail, settings.

## Purpose

Underline tabs switch between sibling views of one page. On desktop and tablet, attach them to the Page Header with **Page Header/Tabs** (C40). On phones, use **Segmented Control/Full width** (C23) as the first item in the content instead (Owner 2026-10-02). To switch the view of a single card, use a Segmented Control in the Section Card header (C43).

## Anatomy

| # | Part | Layer | Required | Description |
|---|---|---|---:|---|
| 1 | Tab | `_Tab/Base` (`siG3p`) | Yes | Label only; padding `item.padding-y` top and bottom, no side inset, square corners (so the underline ends square). |
| 2 | Label | `Label` (`DnAdt`) | Yes | Body 14; medium, or bold when active. |
| 3 | Tabs row | `Tabs` (`NSzy3`) | — | Standalone row with a 1 px bottom track; **Items** slot `RLhnh`, gap `tabs.gap`. |

## Variants

| Component | ID | Label | Indicator |
|---|---|---|---|
| `Tab/Default` | `M43F7D` | `item.text`, medium | — |
| `Tab/Hover` | `WLfdt` | `item.text-hover`, medium | — |
| `Tab/Active` | `WbyBE` | `item.text-active`, bold | 2 px bottom `item.indicator` (inner) |
| `Tab/Focus` | `DLhzi` | `item.text`, medium | 2 px outline `item.focus`, radius `item.radius` |
| `Tabs` | `NSzy3` | Items slot: one Tab/Active plus Tab/Default | 1 px bottom `tabs.track` |

## Behaviour and layout

- Exactly one tab is active, and the page's primary action may change with it (F-05: *Tambah layanan* / *Tambah kategori* / *Tambah item*).
- Inside Page Header/Tabs the tab row starts under the title (`page-header.tabs.padding-x`), and the header's bottom border acts as the track. Use the standalone `Tabs` row only outside a header.
- Keep labels to one or two words. Don't scroll tabs; more than five views need a different navigation.

## Token dependencies

| Decision | Token |
|---|---|
| Label | `component.tabs.item.text` → `text.muted`, `text-hover` → `text.secondary`, `text-active` → `text.primary` |
| Indicator | `component.tabs.item.indicator` → `text.primary` (2 px) |
| Focus | `component.tabs.item.focus` → `focus.ring` |
| Track | `component.tabs.track` → `border.subtle` |
| Spacing | `component.tabs.item.padding-y` → `space.2-5` (10), `component.tabs.gap` → `space.6` (24) |
| Radius | `component.tabs.item.radius` → `radius.xs`, on **Tab/Focus only** (the focus outline); other states have no radius |

All tokens are PERSISTED 2026-10-02 (596 tokens, checksum `986ecbcb`).

## Accessibility

- Use `role=tablist` on the row and `role=tab` on each item, with `aria-selected` on the active one; each tab is `aria-controls` of its `role=tabpanel`.
- Arrow Left and Right move between tabs (roving tabindex); Home and End jump to the ends.
- If each view has its own URL (e.g. `/services?tab=kategori`), render links with `aria-current="page"` instead of ARIA tabs.
- Active is shown by the underline and the bold label, never by colour alone. Inactive labels use `text.muted` on `surface.panel`: 4.8:1 in light mode and above 4.5:1 in dark mode.

## Gaps

- The underline and focus outline widths (2 px) are literal strokes, as on Input's error border; there are no border-width tokens.

## Implementation references

- Pencil: C45 (`Pu7zm`); base `siG3p`; Tabs `NSzy3`; Page Header/Tabs `NPQ7d` on C40
- Tokens: `component.tabs.*`, `component.page-header.tabs.padding-x`
- Rules: `token-usage.md` G1, G3, G5, G7, SP5, SP6
- Code: not built yet. Planned in F-05 (`src/ui/patterns/tabs`).
