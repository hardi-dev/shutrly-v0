# Feature: Projects

ID: F-07 · Slug: `projects`
Status: SPECIFIED (2026-10-02) · Journeys: J-03 (*Create / pick client → Pick service → Fill booking fields → Snapshot → Customize deal & price → Confirm → BOOKED*; sessions and team are F-08)
Consumer: F-08 `team-sessions` (sessions and assignments on a project), F-09 `gallery` (one gallery per project), F-10 `client-access` (the project token), F-11 `selection` (groups from project items), F-12 `final-delivery` (`DELIVERED`, `COMPLETED`), F-13 `add-ons`, F-14 `billing` (project currency and price), F-15 `whatsapp-share` (`{{projectTitle}}`)

## Goal
The Owner books a shoot as a project: one client, one service, and the deal they agreed on. Creating a project copies the service's package items and booking fields into the project, so later catalog changes never alter it (BR-PRJ-001, BR-CAT-003). The Owner can adjust the deal until shooting starts, move the project through its working statuses by hand, and cancel or delete it when plans change.

## User Story
As a photographer (Owner), I want to create a project for a client from one of my services and record the booking details, so that I have a fixed record of what I promised, at what price, and where the work stands.

## Preconditions
- F-02 Workspace (DONE): verified `WorkspaceContext` (ADR-015), App Shell.
- F-05 Catalog (on `main`): services with items and booking fields; only active services are offered (BR-CAT-008).
- F-06 Clients (PLANNED, built before F-07): the client table, the client form dialog and the active-client list (BR-CLI-003).
- F-17 App Shell (DONE): the nav slot `projects` (*Proyek*, icon `folder-kanban`) and the *Proyek baru* create action, both *Segera hadir* placeholders today. F-07 replaces them; label, icon and position stay.
- Actor: a signed-in, verified, active Owner inside a workspace they own (BR-WS-003).

