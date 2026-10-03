# Feature: Team

ID: F-08 · Slug: `team-sessions`
Status: IN PROGRESS (Slices 1–5 built and the Slice 6 sweep and E2E specs written 2026-10-04; E2E, axe and the fidelity pass not yet run; planned 2026-10-04, [technical-design.md](technical-design.md), [plan.md](plan.md)); designed 2026-10-03 ([design.md](design.md)); specified and modelled 2026-10-03 ([diagrams](diagrams/)); scope cut 2026-10-03: no money · Journeys: J-03 (*Sessions → Assign team → Confirm → BOOKED*)
Consumer: F-18 `team-fees` (not scheduled) would add rates, fees and payment tracking to these assignments.

## Goal
The Owner keeps a list of the freelancers they hire, each with a WhatsApp number and their roles. On a project's sessions, the Owner records who works and in which role. Freelancers never log in (BR-AUTH-001), and the app never sends them anything (C-106). F-08 has no money: rates, fees and payments wait for F-18 (Owner 2026-10-03).

## User Story
As a photographer (Owner), I want to record which freelancers work each session of a project, so that I can plan my crew and reach them quickly.

## Preconditions
- F-02 Workspace (DONE): verified `WorkspaceContext` (ADR-015), App Shell.
- F-07 Projects (DONE, on `main`): projects, the project detail page, and the sessions of its *Jadwal* card (BR-TEAM-003).
- F-17 App Shell (DONE): the nav slot `team` (*Tim*, icon `user-round-cog`, under the *Katalog* group). Today it's a *Segera hadir* placeholder at `/w/[workspaceId]/team`. F-08 replaces the placeholder with the real page; the label, icon and position stay.
- Actor: a signed-in, verified, active Owner inside a workspace they own (BR-WS-003).

