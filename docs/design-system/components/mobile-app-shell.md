# Template: `Mobile App Shell`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (tier 4, Owner review). The Owner asked for "App Shell for Mobile" with a Bottom Nav and a menu sheet that inherits the desktop sidebar.
- Tokens: none of its own. It's a layout region (G3). Its parts use `bottom-nav.*` and `sheet.*`.
- Pencil library: `design-system.lib.pen` › **C35 — Mobile app shell** (`u8w6u`)

## Purpose

The Owner app on a phone, and the mobile twin of the App Shell (C30). Every top-level Owner screen below 768 px starts from it. Sub-pages (detail, edit) use C33 Mobile Shell, which has a Back button.

## Structure (`c6qPz7`, 375 × 812, clipped)

| Part | ID | Notes |
|---|---|---|
| Top | `jqblo` | `surface.panel`, bottom border `border.subtle`. Holds the Status bar `IgmBj` (54, a device inset) and the App bar `nUiGs`. |
| App bar | `nUiGs` | 52 high; padding 0 / `space.2` / 0 / `space.4`. Title `jlmjH` (title 18 / 700, fill) · Search `oGnhL` · Notifications `x84QK` (Icon Button Ghost MD, with badge) |
| Content | `HvRky` (slot) | On `surface.canvas`; padding and gap `space.4`. Accepts Metric Tile, Table, Text Field, Segmented Control, Button LG and Alert. |
| Bottom Nav | `SpGXb` | Nested C34, with its own safe area |
| Overlay | `Ey5pi` | Boolean, **off**. Absolute 375 × 812 in `sheet.scrim`; the Sheet slot docks at the bottom. |
| Sheet | `aQWCT` (slot) | Accepts Bottom Sheet/Menu, /Actions and /Form. The default is **Bottom Sheet/Menu** (`xSveZ`) for *Lainnya*. |

**Use (top-level instance):**

- Content: `Replace(<shell>/HvRky, {type:"frame", name:"Content", layout:"vertical", width:"fill_container", height:"fill_container", padding:"$space/4", gap:"$space/4"})`
- Active tab: replace `<shell>/SpGXb/<tab>` with `Bottom Nav Item/Active` (`bKADv`) and the old one with `/Default` (`x1Mgr3`). The tabs are `uzabE` Dasbor · `Ryjdm` Proyek · `YChMw` Klien · `wTYuN` Lainnya.
- *Lainnya*: `Update(<shell>, {descendants:{Ey5pi:{enabled:true}}})` and make Lainnya active.
- Other sheets: `Replace(<shell>/Ey5pi/aQWCT/xSveZ, {type:"ref", ref:"U0wHw" | "vSBbR", …})`.

The C35 exhibits show Dasbor (greeting plus a 2 × 2 grid of Metric Tiles), *Lainnya* with the menu sheet open, and dark mode.

## Mapping from the desktop Sidebar

| Sidebar (C29) | Mobile |
|---|---|
| Dasbor, Proyek (12), Klien | Bottom Nav tabs |
| Invoice (3) | Menu sheet |
| KATALOG: Layanan, Tim | Menu sheet, same group label |
| Template pesan, Sumber klien, Pengaturan | Menu sheet, unlabelled group (as in the Sidebar) |
| Logo row (mark + wordmark) | Menu sheet header, with a round Close instead of Collapse |
| Workspace switcher | Menu sheet, first entry of the list, with a separator line on top |
| Account + Log out | Menu sheet footer |
| — | CTA **+** (Proyek baru) in the Bottom Nav |

## Accessibility

- Landmarks: `<header>` (the app bar), `<main>` (the content) and `<nav>` (the Bottom Nav). A skip link comes first.
- Search and Notifications need `aria-label`s (*Cari*, *Notifikasi · 3 baru*).
- While the Overlay is open, the content and Bottom Nav are `inert`, and focus returns to *Lainnya* when it closes.

## Gaps

- Tablet (768–1279) is not specified.
- The app bar has no scroll behaviour (for example collapsing).

## Implementation references

- Pencil: `C35 — Mobile app shell` (`u8w6u`)
- Related: App Shell (C30), Mobile Shell (C33), Bottom Nav (C34), Bottom Sheet/Menu (C32)
