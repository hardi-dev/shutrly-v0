# Component: `Action Menu`

## Status and approval

- Lifecycle: `PROPOSED` (tier 2, 2026-09-26). No legacy evidence for the menu.
- Direction/token approval: `APPROVED` (existing `icon-button.*`, `menu.*`; `icon-button.sm.padding` added 2026-09-26)
- Pencil library: `design-system.lib.pen` › **C21 — Action menu** (`TWp5Y`)

## Purpose

Holds three or more secondary actions for one object (a project row, a gallery, a panel) behind a ghost ⋯ button. The primary action always stays visible as a Button.

## Structure

The private base is `_ActionMenu/Base` (`B7K1d`), a vertical stack aligned to the right:

- `Trigger` `m4ka0s`: **Icon Button/Ghost/MD/Default** with the `ellipsis` icon.
- `Menu` `RCAAJ`: absolute, 240 wide, right-aligned to the trigger and 4 px below it (MD x −200 y 44; SM x −208 y 36). It is off when closed.
- `Items` `c8fWyJ`, the slot, replaced in the base: *Ubah proyek* (pencil), *Duplikat* (copy), *Kirim tautan galeri* (send), a Divider, then *Hapus proyek* (Menu Item/Destructive).

| Size \ State | Closed | Open |
|---|---|---|
| MD (40 px trigger) | `rXttF` | `tQSj1` |
| SM (32 px trigger, `icon-button.sm.padding`) | `tgN4c` | `M3v1E5` |

When open, the trigger shows `icon-button.background-hover` (pressed).

Replace the items with `Replace(<instance>/RCAAJ/JoK1p, {type:"frame", layout:"vertical", width:"fill_container"})`, then insert Menu Item variants.

## Content

- Each item is an icon plus a verb-first label, with the most-used item first. There are 3–7 items.
- The destructive item is always last, after a Divider, and is confirmed in a dialog.
- Use SM in table rows (owner app) and MD in panel headers.

## Accessibility

- The trigger has an `aria-label` (*Aksi untuk Rina & Dimas*), `aria-haspopup=menu` and `aria-expanded`.
- The menu is `role=menu` with `role=menuitem` items. ↑ and ↓ move, Enter or Space activates, and Esc closes the menu and returns focus to ⋯.
- SM (32 px) meets WCAG 2.2's 24 px minimum for the owner app. On the client gallery, use MD with a ≥ 44 px hit area.
- Destructive items are marked by their text and icon, not by red alone.

## Implementation references

- Pencil: `C21 — Action menu` (`TWp5Y`), base `B7K1d`
- Rules: token-usage.md G3, §6, §8, SP11
