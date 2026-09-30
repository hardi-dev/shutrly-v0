# F-02 Workspace — Settings v3 plan

Owner request (2026-10-01): "create the section-card component · implement new design to workspace settings". Design source: [design.md](design.md) › *Settings v3 redesign*, with the exports `exports/settings-{EjWRU,NurYs}.html`, `settings-errors-{h8USKA,cNB0a}`, `settings-saved-{bMevr,qTVht}` and `settings-server-error-{NRt4P,QbNc2}`. Component contract: [section-card.md](../../design-system/components/section-card.md) and `docs/design-system/exports/c43-section-card.html`.

Covers AC-WS-016, AC-WS-017, AC-WS-024 (settings part) and C-007 UI states: idle, submitting, field errors, server error with retry, and success.

Execute test-first, with one commit per task.

## Task 1 — Section Card pattern (`src/ui/patterns/section-card/`)

- Build `SectionCard` from C43:
  - props: `title?`, `description?`, `actions?`, `content?: "padded" | "flush" | "bleed"` (default `padded`), `aria-label?` (required when there's no title), `className?`, `children`;
  - the header renders only when `title` is set: an `<h2>` with an id, the description, and the Actions slot on the right;
  - the root is `<section aria-labelledby>`, or `aria-label` when there's no header.
- Insets are responsive. Compact applies below `md` (768), matching the Mobile Header breakpoint, and Default from `md` up, using the `component.section-card.*` tokens.
  - `flush` uses `flush.padding-*`; `bleed` has no padding, for table rows.
- Tests: heading/landmark naming, description, actions slot, no header, and the content modes (padding classes).
- Commit: `feat(ui): add section card pattern`.

## Task 2 — Settings schema with field error keys (`application/schemas/workspace-fields`)

- `updateWorkspaceProfileFieldsSchema` gains the A-1 to A-4 rules, with stable message keys: `name.required`, `name.tooLong`, `brandName.tooLong`, `email.invalid`, `phone.invalid`, `address.tooLong` and `prefix.invalid`.
  - It stays the single schema shared by the form (UX) and the server action (C-004).
  - Domain normalisers stay authoritative in the use case.
- Tests: every key, and that a lowercase prefix is valid (AC-WS-017).
- Commit: `feat(workspace): validate settings fields with error keys`.

## Task 3 — Settings save returns a typed result

- Composition `saveWorkspaceSettings` wraps `saveWorkspaceProfile`.
  - It maps `DUPLICATE_NAME` to the field error `name.duplicate`, and other `WorkspaceError` codes, except not-found, to a form failure.
  - Not found is rethrown, so the route shows *not found* (A-9).
- The server action `saveWorkspaceSettingsAction(workspaceId, values)` re-validates with the shared schema. It returns `{ ok: true }` or `{ ok: false, fieldErrors?, formError? }` and revalidates the route.
- Tests: the action test for field errors, duplicate name and success.
- Commit: `feat(workspace): return settings field and form failures`.

## Task 4 — Settings screen v3 (`ui/settings-screen`)

- A client form with React Hook Form and `zodResolver` on the shared schema.
- Layout:
  - the centered `size.content-narrow` column, with section gap `panel.app.content.gap` on desktop and `space.6` on phones;
  - three `SectionCard`s: Identitas brand, Kontak and Invoice;
  - Email + Telepon and Prefiks + Mata uang sit in rows from `md` up;
  - the currency is a read-only field;
  - the save button is trailing on desktop and full width (LG) on phones.
- States:
  - submitting disables the button with *Menyimpan…*;
  - field errors show on their fields, with focus on the first;
  - a server error is an inline `Alert` danger above the first card and keeps the values;
  - success shows `showToast` success *Perubahan tersimpan*.
- The page subtitle copy follows the export: "Atur identitas brand, kontak, dan format invoice workspace ini."
- Tests: render sections, field error mapping, server error alert, success toast. Update the workspace E2E (AC-WS-016).
- Commit: `feat(workspace): rebuild settings screen with section cards`.

## Task 5 — Write-back

- `design.md` ("In code?" column) and `technical-design.md` › Implementation record, plus a `HANDOFF.md` note.
- Commit: `docs(workspace): record settings v3 implementation`.
