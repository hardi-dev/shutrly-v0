# Component: `Multi-select`

## Status and approval

- Lifecycle: `PROPOSED` (tier 2, 2026-09-26). No legacy evidence for the menu.
- Direction/token approval: `APPROVED` (existing `input.*`, `menu.*`, `checkbox.*`)
- Pencil library: `design-system.lib.pen` › **C20 — Multi-select** (`A56Q5`)

## Purpose

Pick many of many from a known list, such as channels, services or team members.

## Structure

The private base `_MultiSelect/Base` (`K1H9l`) is an **instance of `_Select/Base`** whose Menu slot is replaced in the base:

- `Items` `xthKF`: Group label `jELyt` ("SALURAN"), then Menu Items with a nested Checkbox (without its label): WhatsApp `JDxlW` ✓, Email `CC64P` ✓, SMS `nr0AY`, Instagram DM `B23y4`.
- It has the same Field paths as Select (`Et1pR/…`) and the same Menu (`xGHsR`, absolute at y 65).

| State | ID |
|---|---|
| Default | `X8ErE9` |
| Hover | `nvFx0` |
| Open | `q4NjNG` (value "WhatsApp, Email") |
| Error | `ny8DD` |
| Disabled | `h1Cq6` |

To toggle an item, replace its checkbox: `Replace(<item>/iWymw, {type:"ref", ref:"H41tQ", name:"Checkbox", descendants:{bnoVV:{enabled:false}}})` for checked, or ref `n8NmOH` for unchecked.

## Content

- The trigger value lists the picked labels, comma-separated in menu order. When they overflow, show the first ones then "+N"; that truncation is done in code.
- Group options under a Menu Group Label when there are two or more kinds.
- The menu stays open while options are toggled; Esc or a click outside closes it.

## Token dependencies

`input.*` (through Text field), `menu.*`, `checkbox.*` (checked = `action.primary`), `elevation.1.*`.

## Accessibility

- A listbox with `aria-multiselectable=true`; options are `role=option` with `aria-selected`. The visible checkbox is presentational.
- Space toggles an option; Enter closes; Esc closes and returns focus.
- The trigger's accessible value reads every picked label, not "+N".

## Usage

- With ≤ 5 options and room to show them, use a Checkbox group instead.
- Don't mix single-select ✓ items and checkbox items in one menu.
- Past about 10 options, add a search (combobox; not built yet).

## Implementation references

- Pencil: `C20 — Multi-select` (`A56Q5`), base `K1H9l` (ref of `R1MZh`)
