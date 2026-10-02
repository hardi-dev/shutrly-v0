# Feature: Team

ID: F-08 · Slug: `team-sessions`
Status: SPECIFIED (2026-10-03; modelled 2026-10-03, [diagrams](diagrams/)) · Journeys: J-03 (*Sessions → Assign team → Confirm → BOOKED*)
Consumer: none in MVP. A future payout report or freelancer schedule would build on the assignments.

## Goal
The Owner keeps a list of freelancers they hire, each with a WhatsApp number, their roles and an optional rate. On a project's sessions the Owner assigns who works, in which role and for what fee. Later the Owner marks each fee as paid, so they always see what they still owe. Freelancers never log in (BR-AUTH-001), and the app never sends them anything (C-106).

## User Story
As a photographer (Owner), I want to record which freelancers work each session of a project and what I owe them, so that I can plan my crew and pay everyone correctly.

## Preconditions
- F-02 Workspace (DONE): verified `WorkspaceContext` (ADR-015), App Shell.
- F-07 Projects (PLANNED, built before F-08): projects, the project detail page, and the sessions of its *Jadwal* card (BR-TEAM-003).
- F-17 App Shell (DONE): the nav slot `team` (*Tim*, icon `user-round-cog`, under the *Katalog* group), which is a *Segera hadir* placeholder at `/w/[workspaceId]/team` today. F-08 replaces the placeholder with the real page; the label, icon and position stay.
- Actor: a signed-in, verified, active Owner inside a workspace they own (BR-WS-003).