## Inputs
| Screen | Fields |
|---|---|
| Proyek (list) | search (title or client name) · filter *Berjalan* / *Selesai* / *Dibatalkan* (A-4) · list title *Daftar proyek* with the count of the selected filter · per project: title, client, service, event date, status · page action *Proyek baru* |
| Proyek baru | client (active clients, searchable; *Tambah klien baru* opens the F-06 client dialog) · service (active services, grouped by category) · title (prefilled, A-2) · event date (optional) · agreed price (prefilled with the service's base price) · the service's booking fields, in its order · internal notes (optional) · read-only summary of the service's package items · actions *Simpan draf* and *Buat proyek* |
| Project detail | header: title, status, client, event date · status action (A-5) · menu: *Batalkan proyek* / *Hapus draf* · **Info:** client, service (origin), event date, agreed price, notes · **Item paket:** snapshotted items (name, value, unit, selection type) · **Field booking:** snapshotted fields and their values |
| Ubah info | title · event date · agreed price · notes (agreed price only while the deal is editable, BR-PRJ-009) |
| Item paket form | add: definition (active, not yet in the project) and value · edit: value only (`NUMBER` one number, `RANGE` min and max) |
| Field booking form | the snapshotted fields with their stored values, edited by type |
| Batalkan proyek | reason (required from `SHOOTING`, optional otherwise) |

Field rules: BR-PRJ-008 (title, event date, notes, agreed price), BR-PRJ-002 (booking fields), BR-CAT-001/002 (item values), A-3 (booking-field value rules).

## Main Flow — book a project
1. Owner selects *Proyek baru* (create action or the list's page action). The server verifies the workspace and loads its active clients and active services.
2. Owner picks a client. If the client is new, *Tambah klien baru* opens the F-06 client dialog; on save the new client is selected.
3. Owner picks a service. The form shows the service's booking fields in order, prefills the title (A-2) and the agreed price, and summarises its package items.
4. Owner fills in the booking fields, optionally the event date and notes, and adjusts the title or price.
5. Owner selects *Buat proyek*. In one transaction the server checks that the client and service are still active and belong to the workspace, validates every input (BR-PRJ-002, BR-PRJ-008), creates the project in `BOOKED`, copies every service item into project items and every booking field (metadata and value) into project field values in the service's order (BR-PRJ-001), snapshots the service currency (BR-PRJ-007), generates the client access token (BR-PRJ-003), and records who created it and when.
6. The project detail page opens with a success toast.

## Alternative Flows
- **Save as draft:** *Simpan draf* does the same as step 5 with status `DRAFT`. Required booking fields are still required (BR-PRJ-002, Owner 2026-10-02). On a draft, *Konfirmasi booking* moves it to `BOOKED`.
- **Edit the deal (`DRAFT` or `BOOKED`, BR-PRJ-009):**
  - *Ubah info* changes the title, event date, agreed price and notes.
  - On an item, *Ubah nilai* changes its value. *Hapus* removes the item after confirmation.
  - *Tambah item* snapshots an active definition the project doesn't use yet, with a value.
  - *Ubah field booking* edits the values. Required fields stay required, and the field names, types and options never change.
  - Nothing touches the service.
- **After shooting starts:** from `SHOOTING` on, the deal is read-only. Only title, event date and notes can still change (A-6).
- **Advance status (BR-PRJ-004):** the header shows the next manual step: *Konfirmasi booking* (`DRAFT → BOOKED`), *Mulai pemotretan* (`BOOKED → SHOOTING`), *Selesai pemotretan* (`SHOOTING → POST_PROCESSING`). Each is one click with no confirmation, followed by a toast. Later statuses come from F-12.
- **Cancel (`BOOKED` or `SHOOTING`, BR-PRJ-010):** *Batalkan proyek* asks for confirmation, with a reason that is required from `SHOOTING`. The project becomes `CANCELLED`, recording actor, time and reason (BR-AUD-001). It moves to *Dibatalkan* and becomes read-only.
- **Delete a draft (BR-PRJ-010):** *Hapus draf* asks for confirmation (*Hapus draf "{title}"?*). The project and its snapshots are deleted, and the list opens with a toast.
- **Search and filter:**
  - Search narrows the selected filter to projects whose title or client name contains the text, ignoring case.
  - No match shows *Tidak ada proyek yang cocok* with *Hapus pencarian*.
- **No projects yet:**
  - *Berjalan* shows *Belum ada proyek* with *Proyek baru*.
  - *Selesai* shows *Belum ada proyek yang selesai*.
  - *Dibatalkan* shows *Belum ada proyek yang dibatalkan*.
- **No active client or service:**
  - *Proyek baru* still opens.
  - With no active service, the service field explains *Belum ada layanan aktif* and links to *Layanan*.
  - With no clients, the picker offers *Tambah klien baru*.
- **Many projects:** the list loads 30 projects at a time and shows *Muat lebih banyak* while more exist (A-4).
- **Client and service guards:**
  - **Client delete:** deleting a client that a project refers to shows the F-06 blocked dialog *Klien ini punya proyek. Arsipkan saja.* (BR-CLI-003).
  - **Service delete:** deleting a service a project was created from is blocked (BR-CAT-008).
  - **Item definition delete:** deleting a definition used by a project item is blocked (BR-CAT-008).
  - **Archiving:** archiving a client or service leaves its projects unchanged (BR-PRJ-008).

## Error Cases
- **Missing or invalid input:** each of the following gives a field error and saves nothing:
  - no client or no service chosen;
  - a title empty (after trim) or longer than 100 characters;
  - notes longer than 2000 characters;
  - a price that is negative, fractional or above 999.999.999.999 (BR-PRJ-008, BR-CUR-003).
- **Booking fields:** a required field empty, or a value that doesn't fit its type or options (A-3) → error on that field; nothing saved (BR-PRJ-002).
- **Inactive client or service:** the client or service was archived or deleted meanwhile, including a race with another tab → *Klien ini sudah diarsipkan* / *Layanan ini sudah tidak aktif*. Nothing is created and the form keeps its input. A client or service of another workspace is *not found* (BR-WS-002).
- **Item values:**
  - an item value invalid under BR-CAT-001/002 (negative, fractional for a selection item, *min* > *max*) → field error;
  - a definition already in the project → *Item ini sudah ada di proyek*.
- **Deal locked:** a deal edit after the project left `DRAFT`/`BOOKED`, for example after *Mulai pemotretan* in another tab → *Proyek sudah dalam pemotretan. Detail paket tidak bisa diubah lagi.* Nothing is saved and the page reloads its data.
- **Stale or invalid status action:** the status changed meanwhile, or the move isn't allowed (backwards, from `CANCELLED`, deleting a non-draft) → *Status proyek sudah berubah* and the page reloads. The server decides from the stored status, never from the request (C-004).
- **Cancel reason:** cancelling from `SHOOTING` without a reason, or with more than 500 characters → field error.
- **Not owned or missing:** the project, or the workspace in the URL or request, is not owned or doesn't exist → *not found*, no data (BR-WS-003, ADR-015). A workspace ID, status, token or price in the body is never trusted as authority.
- **Unexpected server error:** danger toast *Perubahan belum tersimpan* with *Coba lagi*. The form keeps its input and stored data is unchanged (C-007).

## UI States (C-007)
- **List:** loading, populated, the three empty states, no search match, loading more.
- **Proyek baru:**
  - before a service is chosen;
  - a service with booking fields;
  - a service with no booking fields and no items;
  - no active service;
  - field errors;
  - inactive client or service;
  - submitting, showing the pending state on the pressed button;
  - server error.
- **Detail:**
  - one state per status: `DRAFT`, `BOOKED`, `SHOOTING` (deal read-only), `POST_PROCESSING`, and `CANCELLED` (banner with reason, read-only);
  - no items, no booking fields;
  - status action pending.
- **Dialogs:**
  - *Ubah info*, *Tambah item*, *Ubah nilai*, *Ubah field booking*, *Batalkan proyek* and *Hapus draf*;
  - each has idle, field error and submitting states.
- **Toasts:** created, draft saved, saved, status changed, cancelled, draft deleted, server error.

## Business Rules
- BR-PRJ-001 — snapshot on creation
- BR-PRJ-002 — one value per booking field; required fields valid
- BR-PRJ-003 — client access token generated at creation
- BR-PRJ-004 — lifecycle (manual steps, no backwards moves)
- BR-PRJ-007 — currency snapshot
- BR-PRJ-008 — project record
- BR-PRJ-009 — deal editable while `DRAFT` / `BOOKED`
- BR-PRJ-010 — delete drafts, cancel the rest
- BR-CAT-001, BR-CAT-002 — item values; BR-CAT-003 — templates affect only the future; BR-CAT-008 — archived templates not offered, referenced ones not deleted
- BR-CLI-003 — archived clients not offered; clients with projects not deleted
- BR-CUR-001, BR-CUR-003 — IDR, exact money
- BR-AUD-001 — cancellation records actor and timestamp
- BR-WS-002, BR-WS-003 — tenant isolation, verified workspace context
- Constitution: C-003, C-004, C-005 (snapshot in one transaction), C-006, C-007, C-008, C-101, C-102, C-103 (the token is never logged or shown in F-07), C-105
- ADR-003, ADR-004 (token), ADR-007 (money), ADR-015

## Assumptions (low-risk, reversible — confirm or change anytime)
- **A-1 Routes and nav:**
  - the list lives at `/w/[workspaceId]/projects` in the existing *Proyek* slot;
  - the create page lives at `/w/[workspaceId]/projects/new`;
  - the detail page lives at `/w/[workspaceId]/projects/[projectId]`, a sub-page with the F-17 compact bar;
  - the shell's *Proyek baru* create action points to the create page, and `projects` and `new-project` stop being *Segera hadir* sections.
- **A-2 Default title:**
  - when a service is chosen, the title is prefilled as *{service name} — {client name}*, cut to 100 characters;
  - choosing another client or service updates it only while the Owner hasn't edited it.
- **A-3 Booking-field values by type:**
  - *Teks* is 1–200 characters and *Teks panjang* 1–2000, both trimmed;
  - *Angka* is a decimal number;
  - *Tanggal* is a calendar date;
  - *Ya/Tidak* is a choice of *Ya* or *Tidak*, with no default, so a required one must be answered;
  - *Pilihan* is one of the snapshotted options;
  - an optional field left empty stores no value.
- **A-4 List:**
  - *Berjalan* is `DRAFT` … `DELIVERED`, *Selesai* is `COMPLETED`, and *Dibatalkan* is `CANCELLED`;
  - order is by event date, nearest first and projects without a date last, then by creation time, newest first;
  - 30 per page, keyset paging, and the count ignores the search, as in F-06 (A-5, A-10);
  - the query is kept in the URL (`?q=`).
- **A-5 Status labels:** *Draf*, *Dibooking*, *Pemotretan*, *Pascaproduksi*, *Terkirim*, *Selesai*, *Dibatalkan*, shown with the Status Chip.
- **A-6 Title, date and notes:**
  - these aren't part of the deal, so they stay editable in every status except `CANCELLED`;
  - the agreed price follows BR-PRJ-009.
- **A-7 Item order:** project items and field values keep the service's order. An added item goes last. There is no reordering in F-07.
- **A-8 Audit:**
  - a project stores `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, and for cancellation `cancelledAt`, `cancelledBy` and `cancelReason`;
  - status moves record nothing more in F-07: BR-AUD-001 lists only cancellation and completion;
  - there is no history.
- **A-9 Concurrent edits:**
  - status moves are conditional on the stored status, so the second of two concurrent moves fails as stale;
  - deal edits check the status in the same transaction;
  - otherwise the last write wins.
- **A-10 Drafts:** a `DRAFT` offers *Hapus draf* and not *Batalkan proyek*. `DRAFT → CANCELLED` stays valid in BR-PRJ-004, but F-07 doesn't offer it.

## Dependencies
- F-05 Catalog: the active services, their items, booking fields and currency, plus the delete guards for services and definitions.
- F-06 Clients: the active clients, the client dialog for inline creation, and the delete guard.
- F-08 to F-15 build on the project. F-07 adds no placeholders for their sections (sessions, team, gallery, invoices, add-ons).

## Out of Scope
- **Owned by later features:**
  - sessions, team assignments (F-08);
  - gallery and sources (F-09);
  - token display and rotation, client links (F-10);
  - selection groups (F-11);
  - final delivery, `DELIVERED` and `COMPLETED` (F-12);
  - add-ons (F-13);
  - invoices (F-14);
  - WhatsApp sharing (F-15).
- Projects without a service, or with several services.
- Reordering project items or booking fields.
- Editing a snapshotted item's name, unit or selection type.
- Editing a booking field's name, type or options.
- Moving a status backwards, and reopening a cancelled project.
- A client detail page with the client's projects.
- Calendar views, reminders, project templates, duplicating projects.

## Open Questions / SPEC GAPS
- Not blocking: A-4 (filters and order) and A-2 (default title) are the assumptions most likely to change in design review.
- **F-11:** once selection groups exist, it must decide what removing or changing a selection item does to an existing group. Under BR-PRJ-009 that is only possible while the project is `DRAFT`/`BOOKED`, before groups exist in practice.
- **For design:** `/sdv:design-feature projects` needs desktop and phone frames, exported as HTML (AGENTS.md):
  - the list: populated, the three empty states, no match, loading, loading more;
  - *Proyek baru*: before a service is chosen, filled, no active service, field errors, inline client dialog, submitting;
  - the detail in each status;
  - the dialogs and toasts.
