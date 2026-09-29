# Component: `Group`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-28 (Owner: "ya" — message-template v3)
- Pencil library: `design-system.lib.pen` › **C41 — Group** (`FdLTt`)
- Evidence: approved mobile message-template groups in `exploration.pen`

## Purpose

Keeps a small section title and its content together with a predictable compact rhythm.

## Anatomy (`tEPBr`)

| Part | Layer | Contract |
|---|---|---|
| Root | `tEPBr` | Vertical, gap 8 (`group.gap`), width set by the consumer. |
| Section title | `mw4YO` | Horizontal padding 4 (`group.title.padding-x`). |
| Title | `Z2fQ4Y` | Overline 10/700/+0.6, uppercase, `group.title.text`. |
| Content | `R7Fxz` | Slot; defaults to List Card (`swIYb`). |

## Rules

- Use a short noun or category name, normally one or two words.
- Do not use Group as a generic spacing wrapper; it exists only when a visible section title is required.
- Stack multiple Groups using the page or screen section gap, not `group.gap`.

## Accessibility

- Render the title as a heading at the correct document level and associate it with the grouped region when the region needs a name.

## Implementation references

- Tokens: `component.group.*`
- Common child: List Card (C42)
