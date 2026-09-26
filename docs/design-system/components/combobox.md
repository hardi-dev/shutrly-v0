# Component: `Combobox`

## Status and approval

- Lifecycle: `PROPOSED` (2026-09-26). This resolves the handoff's open question "Combobox"; the Owner chose the recommended default.
- Tokens: one new alias, `menu.item.text-action` (→ `action.primary`) for the create row. Everything else reuses Select, Text Field, Input and Menu tokens.
- Pencil library: `design-system.lib.pen` › **C36 — Combobox** (`wDOnD`)
- Evidence: none in the legacy frames.

## Purpose

A searchable Select for long or growing lists such as clients or packages. The Input is the search box, the Menu lists the matches, and a final **"Tambah …"** row creates a new record from the query.

Use Select for 7 or fewer fixed options, and Multi-select when the user picks several.

## Structure

`_Combobox/Base` (`lhmhP`, private) is an instance of `_Select/Base` (C19, `R1MZh`), the same pattern as the Multi-select:
- **Field** `Et1pR` (Text Field): Label *Klien*, a leading `search` icon, a trailing `chevrons-up-down`, Placeholder *Cari atau tambah klien*, Helper.
- **Menu** `xGHsR` (C10, absolute, 4 px under the Input, on only while open). Its Items `Ly5N6` are replaced with:
  1. a Menu Group Label with the match count (*KLIEN · 3 COCOK*);
  2. the matches as Menu Items with a Description line. The keyboard-highlighted one is `Menu Item/Default/Hover`;
  3. a Menu Divider;
  4. the **create row**: a Menu Item with a `plus` icon and the label *Tambah "Rin" sebagai klien baru* in `menu.item.text-action`, semibold.

## Variants

| Component | ID | State |
|---|---|---|
| `Combobox/Default` | `CiTrY` | Closed, placeholder shown |
| `Combobox/Open` | `LN80X` | The query is in Input/Value, with the focus ring (`input.border-focus` + `focus.glow`) and the Menu on |
| `Combobox/Disabled` | `CGRMW` | `opacity.disabled` |

Error and hover follow the Select's states.

**No results:** set the Group Label to *TIDAK ADA KLIEN "ZUL"*. The list is empty and the create row stays. Fill with `Replace(<instance>/xGHsR/Ly5N6, {type:"frame", name:"Items", layout:"vertical", width:"fill_container"})`.

## Rules

- Filter as the user types, matching anywhere in the name. Show at most 8 matches, then *Lihat semua*.
- The create row is always last and repeats the query in quotes. It opens the create form prefilled: a Modal on desktop, a Form sheet on mobile.
- A match's description carries one fact that tells similar names apart (project count, phone), never a second action.

## Accessibility

Follows the WAI-ARIA combobox pattern with list autocomplete.
- The Input has `role=combobox`, `aria-expanded`, `aria-controls` pointing to the listbox, and `aria-activedescendant` for the highlighted option.
- ↑/↓ move the highlight, Enter picks, and Esc closes while keeping the query. The match count is announced (`aria-live=polite`).
- The create row is an option with an explicit label.

## Implementation references

- Pencil: `C36 — Combobox` (`wDOnD`)
- Related: Select (C19), Multi-select (C20), Menu (C10), Menu Item (C09)
