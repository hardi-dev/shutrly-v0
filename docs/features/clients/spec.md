# Feature: Clients

ID: F-06 · Slug: `clients`
Status: PLANNED (2026-10-02; specified, designed and planned the same day) · Technical design: [technical-design.md](technical-design.md) · Plan: [plan.md](plan.md) · Journeys: J-03 (*Create / pick client*)
Consumer: F-07 `projects` (a project belongs to one active client; the client picker), F-15 `whatsapp-share` (the client's WhatsApp number)

## Goal
Each workspace keeps its own list of clients: the people who book shoots. A client has a name, an optional WhatsApp number and optional social-media links. The Owner adds, edits, archives, restores and deletes clients, and finds them quickly by name or number. Clients never log in (BR-AUTH-001).

## User Story
As a photographer (Owner), I want to keep my clients' names, WhatsApp numbers and Instagram accounts in one place, so that when I book a project or share a gallery I pick the client instead of retyping their details.

## Preconditions
- F-02 Workspace (DONE): verified `WorkspaceContext` (ADR-015), App Shell.
- F-17 App Shell (DONE): the nav slot `clients` (*Klien*, icon `users`), currently a *Segera hadir* placeholder at `/w/[workspaceId]/clients`. F-06 replaces the placeholder with the real page; label, icon and position stay.
- Actor: a signed-in, verified, active Owner inside a workspace they own (BR-WS-003).

## Inputs
| Screen | Fields |
|---|---|
| Klien (list) | search (name or WhatsApp number) · filter *Aktif* / *Arsip* · list title *Daftar klien* with the client count of the selected filter (A-10) · per client: *Ubah*, *Buka WhatsApp* (when it has a number), *Arsipkan* / *Pulihkan*, *Hapus* · page action *Tambah klien* |
| Tambah klien / Ubah klien | name · WhatsApp number · social-media links: 0–10 rows of platform + handle or URL; the add form starts with one empty *Instagram* row; *Tambah media sosial* adds a row, each row can be removed |

Field rules: BR-CLI-001 (name, social links) and BR-CLI-002 (WhatsApp number). There are no phone, email, address or notes fields (Owner 2026-10-02).

## Main Flow — add a client
1. Owner opens *Klien*. The server verifies the workspace and lists its active clients by name (A-3). Each row shows the name, the formatted WhatsApp number (or *Belum ada nomor WhatsApp*) and the first social link. Above the rows, *Daftar klien* shows how many active clients the workspace has (A-10).
2. Owner selects *Tambah klien*. A dialog (a full-height sheet on phone) shows the name field, the WhatsApp field with the hint *Contoh: 0812 3456 7890*, and one empty *Instagram* row under *Media sosial*.
3. Owner fills in the name, optionally the number and the Instagram handle, and may add rows (for example *TikTok*) or remove the Instagram row.
4. Owner confirms. The server validates every field (BR-CLI-001/002), normalizes the number, drops social rows left empty, creates an active client, and records who and when.
5. The dialog closes, the list shows the new client, and a success toast confirms.

## Alternative Flows
- **Search:** typing in the search box narrows the current filter to clients whose name contains the text (ignoring case), or whose number contains the digits typed (`0812…`, `+62 812…` and `62812…` all match). No match shows *Tidak ada klien yang cocok* with *Hapus pencarian* (A-4).
- **Edit:** *Ubah* (or selecting the row) opens the same dialog filled with the stored values. On save the server validates and stores the whole client; a toast confirms.
- **Open WhatsApp:** *Buka WhatsApp* opens `https://wa.me/<number>` in a new tab with no prefilled text (A-6). Messages with templates belong to F-15.
- **Archive / restore:** *Arsipkan* takes effect at once, without confirmation, because it is reversible: the client leaves the *Aktif* list and a toast confirms with *Batalkan*. Under *Arsip*, *Pulihkan* makes the client active again. Archived clients can't be picked for new projects (BR-CLI-003, enforced in F-07).
- **Delete:** *Hapus* asks for confirmation (*Hapus klien "{name}"?*). On confirm, the server deletes the client if no project refers to it (BR-CLI-003); a toast confirms. Until F-07 exists, nothing can refer to a client.
- **No clients yet:** *Aktif* shows *Belum ada klien* with *Tambah klien*; an empty *Arsip* shows *Belum ada klien yang diarsipkan*.
- **Many clients:** the list loads 30 clients at a time and shows *Muat lebih banyak* while more exist (A-5).

## Error Cases
- Name empty (after trim) or longer than 100 characters → field error; nothing saved.
- WhatsApp number that can't be normalized (BR-CLI-002) → field error *Nomor WhatsApp tidak valid*; nothing saved.
- WhatsApp number already used by another client in the workspace, active or archived, including a race with another tab → field error *Nomor ini sudah dipakai {name}* (with *(diarsipkan)* when that client is archived); nothing saved. The database's unique index is the authority (C-003).
- Social row with an unknown platform, a value longer than 200 characters, more than 10 rows, or the same platform and value twice (ignoring case and a leading `@`) → error on that row; nothing saved. The server applies the same rules when the form is bypassed (C-004).
- Delete of a client that a project refers to → *Klien ini punya proyek. Arsipkan saja.* (F-07 onward); nothing deleted.
- The client, or the workspace in the URL or request, is not owned or doesn't exist → *not found*, no data (BR-WS-003, ADR-015). A workspace ID in the body is never trusted.
- Unexpected server error → danger toast *Perubahan belum tersimpan* with *Coba lagi*; the dialog keeps the input, and stored data is unchanged (C-007).

## UI States (C-007)
- List: loading, populated, empty (*Aktif*), empty (*Arsip*), no search match, loading more, row menu open.
- Add / edit dialog: idle (add: one empty Instagram row), with several social rows, field errors (name, number, number taken, social row), submitting (button pending), server error (toast).
- Delete confirmation: idle, deleting, blocked (has projects).
- Toasts: added, saved, archived (with *Batalkan*), restored, deleted, server error.

## Business Rules
- BR-CLI-001 — client record (name, social-media links)
- BR-CLI-002 — WhatsApp number: optional, normalized, unique per workspace
- BR-CLI-003 — archived and deleted clients
- BR-AUTH-001 — clients never log in
- BR-WS-002, BR-WS-003 — tenant isolation, verified workspace context
- Constitution: C-003, C-004, C-006, C-007, C-008, C-101, C-103 (no client PII in logs, architecture overview › Observability)
- ADR-003, ADR-015

## Assumptions (low-risk, reversible — confirm or change anytime)
- **A-1 Route and nav:** the page lives at `/w/[workspaceId]/clients` in the existing *Klien* slot (sidebar, rail, phone bottom nav). `clients` stops being a *Segera hadir* section. There is no separate client detail page in F-06; F-07 may add one with the client's projects.
- **A-2 Social platforms:** *Instagram*, *TikTok*, *Facebook*, *YouTube*, *X* and *Lainnya* (other), in that order. A value is a handle (a leading `@` is dropped when stored, and shown back with `@`) or an `https://` URL. URLs are shown as links that open in a new tab (`rel="noopener noreferrer"`); handles are plain text. Rows keep the order the Owner entered.
- **A-3 List order:** by name, ignoring case; ties by creation time.
- **A-4 Search:** server-side, over the selected filter, at least 1 character, debounced; the query is kept in the URL (`?q=`) so reload and back keep it. Digits match the stored number after the same normalization as BR-CLI-002 (a leading `0` or `+62` becomes `62`).
- **A-5 Paging:** 30 per page, *Muat lebih banyak* appends the next page (keyset on name + id). The total is shown separately (A-10).
- **A-6 *Buka WhatsApp*:** a plain chat link without text; it is not a template message, so BR-MSG-001/C-106 are unaffected. The link is never logged.
- **A-7 Number display:** stored as digits with the country code (`6281234567890`); shown grouped as `+62 812-3456-7890` for Indonesian numbers and `+<digits>` otherwise.
- **A-8 Audit:** each client stores `createdAt`, `updatedAt`, `updatedBy` and `archivedAt`; no history.
- **A-9 Concurrent edits:** last write wins, except the WhatsApp number's uniqueness, which the database enforces.
- **A-10 Client count (Owner 2026-10-02, design review):** the list card's subtitle is the server-side count of the workspace's clients in the selected filter: *{n} klien aktif* or *{n} klien diarsipkan* (`0` when empty). It counts every client in the filter, not just the loaded pages, and ignores the search query. Adding, archiving, restoring and deleting update it. It is hidden while the list loads.

## Dependencies
- F-02 Workspace: `WorkspaceContext`, App Shell.
- F-17 App Shell: the *Klien* nav slot.
- F-07 Projects: the client picker (active clients only), *create client* from the booking flow, the project count that blocks delete, and a client detail view if needed.
- F-15 WhatsApp share: uses the stored number as the deep-link recipient.

## Out of Scope
- Phone, email, address, notes, birthday or other contact fields (Owner 2026-10-02).
- Client login, client portal or any client-facing page (BR-AUTH-001).
- Import/export (CSV, contacts), merge of duplicate clients, tags or segments.
- Sending messages; prefilled WhatsApp text (F-15).
- Project history per client (F-07).

## Open Questions / SPEC GAPS
- None blocking. A-2 (platform list) and A-5 (paging size) are the assumptions most likely to change in design review.
- For design: `/sdv:design-feature clients` needs the list (populated, archived filter, empty, no match, loading, loading more, row menu), the add/edit dialog (default with the Instagram row, several rows, field errors, number taken, submitting), the delete confirmation (idle, blocked) and the toasts, desktop and phone, as HTML exports (AGENTS.md).
