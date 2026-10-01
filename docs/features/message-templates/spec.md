# Feature: Message templates

ID: F-03 · Slug: `message-templates`
Status: IN PROGRESS (2026-10-01, Task 1/14; planned 2026-10-01, designed 2026-10-01, specified 2026-09-28) · Journeys: none directly; feeds J-04…J-07 through F-15
Consumer: F-15 `whatsapp-share`

## Goal
Each workspace has one editable WhatsApp message per share situation. The Owner can adjust the wording in their brand's voice, see a preview, and trust that F-15 can always turn it into a valid message with the right link.

## User Story
As a photographer (Owner), I want to write the WhatsApp messages my brand sends for galleries, invoices, reminders and final delivery once, so that sharing later is one tap and always sounds like my brand.

## Preconditions
- F-02 Workspace (DONE): verified `WorkspaceContext`, App Shell, the *Template pesan* nav item (currently a *Segera hadir* placeholder at `/w/[workspaceId]/message-templates`).
- Actor: a signed-in, verified, active Owner inside a workspace they own (BR-WS-003).

## Inputs
| Screen | Fields |
|---|---|
| Template list | none (choose one of the five types) |
| Template editor | content (multi-line text) · insert variable (from the type's allowed list) · *Kembalikan ke default* |

Channel is `WHATSAPP` and is not editable (BR-MSG-002). Content rules: A-1, A-2 and BR-MSG-006.

## Main Flow — edit a template
1. Owner opens *Template pesan*. The server verifies the workspace and lists its five templates, one per type, grouped under *Gallery* and *Invoice*, each with its Indonesian label and a short purpose line (A-5).
2. Owner opens one type. The editor shows its current content, the variables that type allows (required one marked), and a live preview rendered with sample data (A-6).
3. Owner edits the text, optionally inserting variables at the cursor.
4. Owner saves. The server re-validates the content for that type (BR-MSG-006, A-1, A-2), sanitizes it (BR-MSG-004), stores it, and records who and when.
5. A success toast confirms.

## Alternative Flows
- **Restore default:** in the editor, *Kembalikan ke default* replaces the editor text with the platform default for that type. Nothing is stored until the Owner saves (A-4). Leaving without saving keeps the stored content.
- **Leave with unsaved changes:** the Owner is asked to confirm before discarding (A-7).
- **New workspace:** created with all five default templates in the same transaction as the workspace (BR-MSG-005).
- **Existing workspaces:** a data migration backfills the five defaults for every workspace that lacks them (BR-MSG-005). Only the Owner applies migrations (AGENTS.md).

## Error Cases
- Empty (after trim) or too-long content → field error; nothing saved (A-1).
- Unknown variable (e.g. `{{invoiceUrl}}` in `GALLERY_SHARE`), malformed placeholder (e.g. `{{clientName}`, `{{ clientName }}`, `{{}}`) → field error naming the problem; nothing saved (BR-MSG-006, A-2).
- Required link variable missing (e.g. `GALLERY_SHARE` without `{{galleryUrl}}`) → field error; nothing saved (BR-MSG-006).
- Client bypasses the form → same validation on the server (C-003, C-004).
- Template type or workspace not owned / not existing in URL or request → *not found*, no data (BR-WS-003, F-02 A-9). A workspace ID in the body is never trusted.
- Unexpected server error on save → retryable error; stored content unchanged (C-007).

## Rendering contract for F-15 (domain, no I/O)
F-03 ships a pure renderer: `render(type, content, values) → text`.
- Accepts only the variables allowed for the type; every allowed variable used in the content must have a value, or rendering fails (no silent blanks).
- Values are sanitized before substitution: control characters other than line feed removed, `\r\n` normalized to `\n`, trimmed; a value may not introduce a new placeholder (substitution is single-pass) (BR-MSG-004).
- Output is plain text. It is never rendered as HTML, and it is never logged (C-103).
- F-03 does **not** resolve real project/gallery/invoice data, verify the gallery password, or build `wa.me` links; F-15 does (BR-MSG-001, BR-MSG-003).

## UI States (C-007)
List: loading, populated (never empty; five rows). Editor: idle, dirty, submitting (save disabled), field errors, server error (danger toast with *Coba lagi*; the editor keeps the text), saved (toast). Preview updates as the Owner types; invalid content shows the preview's error state instead of a partial render.

## Business Rules
- BR-MSG-001 — share by deep link only (boundary with F-15)
- BR-MSG-002 — template types; exactly one per type in MVP
- BR-MSG-003 — gallery password needs re-entry (why the preview uses a placeholder password)
- BR-MSG-004 — output is sanitized
- BR-MSG-005 — defaults are seeded and backfilled
- BR-MSG-006 — variables typed per template type, required link
- BR-WS-002, BR-WS-003 — tenant isolation, verified workspace context
- Constitution: C-003, C-004, C-006, C-007, C-008, C-101, C-103, C-106
- ADR-003 (workspace isolation), ADR-006 (WhatsApp deep links), ADR-015 (URL-scoped workspace routes)

## Assumptions (low-risk, reversible — confirm or change anytime)
- **A-1 Content length:** 1–2,000 characters after trimming leading/trailing whitespace; inner line breaks are kept. Keeps the rendered `wa.me` URL within practical limits.
- **A-2 Placeholder syntax:** exactly `{{name}}` with a camelCase name, no spaces inside the braces. Any `{{`/`}}` that isn't a valid placeholder is an error. There is no escaping for literal braces in MVP.
- **A-4 Restore default is a draft change,** saved only with *Simpan*; no separate confirmation dialog.
- **A-5 List order, groups and labels:** *Gallery* (Bagikan gallery, Pengingat seleksi, Hasil akhir) then *Invoice* (Bagikan invoice, Pengingat pembayaran), in journey order. Each row shows the label and its purpose line; no content excerpt (Owner 2026-10-01, design v3).
- **A-6 Preview sample data:** fixed Indonesian sample values (e.g. client `Rina & Dimas`, project `Wedding Rina & Dimas`, amounts in IDR); the workspace's real brand name for `brandName`; `galleryPassword` shows `••••••` with a note that the real password is entered when sharing (BR-MSG-003).
- **A-7 Unsaved-changes guard** on in-app navigation and browser unload.
- **A-8 Concurrent edits:** last write wins, no conflict warning (as F-02 A-10).
- **A-9 Audit:** each template stores `updatedAt` and `updatedBy`; no history.
- **A-10 Default content:** Indonesian, one per type, reviewed by the Owner during `/sdv:design-feature` (copy review like auth D-3).

## Dependencies
- F-02 Workspace: `WorkspaceContext`, App Shell, nav slot, workspace creation (the seeding hooks into its create transaction).
- F-15 WhatsApp sharing consumes the renderer, the catalogue and the stored templates.
- F-10/F-12/F-14 later provide the real values for the gallery and invoice variables.

## Out of Scope
- Multiple templates per type, activation, create/delete (BR-MSG-002).
- Resolving real data, password re-entry, building or opening `wa.me` links (F-15).
- Channels other than WhatsApp; sending messages; history or delivery status (BR-MSG-001, ADR-006).
- Rich formatting preview (WhatsApp `*bold*`/`_italic_` shows as typed), emoji picker, per-client or per-project overrides.
- Version history of template content.

## Open Questions / SPEC GAPS
- **BR-MSG-006 catalogue — APPROVED** (Owner 2026-09-28).
- **SPEC GAPs deferred to F-14 (`dueDate`) and F-11 (selection deadline)** — recorded in BR-MSG-006.
- For design: `/sdv:design-feature message-templates` needs frames for the list and the editor (with preview, variable chips, field error, restore default, unsaved-changes dialog), desktop and mobile, as HTML exports (AGENTS.md).
