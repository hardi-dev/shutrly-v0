# Component: `Bottom Nav` (+ `Bottom Nav Item`, `Bottom Nav CTA`)

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (tier 4, Owner review)
- Direction/token approval: `APPROVED`. The Owner picked option B on exploration board 06 (`exploration.pen` › **06 — Mobile app shell study**) and raised the top padding: "let's go with B, but we need to increase padding top". That adds 12 `bottom-nav.*` tokens and no new primitives or semantics.
- Pencil library: `design-system.lib.pen` › **C34 — Bottom nav** (`QifL8`)
- Evidence: none in the legacy frames. The destinations come from the desktop Sidebar (C29).

## Purpose

Primary navigation for the Owner app on phones (C35). The bar holds four destinations and one create action: **Dasbor · Proyek · [+] · Klien · Lainnya** (chosen by the Owner). *Lainnya* opens Bottom Sheet/Menu (C32) with every other Sidebar destination.

## Components

| Component | ID | Structure |
|---|---|---|
| `_BottomNavItem/Base` (private) | `D0lDq` | 64 wide, vertical, gap `bottom-nav.item.gap` (4), centred. Icon wrap `ktiaG` (28 × 28) holds Icon `Tz5za` (lucide 20, `bottom-nav.item.icon`) and Badge `qSiIY` (Notification Badge, absolute, boolean off). Label `sJlqM` (caption 11 / 500, `bottom-nav.item.text`). |
| `Bottom Nav Item/Default` | `x1Mgr3` | |
| `Bottom Nav Item/Active` | `bKADv` | Icon and label in `bottom-nav.item.active` (light `action.primary`, dark `status.info.fg` so the 11 px label passes AA); label bold. **Colour only, no pill** (option B). |
| `Bottom Nav CTA` | `tLfnG` | A 54 circle in `bottom-nav.cta.background` with Icon `nCt5A` (plus 24, `bottom-nav.cta.icon`), a 4 px outer ring in `bottom-nav.cta.ring` (`surface.panel`) and an `elevation.1` shadow. |
| `Bottom Nav` | `lymtg` | 375 wide, `bottom-nav.background`, top border `bottom-nav.border`. The Items slot `gZgRf` has padding `bottom-nav.padding-top/-x/-bottom` (12 / 8 / 4) and spreads its children evenly: Dasbor `uzabE` (Active) · Proyek `Ryjdm` (badge 12) · CTA slot `suEnL` (64 × 48, the CTA `Iir7g` floats 20 px above the bar) · Klien `YChMw` · Lainnya `wTYuN`. After the slot comes the Safe area (34, device inset). |

**Set the current page** on a top-level instance (for example inside the Mobile App Shell):

```js
Replace(<shell>/SpGXb/wTYuN, {type:"ref", ref:"bKADv", descendants:{Tz5za:{icon:"menu"}, sJlqM:{content:"Lainnya"}}})
Replace(<shell>/SpGXb/uzabE, {type:"ref", ref:"x1Mgr3", descendants:{Tz5za:{icon:"layout-grid"}, sJlqM:{content:"Dasbor"}}})
```

## Rules

- Exactly 4 tabs plus 1 CTA. Tab labels are one word. The active tab is the current top-level page.
- The CTA is the single most common create action (*+ Proyek baru*). It opens a Form sheet or a page, never a menu.
- Badges go on the tab icon (Notification Badge) for counts that need attention. The CTA never gets a badge.
- The bar hides while the keyboard is open and stays visible on scroll.

## Accessibility

- `<nav aria-label="Utama">` containing links; the active tab has `aria-current=page`. The CTA is a `<button aria-label="Proyek baru">`.
- Targets: tabs are at least 64 × 48, and the CTA is 54.
- The badge count is part of the accessible name (*Proyek, 12 baru*). The active state uses colour **and** weight.

## Gaps

- The keyboard and scroll states aren't drawn.
- Item and CTA sizes are literal, because Pencil can't bind size.

## F-17 update — PROMOTED 2026-09-29

Promoted to `design-system.lib.pen` by `/sdv:save-design-system` (F-17, Owner-approved design; rules v3.1). Library (`lymtg`): tab `wTYuN` renamed *Tab Invoice* (`receipt`). Details: [F-17 design.md](../../features/app-shell-revamp/design.md).

- Tabs become Dasbor · Proyek · **+** · Klien · **Invoice**; *Lainnya* is removed (option A, Owner 2026-09-29).

## Implementation references

- Pencil: `C34 — Bottom nav` (`QifL8`); tokens on board 06 › *Bottom nav*
- Exploration: `exploration.pen` › 06 (options A / B)
- Used by: Mobile App Shell (C35). Related: Sidebar (C29), Bottom Sheet/Menu (C32)