## Inputs
| Screen | Fields |
|---|---|
| Tim › *Anggota* (list) | search (name or WhatsApp number) · filter *Aktif* / *Arsip* · list title *Daftar anggota* with the count for the selected filter · per member: name, WhatsApp number, roles, rate, unpaid fee total (A-6) · row menu: *Ubah*, *Buka WhatsApp*, *Arsipkan* / *Pulihkan*, *Hapus* · page action *Tambah anggota* |
| Tambah anggota / Ubah anggota | name · WhatsApp number · email (optional) · roles (1 or more, chosen from the role list) · rate (optional): amount + unit *per sesi* / *per hari* / *per jam* / *per menit* |
| Tim › *Peran* | role names, each with how many members use it · *Tambah peran* · per role: *Ubah*, *Hapus* |
| Member detail | name, number, email, roles, rate · *Penugasan*: the member's assignments (project, session, date, role, fee, payment status), filter *Belum dibayar* / *Semua* · *Tandai dibayar* / *Batalkan pembayaran* per assignment |
| Project detail › *Jadwal* (extends F-07) | for each session: its team (member, role, fee, paid chip) · *Tambah anggota* · per assignment: *Ubah*, *Tandai dibayar* / *Batalkan pembayaran*, *Hapus* |
| Penugasan form (add / edit) | member (active members only) · role (one of the member's roles) · fee (IDR, prefilled from the rate) |
| Tandai dibayar | payment date (default today) |

Field rules: BR-TEAM-004 (member), BR-TEAM-005 (roles), BR-TEAM-006 (assignment and fee prefill), BR-TEAM-007 (payment status).

## Main Flow — staff a session
1. The Owner opens *Tim*. The server verifies the workspace and lists its active members by name (A-3), under *Daftar anggota* with the active count.
2. The Owner selects *Tambah anggota*. A dialog (a full-height sheet on phones) shows name, WhatsApp number (hint *Contoh: 0812 3456 7890*), email, roles and rate.
3. The Owner fills in *Dimas*, `0812 9876 5432`, the roles *Fotografer* and *Videografer*, and a rate of Rp 1.500.000 *per sesi*, then saves. The server validates the input (BR-TEAM-004), normalizes the number, creates an active member, and records who did it and when. A toast confirms.
4. The Owner opens a `BOOKED` project. Under the *Resepsi* session in *Jadwal*, they select *Tambah anggota*.
5. The *Tambah penugasan* dialog lists the active members who aren't on this session yet. The Owner picks *Dimas*. The role field offers his roles, preselecting the first. The fee is prefilled with Rp 1.500.000 (BR-TEAM-006).
6. The Owner picks *Videografer*, keeps the fee and saves. The server locks the project row, checks that the project isn't `CANCELLED`, that the session belongs to it, that the member is active and in the workspace, and that the role is one of his roles. It then creates the assignment as `UNPAID`. The session now shows *Dimas · Videografer · Rp 1.500.000 · Belum dibayar*, and a toast confirms.
7. After the shoot the Owner pays Dimas outside the app. From the session (or from Dimas's detail page) they select *Tandai dibayar*, keep today's date and confirm. The assignment shows *Dibayar · {date}* (BR-TEAM-007), and his unpaid total on *Tim* goes down.

## Alternative Flows
- **Fee prefill by unit (BR-TEAM-006):**
  - *per jam* at Rp 300.000 for a 07.30–10.10 session gives 3 × 300.000 = Rp 900.000;
  - *per menit* at Rp 5.000 for the same session gives 160 × 5.000 = Rp 800.000;
  - *per hari* gives the rate itself;
  - a session without both times (for *per jam* / *per menit*), or a member without a rate, leaves the fee empty with the hint *Isi honor secara manual*.
  - Changing the member in the form recomputes the prefill. Once the Owner edits the fee, changing the role doesn't overwrite it.
- **Edit an assignment:** *Ubah* opens the same form. Its member, role and fee can change while it's `UNPAID`; the member can't be changed to one already on the session. If only the fee changes, an archived member, or a role since removed from the member, stays as it is (BR-TEAM-006). A `PAID` assignment shows the form read-only with the note *Batalkan pembayaran untuk mengubah.*
- **Remove an assignment:** *Hapus* asks for confirmation (*Hapus Dimas dari Resepsi?*). It's disabled while the assignment is `PAID`.
- **Undo payment:** *Batalkan pembayaran* takes effect at once, without confirmation, because marking paid again restores it. The toast offers *Batalkan* (A-7).
- **Member detail:** selecting a member's name opens their page. *Penugasan* lists their assignments, newest session first (A-4), with *Belum dibayar* selected by default. Each row links to its project and can be marked paid or undone there.
- **Search, filter and paging (as F-06):** the search matches the name, ignoring case, or the digits of the number; *Aktif* / *Arsip* are routes shown as tabs; the list loads 30 at a time with *Muat lebih banyak* (A-3).
- **Archive / restore a member:** *Arsipkan* takes effect at once with a toast offering *Batalkan*. An archived member keeps their assignments, appears on them with *(diarsipkan)*, and isn't offered in *Tambah penugasan*. *Pulihkan* makes them active again.
- **Delete a member:** after confirmation (*Hapus anggota "{name}"?*), the member is deleted while no assignment refers to them (BR-TEAM-004).
- **Roles:** under the *Peran* tab, *Tambah peran* and *Ubah* open a one-field dialog (name), and *Hapus* asks for confirmation. A new workspace already has *Fotografer*, *Videografer* and *Asisten* (BR-TEAM-005). In the member form, *Tambah peran baru* creates a role in place and selects it (A-5).
- **Open WhatsApp:** *Buka WhatsApp* opens `https://wa.me/<number>` in a new tab, with no prefilled text (as F-06 A-6). The link is never logged.
- **Session and project interplay (BR-TEAM-006):**
  - deleting a session that has unpaid assignments asks for confirmation naming them (*Sesi ini punya 2 anggota tim. Penugasan mereka ikut terhapus.*);
  - deleting a draft project whose sessions have unpaid assignments adds *Penugasan tim ikut terhapus.* to the *Hapus draf* confirmation;
  - deleting a session or a draft project is blocked while any of its assignments is paid;
  - cancelling a project keeps its assignments, which stay payable (BR-TEAM-007);
  - editing a session's times never changes stored fees.
- **No members yet:** *Aktif* shows *Belum ada anggota tim* with *Tambah anggota*, and an empty *Arsip* shows *Belum ada anggota yang diarsipkan*. In *Tambah penugasan* with no active members, the dialog shows *Belum ada anggota tim aktif* with a link to *Tim*.
- **Session without team:** the session shows *Belum ada tim* in muted text above *Tambah anggota*.

## Error Cases
- Name empty or longer than 100 characters → field error; nothing is saved.
- WhatsApp number missing → *Nomor WhatsApp wajib diisi*. A number that can't be normalized (BR-CLI-002 rules) → *Nomor WhatsApp tidak valid*.
- WhatsApp number already used by another member in the workspace, active or archived, including a race with another tab → *Nomor ini sudah dipakai {name}* (with *(diarsipkan)* when that member is archived). The database's unique index decides (C-003).
- Invalid email, no role selected, or a rate amount that isn't a whole number above 0, or that has no unit → a field error on that field.
- Role name empty, longer than 50 characters, or already used ignoring case → *Peran ini sudah ada*. Deleting a role that a member or an assignment uses → *Peran ini masih dipakai {n} anggota.*; nothing is deleted.
- Assignment fee empty, negative or not whole → field error. A member already on the session, an archived member, a role the member doesn't have, or a session of another project (including stale tabs) → the server rejects it with a form error and the dialog stays open (C-004).
- Writing to an assignment on a `CANCELLED` project → *Proyek dibatalkan; tim tidak bisa diubah.* Marking a payment or undoing one is still allowed.
- Editing or removing a `PAID` assignment (for example from a stale tab) → *Honor sudah ditandai dibayar*; nothing changes.
- Payment date in the future → field error.
- Deleting a member who has assignments → *Anggota ini punya penugasan. Arsipkan saja.*; nothing is deleted.
- Deleting a session or a draft with a paid assignment → *Ada honor yang sudah dibayar di sesi ini.*; nothing is deleted.
- A member, role, session, assignment or workspace that isn't owned or doesn't exist → *not found*, with no data (BR-WS-003, ADR-015).
- An unexpected server error → danger toast *Perubahan belum tersimpan* with *Coba lagi*. The dialog keeps the input, and stored data is unchanged (C-007).

## UI States (C-007)
- Tim › Anggota: loading, populated, empty (*Aktif*), empty (*Arsip*), no search match, loading more, row menu open.
- Tim › Peran: populated, role in use (delete blocked), add/edit dialog with field error.
- Member dialog: idle, several roles selected, field errors (name, number, number taken, email, roles, rate), creating a role inline, submitting.
- Member detail: assignments (unpaid filter, all), no assignments, archived member banner.
- Jadwal session: no team, team with unpaid and paid assignments, cancelled project (read-only team, payment actions only).
- Penugasan dialog: add with prefilled fee, add with empty fee (manual hint), no active members, edit, read-only (paid), server error.
- Tandai dibayar dialog: idle, date error, submitting.
- Toasts: member added, saved, archived (*Batalkan*), restored, deleted; role added, saved, deleted; assignment added, saved, removed; fee paid; payment undone (*Batalkan*); server error.

## Business Rules
- BR-TEAM-001 — freelancers are resources; assignments are per session
- BR-TEAM-002 — no stored session status; payment is the assignment's only status
- BR-TEAM-003 — session record (F-07); its delete rules gain the assignment check
- BR-TEAM-004 — team member record
- BR-TEAM-005 — team roles, seeded
- BR-TEAM-006 — session assignment and fee prefill
- BR-TEAM-007 — fee payment status
- BR-CLI-002 — WhatsApp normalization (reused for members)
- BR-AUTH-001 — freelancers never log in
- BR-PRJ-004, BR-PRJ-006, BR-PRJ-010 — assignments never move project status; delete and cancel behaviour
- BR-CUR-* — whole IDR
- BR-WS-002, BR-WS-003 — tenant isolation and verified workspace context
- Constitution: C-003, C-004, C-005 (every assignment write, payment or undo, and every session or draft delete locks the project row first, so a payment can't race a delete; see [diagrams/sequence.md](diagrams/sequence.md)), C-006, C-007, C-008, C-101, C-103 (no member PII or `wa.me` links in logs), C-105, C-106
- ADR-003, ADR-015

## Assumptions (low-risk, reversible — confirm or change anytime)
- **A-1 Routes:** `/w/[workspaceId]/team` (*Anggota*, with `/team/archived` for *Arsip*), `/team/roles` (*Peran*) and `/team/[memberId]`. The tabs work like F-05 *Layanan*: Page Header tabs on desktop, Segmented Control on phones. *Tim* stays in the sidebar under *Katalog*, as on phones today; it isn't added to the bottom nav.
- **A-2 Assignments only on stored projects:** the team is staffed on the project detail page. *Proyek baru* doesn't offer it, because its sessions aren't stored until the project is saved.
- **A-3 Lists:** members are ordered by name ignoring case, with ties broken by creation time. Search is server-side over the selected filter and kept in `?q=`, with 30 per page and keyset paging. Roles are listed by name.
- **A-4 Order of assignments:** within a session, by creation time. On the member page, by session date (newest first), then start time.
- **A-5 Inline role creation:** creating a role from the member form is a convenience and follows the same BR-TEAM-005 validation.
- **A-6 Rate and unpaid total in the list:**
  - the rate is shown as *Rp 1.500.000 / sesi*, or *Belum ada tarif* when the member has none;
  - the unpaid total is the server-side sum of the member's `UNPAID` fees, including those on cancelled projects. It's shown as *Belum dibayar Rp 2.400.000* when above 0 and hidden otherwise.
- **A-7 Undo:** *Batalkan pembayaran* and *Arsipkan* apply immediately, with an undo toast. *Tandai dibayar* asks for the date first.
- **A-8 Audit:** members, roles and assignments store `createdAt`, `updatedAt` and `updatedBy`, and a member also stores `archivedAt`. A paid assignment stores `paidOn` (the date the Owner entered), `paidAt` and `paidBy`. There is no history.
- **A-9 Seeding:** the three roles are created with each new workspace and backfilled by migration for existing ones, the same way F-05 seeds item definitions.
- **A-10 Unit labels:** `SESSION` *per sesi*, `DAY` *per hari*, `HOUR` *per jam*, `MINUTE` *per menit*.

## Dependencies
- F-07 Projects: the sessions, the *Jadwal* card, session delete and draft delete. F-08 adds the assignment check to both deletes (BR-TEAM-006). F-07 isn't built yet, so its technical design should leave room for a cascading, guarded delete.
- F-06 Clients: the WhatsApp normalization and the patterns for the list, dialog and archive.
- F-05 Catalog: the tab pattern, plus the money input and display.
- F-17 App Shell: the *Tim* nav slot.

## Out of Scope
- Freelancer login, a freelancer portal, or any message sent to a freelancer (BR-AUTH-001, C-106).
- Prefilled WhatsApp text for freelancers (for example a session brief); F-15 covers templates for clients only.
- Payout reports, exports, totals per period, receipts, or paying fees through the app.
- Availability calendars, double-booking warnings, and schedules across projects (scope.md).
- A project-level team cost total or margin on the project page (see the open questions).
- A stored session status, or marking a session done (BR-TEAM-002).
- Role-specific rates; a member has a single rate (BR-TEAM-004).

## Open Questions / SPEC GAPS
- None blocking.
- For design review: should the project detail show *Total honor tim* (and the unpaid part) next to the agreed price? It's out of scope until the Owner asks for it.
- For design: `/sdv:design-feature team-sessions` needs these frames, on desktop and phone, as HTML exports (AGENTS.md):
  - Tim › Anggota: populated, archived, empty, no match, row menu;
  - Tim › Peran;
  - the member dialog: default, several roles, errors;
  - the member detail;
  - the *Jadwal* session with a team: no team, unpaid and paid;
  - the Penugasan dialog: prefilled, manual, no members, read-only paid;
  - the Tandai dibayar dialog;
  - the delete confirmations;
  - the toasts.
