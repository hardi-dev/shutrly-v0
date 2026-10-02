# Feature: Projects

ID: F-07 · Slug: `projects`
Status: DESIGNED (2026-10-02, [design.md](design.md)); specified 2026-10-02 · Journeys: J-03 (*Create / pick client → Pick service → Fill booking fields → Snapshot → Customize deal & price → Confirm → BOOKED*; sessions are F-07 since the design review, team stays F-08)
Consumer: F-08 `team-sessions` (assignments on a project's sessions, session status), F-09 `gallery` (one gallery per project), F-10 `client-access` (the project token), F-11 `selection` (groups from project items), F-12 `final-delivery` (`DELIVERED`, `COMPLETED`), F-13 `add-ons`, F-14 `billing` (project currency and price), F-15 `whatsapp-share` (`{{projectTitle}}`)

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
| Proyek (list) | search (title or client name) · tabs *Berjalan* / *Selesai* / *Dibatalkan* (A-4) · filter button → *Filter proyek* (A-11) · list title *Daftar proyek* with the count of the selected filter · per project: title, client, service, schedule (*Acara*, A-12), status and a row menu (⋯) · page action *Proyek baru* |
| Proyek baru | client (active clients, searchable; *Tambah klien baru* opens the F-06 client dialog) · service (active services, grouped by category) · title (prefilled, A-2) · sessions (*Jadwal*, at least one for *Buat proyek*) · agreed price (prefilled with the service's base price) · the service's booking fields, in its order · internal notes (optional) · *Isi paket*: the service's package items, editable before saving (value, remove, *Tambah item*; BR-PRJ-001, BR-PRJ-009) · actions *Simpan draf* and *Buat proyek* |
| Project detail | header: title, status, client, next session (A-12) · status action (A-5) · menu: the row-menu items for its status (*Chat WhatsApp*, *Batalkan proyek* / *Hapus draf*) · **Info:** client, service (origin), agreed price, notes · **Jadwal:** sessions with *Tambah sesi*, *Ubah*, *Hapus* · **Item paket:** snapshotted items (name, value, unit, selection type) · **Field booking:** snapshotted fields and their values |
| Ubah info | title · agreed price · notes (agreed price only while the deal is editable, BR-PRJ-009) |
| Item paket form | add: definition (active, not yet in the project) and value · edit: value only (`NUMBER` one number, `RANGE` min and max) |
| Field booking form | the snapshotted fields with their stored values, edited by type |
| Batalkan proyek | reason (required from `SHOOTING`, optional otherwise) |
| Sesi form (add / edit) | name · date · start time (optional) · end time (optional) · location (optional) (BR-TEAM-003) |

Field rules: BR-PRJ-008 (title, notes, agreed price), BR-TEAM-003 (sessions), BR-PRJ-002 (booking fields), BR-CAT-001/002 (item values), A-3 (booking-field value rules).

## Main Flow — book a project
1. Owner selects *Proyek baru* (create action or the list's page action). The server verifies the workspace and loads its active clients and active services.
2. Owner picks a client. If the client is new, *Tambah klien baru* opens the F-06 client dialog; on save the new client is selected.
3. Owner picks a service. The form shows the service's booking fields in order, prefills the title (A-2) and the agreed price, and lists its package items in *Isi paket*. The Owner may change an item's value, remove an item or add one from an active definition the list doesn't hold yet, with the same rules and dialogs as on the detail page; choosing another service resets the list, after confirmation if it was changed (*Ganti layanan? Perubahan isi paket akan hilang.*).
4. Owner adds at least one session (*Tambah sesi*: name, date, optional times and location), fills in the booking fields and optionally the notes, and adjusts the title or price.
5. Owner selects *Buat proyek*. In one transaction the server checks that the client and service are still active and belong to the workspace, validates every input (BR-PRJ-002, BR-PRJ-008, BR-TEAM-003), creates the project in `BOOKED` with its sessions, copies the package items as listed in the form (the service's items with the Owner's changes) into project items and every booking field (metadata and value) into project field values in the service's order (BR-PRJ-001), snapshots the service currency (BR-PRJ-007), generates the client access token (BR-PRJ-003), and records who created it and when.
6. The project detail page opens with a success toast.

## Alternative Flows
- **Save as draft:** *Simpan draf* does the same as step 5 with status `DRAFT`. Required booking fields are still required (BR-PRJ-002, Owner 2026-10-02); sessions are optional. On a draft, *Konfirmasi booking* moves it to `BOOKED`, which needs at least one session: without one it shows *Tambahkan minimal satu sesi sebelum konfirmasi booking.* and opens *Tambah sesi*.
- **Edit the deal (`DRAFT` or `BOOKED`, BR-PRJ-009):**
  - *Ubah info* changes the title, agreed price and notes.
  - On an item, *Ubah nilai* changes its value. *Hapus* removes the item after confirmation.
  - *Tambah item* snapshots an active definition the project doesn't use yet, with a value.
  - *Ubah field booking* edits the values. Required fields stay required, and the field names, types and options never change.
  - Nothing touches the service.
- **After shooting starts:** from `SHOOTING` on, the deal is read-only. Only title, notes and sessions can still change (A-6).
- **Sessions (BR-TEAM-003, Owner 2026-10-02):**
  - On *Proyek baru*, the *Jadwal* card lists the sessions being added; *Tambah sesi* opens the session form (modal on desktop, sheet on phones), each row has *Ubah* and *Hapus*, and nothing is stored until the project is saved.
  - On the detail page, *Jadwal* lists the stored sessions in order (BR-TEAM-003); adding, editing and deleting save immediately with a toast, in every status except `CANCELLED`.
  - The last session of a `BOOKED`-or-later project can't be deleted: *Hapus* is disabled with the hint *Proyek yang sudah dibooking butuh minimal satu sesi.*
- **Advance status (BR-PRJ-004):** the header shows the next manual step: *Konfirmasi booking* (`DRAFT → BOOKED`), *Mulai pemotretan* (`BOOKED → SHOOTING`), *Selesai pemotretan* (`SHOOTING → POST_PROCESSING`). Each is one click with no confirmation, followed by a toast. Later statuses come from F-12.
- **Cancel (`BOOKED` or `SHOOTING`, BR-PRJ-010):** *Batalkan proyek* asks for confirmation, with a reason that is required from `SHOOTING`. The project becomes `CANCELLED`, recording actor, time and reason (BR-AUD-001). It moves to *Dibatalkan* and becomes read-only.
- **Row menu (⋯) on the list (Owner 2026-10-02):** every row has a menu built from the next step for its status, *Ubah info*, a *Kirim ke klien* group, and the destructive action. The detail page's menu offers the same items. The link to the detail page is the whole text of the *Proyek* cell (title and *client · service*); the rest of the row isn't a link.

  | Status | Project | *Kirim ke klien* | Destructive |
  |---|---|---|---|
  | `DRAFT` | *Konfirmasi booking* · *Ubah info* | *Chat WhatsApp* | *Hapus draf* |
  | `BOOKED` | *Mulai pemotretan* · *Ubah info* | *Chat WhatsApp* | *Batalkan proyek* |
  | `SHOOTING` | *Selesai pemotretan* · *Ubah info* | *Chat WhatsApp* | *Batalkan proyek* |
  | `POST_PROCESSING`, `DELIVERED` | *Ubah info* | *Chat WhatsApp* | — |
  | `COMPLETED`, `CANCELLED` | — | *Chat WhatsApp* | — |

  - **Order:** the step and *Ubah info* first; a divider, then the *Kirim ke klien* group under its label; a divider, then the destructive item.
  - **Chat WhatsApp (BR-MSG-001):** the fallback when no message template applies to the project, which in F-07 is always. It opens a WhatsApp chat with the client's stored number (BR-CLI-002) in a new tab, with no prefilled text. Nothing is sent or stored by the app. Once later features add template items, *Chat WhatsApp* shows only when none of them applies (Owner 2026-10-02).
  - **Client without a number:** the group holds *Tambah nomor WhatsApp* instead, which opens the F-06 *Ubah klien* dialog; after saving, the menu offers *Chat WhatsApp*.
  - **Later features** add their template messages to this group, labelled by what the message does (*Kirim invoice*, *Kirim link galeri* …), and don't add separate menus. The target menus are drawn in `projects.pen` › *Row menu per status / Target* and listed in `feature-map.md` › Project menu.
  - **Behaviour:** status steps, cancel and delete work exactly as on the detail page (same confirmations, errors and toasts), except that the list stays open and refreshes the row. *Ubah info* opens the same dialog.
- **Delete a draft (BR-PRJ-010):** *Hapus draf* asks for confirmation (*Hapus draf "{title}"?*). The project and its snapshots are deleted, and the list opens with a toast.
- **Search and filter:**
  - Search narrows the selected filter to projects whose title or client name contains the text, ignoring case.
  - No match shows *Tidak ada proyek yang cocok* with *Hapus pencarian*.
- **Filter (A-11, Owner 2026-10-02):** the icon button next to the search opens *Filter proyek*, a modal on desktop and a bottom sheet on phones. It holds:
  - **Status:** a dropdown with a checkbox per status (Multi-select), only on *Berjalan* (*Draf*, *Dibooking*, *Pemotretan*, *Pascaproduksi*, *Terkirim*);
  - **Jadwal:** *Dari* and *Sampai* dates, matching projects with any session in the range, plus *Sertakan proyek tanpa jadwal*;
  - **Layanan:** several services, archived ones included;
  - **Klien:** one client.

  *Terapkan* applies the filters together with the search inside the selected tab; *Reset* clears them. While filters are active, the button shows a red counter with the number of active filter groups (Status, Jadwal, Layanan, Klien). There is no text label and no chip row.
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
  - *Buat proyek* with no session → *Tambahkan minimal satu sesi.* on the *Jadwal* card (drafts may have none);
  - a session without a name or date, a name over 100 characters, a location over 200 characters, an end time without a start time, or an end time not after the start time → field error in the session form;
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
  - a service with no booking fields and no items (the *Field booking* card is hidden, here and on the detail page; Owner 2026-10-02);
  - no active service;
  - field errors;
  - inactive client or service;
  - no session yet, and sessions added;
  - the session form (add, edit, field errors);
  - submitting, showing the pending state on the pressed button;
  - server error.
- **Detail:**
  - one state per status: `DRAFT`, `BOOKED`, `SHOOTING` (deal read-only), `POST_PROCESSING`, and `CANCELLED` (banner with reason, read-only);
  - no items, no booking fields;
  - sessions, with the last one not deletable from `BOOKED`;
  - status action pending.
- **Dialogs:**
  - *Ubah info*, *Tambah sesi* / *Ubah sesi*, *Hapus sesi*, *Tambah item*, *Ubah nilai*, *Ubah field booking*, *Batalkan proyek* and *Hapus draf*;
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
- BR-TEAM-002, BR-TEAM-003 — sessions belong to the project; session record
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
  - order (Owner 2026-10-02):
    - *Berjalan* is by the date of the project's shown session (A-12), earliest first;
    - *Selesai* and *Dibatalkan* are by that date, latest first;
    - in every filter, projects without a session come last, and ties go by creation time, newest first;
  - 30 per page, keyset paging, and the count ignores the search, as in F-06 (A-5, A-10);
  - the query is kept in the URL (`?q=`).
- **A-11 Filter parameters:**
  - filters are kept in the URL next to `?q=`, so a reload or a shared link keeps them;
  - a status filter on *Selesai* or *Dibatalkan* is ignored;
  - *Dari* after *Sampai* is a field error on *Sampai*;
  - the list count stays the tab total, as for the search;
  - no match shows the same *Tidak ada proyek yang cocok* state, with *Hapus pencarian* also clearing the filters.
- **A-12 Shown session (*Acara*):**
  - the list's *Acara* cell and the detail header show the project's next session: the earliest one dated today or later, or, when all are past, the latest one;
  - the cell shows *{weekday}, {date} · {start time}* (no time when there is none) and the location below; when the project has more sessions, *· +{n} sesi* follows the location (or the date when there is no location);
  - a project without sessions shows *Belum ada jadwal* in muted text.
- **A-5 Status labels:** *Draf*, *Dibooking*, *Pemotretan*, *Pascaproduksi*, *Terkirim*, *Selesai*, *Dibatalkan*, shown with the Status Chip.
- **A-6 Title, notes and sessions:**
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
- F-08 Team: assignments and session status build on the F-07 sessions.
- F-08 to F-15 build on the project. F-07 adds no placeholders for their sections (team, gallery, invoices, add-ons).

## Out of Scope
- **Owned by later features:**
  - team assignments and session status (F-08);
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
- **Design:** APPROVED 2026-10-02, 94 frames in `projects.pen`; see [design.md](design.md).
