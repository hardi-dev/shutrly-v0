# Component: `Avatar`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-26 (Owner: "approved" — review of C02–C26). Previously `PROPOSED` (tier 1b, 2026-09-26)
- Direction/token approval: `APPROVED` (`avatar.*` added 2026-09-26)
- Pencil library: `design-system.lib.pen` › **C16 — Avatar** (`fSpXU`)
- Consumers: Table row (tier 3), account menu

## Purpose

Shows the initials of a client or team member. Photo avatars are out of scope for now.

## Variants and properties

The private base is `_Avatar/Base` (`V05sI`), with layer `Initials` `DloPs`.

| Property | Type | Values | Mechanism |
|---|---|---|---|
| `size` | Variant | `sm` 24 px `PO3yR` (overline 10), `md` 32 px `N7uFQ` (caption 11), `lg` 40 px `IVuIw` (label 12) | component `Avatar/<Size>`; the size is documented, not bound |
| `initials` | Text | "DS" | `descendants` content |

## Content

- Uppercase, at most 2 letters: the first letters of the first two words (*Dimas & Sari* → DS). A single word gives one letter.
- Use SM in dense lists, MD in tables and LG in the account menu.

## Token dependencies

`avatar.background` → `surface.muted`; `avatar.text` → `text.secondary`; `avatar.radius` → full.

## Accessibility

- Decorative (`aria-hidden`) when the name is shown next to it; otherwise, give it the full name.
- Contrast is ≥ 4.5 : 1.

## Implementation references

- Pencil: `C16 — Avatar` (`fSpXU`), base `V05sI`