## Inputs
| Screen | Fields |
|---|---|
| Tim › *Anggota* (list) | search (name or WhatsApp number) · filter *Aktif* / *Arsip* · list title *Daftar anggota* with the count for the selected filter · per member: name, WhatsApp number, roles · row menu: *Ubah*, *Buka WhatsApp*, *Arsipkan* / *Pulihkan*, *Hapus* · page action *Tambah anggota* |
| Tambah anggota / Ubah anggota | name · WhatsApp number · email (optional) · roles (1 or more, chosen from the role list, with *Tambah peran baru*) |
| Tim › *Peran* | role names, each with how many members use it · *Tambah peran* · per role: *Ubah*, *Hapus* |
| Project detail › *Jadwal* (extends F-07) | per session, after its text and before ⋯: an avatar group of its team (at most 3 initials avatars, then *+n*) that opens *Atur tim*, or, with no team, an Icon Button/Ghost/SM `user-plus` that opens the Penugasan form directly. The session ⋯ menu gains, before F-07's *Ubah sesi* / *Hapus sesi*: *Tambah tim* (no team yet; opens the Penugasan form) or *Atur tim* (has a team; opens the list) (Owner 2026-10-03, design) |
| *Atur tim* (dialog on desktop, sheet on phones) | title *Tim · {session}*, the session's date, times and location · the session's assignments: avatar, member name, role, and an Icon Button/Ghost/SM `trash-2` in the danger colour (*Hapus dari sesi*, Owner 2026-10-03) · *Tambah anggota* · *Selesai* (desktop; closes). It has no empty state: it only opens for a session with a team, and removing the last assignment closes it (Owner 2026-10-03) |
| Penugasan form (add only) | title *Tambah anggota · {session}* · member (active members not on the session yet) · role (one of the member's roles) · *Batal* / *Tambah*. There is no session field: it is the session the form was opened from, either the `user-plus` button, ⋯ › *Tambah tim*, or *Atur tim* › *Tambah anggota* (A-12) |

Field rules: BR-TEAM-004 (member), BR-TEAM-005 (roles), BR-TEAM-006 (assignment).

## Main Flow — staff a session
1. The Owner opens *Tim*. The server verifies the workspace and lists its active members by name (A-3). The list sits under *Daftar anggota*, with the active count.
2. The Owner selects *Tambah anggota*. A dialog (a full-height sheet on phones) shows name, WhatsApp number (hint *Contoh: 0812 3456 7890*), email and roles.
3. The Owner fills in *Dimas Pratama*, `0812 9876 5432` and the roles *Fotografer* and *Videografer*, then saves. The server validates the input (BR-TEAM-004), normalizes the number, creates an active member, and records who did it and when. A toast confirms.
4. The Owner opens a `BOOKED` project. The *Resepsi* session in *Jadwal* has no team yet, so it shows the `user-plus` button; the Owner selects it (or ⋯ › *Tambah tim*). The Penugasan form opens directly.
5. The *Tambah anggota · Resepsi* form lists the active members who aren't on *Resepsi* yet. The Owner picks *Dimas Pratama*, and the role field offers his roles with the first one preselected.
6. The Owner picks *Videografer* and saves. The server locks the project row and runs these checks:
   - the project isn't `CANCELLED`;
   - the session belongs to the project;
   - the member is active, belongs to the workspace and isn't on the session yet;
   - the role is one of the member's roles.

   It then creates the assignment. The form closes, the *Resepsi* row in *Jadwal* shows his avatar instead of the `user-plus` button, and a toast confirms. Further members are added through the avatar group (or ⋯ › *Atur tim*) › *Tambah anggota*.

## Alternative Flows
- **Remove an assignment:** in *Atur tim*, the row's `trash-2` button (*Hapus dari sesi*) asks for confirmation (*Hapus Dimas dari Resepsi?*). Removing the last assignment closes *Atur tim*, and the session shows the `user-plus` button again.
- **Change a role:** assignments aren't edited. The Owner removes the assignment and adds the member again with the other role (BR-TEAM-006, Owner 2026-10-03).
- **Search, filter and paging (as F-06):**
  - the search matches the name, ignoring case, or the digits of the number;
  - *Aktif* / *Arsip* are routes shown as tabs;
  - the list loads 30 at a time, with *Muat lebih banyak* (A-3).
- **Edit a member:** *Ubah* (or selecting the row) opens the member dialog with the stored values. There is no member detail page (A-1).
- **Archive / restore a member:**
  - *Arsipkan* takes effect at once, with a toast offering *Batalkan*.
  - An archived member keeps their assignments, appears in *Atur tim* with *(diarsipkan)*, and isn't offered in the Penugasan form.
  - *Pulihkan* makes them active again.
- **Delete a member:** after confirmation (*Hapus anggota "{name}"?*), the member is deleted while no assignment refers to them (BR-TEAM-004).
- **Roles:**
  - Under the *Peran* tab, *Tambah peran* and *Ubah* open a one-field dialog (name), and *Hapus* asks for confirmation.
  - A new workspace already has *Fotografer*, *Videografer* and *Asisten* (BR-TEAM-005).
  - In the member form, *Tambah peran baru* creates a role in place and selects it (A-5).
- **Open WhatsApp:** *Buka WhatsApp* opens `https://wa.me/<number>` in a new tab, with no prefilled text (as F-06 A-6). The link is never logged.
- **Session and project interplay (BR-TEAM-006):**
  - deleting a session that has a team asks for confirmation naming the count (*Sesi ini punya 2 anggota tim. Penugasan mereka ikut terhapus.*);
  - deleting a draft project whose sessions have a team adds *Penugasan tim ikut terhapus.* to the *Hapus draf* confirmation;
  - cancelling a project keeps its assignments, read-only: avatar groups still open *Atur tim*, which shows the note *Proyek dibatalkan, tim tidak bisa diubah.*, no `trash-2` buttons and only *Tutup*; sessions without a team show no `user-plus` button, and the session ⋯ menu is gone (as in F-07).
- **No members yet:**
  - *Aktif* shows *Belum ada anggota tim* with *Tambah anggota*, and an empty *Arsip* shows *Belum ada anggota yang diarsipkan*.
  - With no active members, the Penugasan form shows an Empty State (the same pattern as F-07's empty project list): *Belum ada anggota tim aktif*, *Tambahkan anggota di halaman Tim dulu, lalu kembali ke sini.* and *Buka Tim*. *Tambah* is disabled.
- **No team yet:**
  - the session shows the `user-plus` Icon Button, and its ⋯ menu offers *Tambah tim*; both open the Penugasan form;
  - there is no empty *Atur tim* (Owner 2026-10-03);
  - a draft without sessions has nothing to staff, because sessions come first (F-07).

## Error Cases
- Name empty or longer than 100 characters → field error; nothing is saved.
- WhatsApp number missing → *Nomor WhatsApp wajib diisi*. A number that can't be normalized (BR-CLI-002 rules) → *Nomor WhatsApp tidak valid*.
- WhatsApp number already used by another member in the workspace, active or archived, including a race with another tab → *Nomor ini sudah dipakai {name}* (with *(diarsipkan)* when that member is archived). The database's unique index decides (C-003).
- Invalid email, or no role selected → a field error on that field.
- Role name problems:
  - empty or longer than 50 characters → a field error;
  - already used, ignoring case → *Peran ini sudah ada*;
  - deleting a role that a member or an assignment uses → *Peran ini masih dipakai {n} anggota.*, and nothing is deleted.
- Assignment rejected by the server: a member already on the session, an archived member, a role the member doesn't have, or a session of another project (including stale tabs). The server rejects it with a form error and the dialog stays open (C-004). The database's unique index on session and member decides duplicates (C-003).
- Writing to an assignment on a `CANCELLED` project → *Proyek dibatalkan; tim tidak bisa diubah.*
- Deleting a member who has assignments → *Anggota ini punya penugasan. Arsipkan saja.*; nothing is deleted.
- A member, role, session, assignment or workspace that isn't owned or doesn't exist → *not found*, with no data (BR-WS-003, ADR-015).
- An unexpected server error → danger toast *Perubahan belum tersimpan* with *Coba lagi*. The dialog keeps the input, and stored data is unchanged (C-007).

## UI States (C-007)
- Tim › Anggota: loading, populated, empty (*Aktif*), empty (*Arsip*), no search match, loading more, row menu open.
- Tim › Peran: populated, role in use (delete blocked), add/edit dialog with field error.
- Member dialog: idle, several roles selected, field errors (name, number, number taken, email, roles), creating a role inline, submitting.
- Project detail:
  - *Jadwal* sessions with an avatar group (1–3, and *+n*) and with the `user-plus` button;
  - the session ⋯ menu with *Tambah tim* (no team) or *Atur tim* (team);
  - the session delete confirmation with a team;
  - a cancelled project (avatar groups only, no `user-plus` and no session ⋯; *Atur tim* read-only with *Tutup*).
- *Atur tim*: populated (each row with `trash-2`), cancelled (read-only note, no *Tambah anggota*, no `trash-2`, only *Tutup*). No empty state.
- Penugasan form: add, no active members (Empty State, *Tambah* disabled), server error.
- Toasts:
  - members: added, saved, archived (*Batalkan*), restored, deleted;
  - roles: added, saved, deleted;
  - assignments: added, removed;
  - server error.

## Business Rules
- BR-TEAM-001 — freelancers are resources; assignments are per session
- BR-TEAM-002 — no stored session or assignment status
- BR-TEAM-003 — session record (F-07); deleting it deletes its assignments
- BR-TEAM-004 — team member record
- BR-TEAM-005 — team roles, seeded
- BR-TEAM-006 — session assignment
- ~~BR-TEAM-007~~ — deprecated: fees and payments wait for F-18
- BR-CLI-002 — WhatsApp normalization (reused for members)
- BR-AUTH-001 — freelancers never log in
- BR-PRJ-004, BR-PRJ-010 — assignments never move project status; delete and cancel behaviour
- BR-WS-002, BR-WS-003 — tenant isolation and verified workspace context
- Constitution:
  - C-003, C-004, C-006, C-007, C-008, C-101, C-106;
  - C-005: assignment writes lock the project row, so they see its current status;
  - C-103: no member PII or `wa.me` links in logs.
- ADR-003, ADR-015

## Assumptions (low-risk, reversible — confirm or change anytime)
- **A-1 Routes:** `/w/[workspaceId]/team` (*Anggota*, with `/team/archived` for *Arsip*) and `/team/roles` (*Peran*).
  - There is no member detail page; members are edited in a dialog, as clients are in F-06.
  - The tabs are *Aktif · Arsip · Peran* and work like F-05 *Layanan*: Page Header tabs on desktop, Segmented Control on phones. On phones a member row shows the roles as its meta; the number is reached through ⋯ › *Buka WhatsApp*.
  - *Tim* stays in the sidebar under *Katalog*, as on phones today; it isn't added to the bottom nav.
- **A-2 Assignments only on stored projects:** the team is staffed on the project detail page. *Proyek baru* doesn't offer it, because its sessions aren't stored until the project is saved.
- **A-3 Lists:** members are ordered by name ignoring case, with ties broken by creation time. Search is server-side over the selected filter and kept in `?q=`, with 30 per page and keyset paging. Roles are listed by name.
- **A-4 Order of assignments:** within a session, by creation time, both in *Atur tim* and in the avatar group.
- **A-5 Inline role creation:** the Peran dropdown ends with *Tambah peran baru*. It opens the *Tambah peran* dialog on top; after saving, the new role is selected in the member form. The same BR-TEAM-005 validation applies.
- **A-7 Undo:** *Arsipkan* applies immediately, with an undo toast.
- **A-8 Audit:** members, roles and assignments store `createdAt`, `updatedAt` and `updatedBy`, and a member also stores `archivedAt`. There is no history.
- **A-9 Seeding:** the three roles are created with each new workspace and backfilled by migration for existing ones, the same way F-05 seeds item definitions.
- **A-12 Atur tim (Owner 2026-10-03, design):** the team of one session is managed in *Atur tim*.
  - It opens from the session's avatar group or ⋯ › *Atur tim*, only when the session has a team. A session without a team opens the Penugasan form directly, from the `user-plus` button or ⋯ › *Tambah tim*.
  - Every add and removal saves at once with a toast; *Selesai* only closes.
  - Saving the Penugasan form returns to *Atur tim* (with the new row) when it was opened from there, and closes when it was opened from the `user-plus` button or ⋯ › *Tambah tim*.
  - The Penugasan form has no session field. An assignment is never edited or moved; remove it and add it again.
  - On desktop each avatar has a tooltip *{name} · {role}*.
- Removed with the money cut (Owner 2026-10-03): A-6 (rate and unpaid total), A-10 (rate units), A-11 (money off the project page).

## Dependencies
- F-07 Projects: the sessions, the *Jadwal* card, session delete and draft delete. Both deletes also remove the assignments (BR-TEAM-006); F-07 isn't built yet, so its technical design should cascade them.
- F-06 Clients: the WhatsApp normalization and the patterns for the list, dialog and archive.
- F-05 Catalog: the tab pattern.
- F-17 App Shell: the *Tim* nav slot.

## Out of Scope
- Any money for freelancers: rates, fees, payment status, totals, payouts or receipts. These move to F-18 *Team fees* (Owner 2026-10-03).
- Freelancer login, a freelancer portal, or any message sent to a freelancer (BR-AUTH-001, C-106).
- Prefilled WhatsApp text for freelancers, such as a session brief. F-15 covers templates for clients only.
- Availability calendars, double-booking warnings, and schedules across projects (scope.md).
- A member detail page (A-1).
- A stored session status, or marking a session done (BR-TEAM-002).

## Open Questions / SPEC GAPS
- None blocking.
- For design: `/sdv:design-feature team-sessions` needs these frames, on desktop and phone, as HTML exports (AGENTS.md):
  - Tim › Anggota: populated, archived, empty, no match, loading, row menu;
  - Tim › Peran: list, the role dialog with an error, delete blocked;
  - the member dialog: default, several roles, errors, inline role;
  - project detail: *Jadwal* with avatar groups and the `user-plus` button, and the session ⋯ menu with *Tambah tim* and with *Atur tim*;
  - *Atur tim*: populated, cancelled;
  - the Penugasan form: add, no active members;
  - the delete confirmations;
  - the toasts.
