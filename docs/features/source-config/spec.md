# Feature: Source configuration (photo sources)

ID: F-04 · Slug: `source-config`
Status: SPECIFIED (2026-10-01; rescoped by the Owner the same day: Owner-managed sources, no link checker) · Journeys: none directly; prepares J-04 and J-06 (F-09 gallery sources)
Consumer: F-09 `gallery` (a gallery source picks one active workspace source)

## Goal
Each workspace keeps a list of its photo sources, the storage providers its galleries read from. In MVP the only provider that can be added is Google Drive (public folder links); the other planned providers are visible as coming soon. The Owner names, adds, deactivates and deletes sources, and is told what a public Drive link means for clients' photos.

## User Story
As a photographer (Owner), I want to set up where my photos come from, for example *Google Drive Utama* and *Google Drive Arsip*, so that when I create a gallery I just pick a source and paste the folder link.

## Preconditions
- F-02 Workspace (DONE): verified `WorkspaceContext`, App Shell, workspace creation.
- F-17 App Shell (DONE): the nav slot `client-sources` (*Sumber klien*), currently a *Segera hadir* placeholder. F-04 renames it (A-1).
- ADR-016: workspace creation and seeding share one transaction, opened in composition.
- Actor: a signed-in, verified, active Owner inside a workspace they own (BR-WS-003).

## Inputs
| Screen | Fields |
|---|---|
| Sumber foto (list) | none · per source: *Ganti nama*, *Nonaktifkan* / *Aktifkan*, *Hapus* · page action *Tambah sumber* |
| Tambah sumber | provider (Google Drive; Dropbox, OneDrive, Amazon S3, Custom URL shown as *Segera hadir*, not selectable) · display name |
| Ganti nama | display name |

Display name rules: BR-SRC-005. There are no provider settings to enter: Google Drive's `configData` is empty, and the folder link is pasted per gallery in F-09 (BR-SRC-002).

## Main Flow — add a Google Drive source
1. Owner opens *Sumber foto*. The server verifies the workspace and lists its sources, active first, then by name (A-3). Each row shows the provider icon, the display name, the provider name and an *Aktif* / *Nonaktif* status.
2. The page also shows a short Google Drive setup guide and the public-link warning (BR-SRC-004, A-4).
3. Owner selects *Tambah sumber*. A dialog shows the provider choice, with Google Drive selected and the other providers disabled as *Segera hadir*, a display-name field, and the public-link warning.
4. Owner enters a name and confirms. The server validates the name (BR-SRC-005), creates an active `GOOGLE_DRIVE` source with empty `configData`, and records who and when.
5. The dialog closes, the list shows the new source, and a success toast confirms.

## Alternative Flows
- **Rename:** *Ganti nama* opens a dialog with the current name. On save, the server validates and stores it; a toast confirms.
- **Deactivate / reactivate:** *Nonaktifkan* takes effect at once, without confirmation, because it is reversible: the row shows *Nonaktif* and a toast confirms with *Batalkan*. *Aktifkan* reverses it. Inactive sources can't be chosen for new gallery sources (BR-SRC-006, enforced in F-09).
- **Delete:** *Hapus* asks for confirmation (*Hapus sumber "{name}"?*). On confirm, the server deletes it if no gallery source refers to it (BR-SRC-006); a toast confirms. Until F-09 exists, nothing can refer to a source.
- **No sources left:** the list shows an empty state, *Belum ada sumber foto*, with *Tambah sumber* (A-5).
- **New workspace:** created with one active *Google Drive* source in the same transaction (BR-SRC-005, ADR-016).
- **Existing workspaces:** a data migration backfills the *Google Drive* source for every workspace that has none. Only the Owner applies migrations (AGENTS.md).

## Error Cases
- Empty name (after trim) or longer than 60 characters → field error; nothing saved.
- The name already exists in the workspace, ignoring case, including a race with another tab → field error *Nama ini sudah dipakai di workspace ini*; nothing saved. The database's unique index is the authority (C-003).
- A provider other than Google Drive, sent by bypassing the form → rejected by the server (C-004).
- Delete of a source that a gallery source refers to → *Sumber ini dipakai gallery. Nonaktifkan saja.* (F-09 onward); nothing deleted.
- The source, or the workspace in the URL or request, is not owned or doesn't exist → *not found*, no data (BR-WS-003, ADR-015). A workspace ID in the body is never trusted.
- Unexpected server error → danger toast with *Coba lagi*; the dialog keeps the input, and stored data is unchanged (C-007).

## UI States (C-007)
- List: loading, populated, empty, a row with an inactive source.
- Add / rename dialog: idle, field error, submitting (button pending), server error (toast).
- Delete confirmation: idle, deleting, blocked (in use).
- Toasts: added, renamed, deactivated (with *Batalkan*), reactivated, deleted, server error.

## Business Rules
- BR-SRC-001 — provider-agnostic sources (the provider is data; F-09 adds the provider interface)
- BR-SRC-002 — Google Drive public links, read-only (why `configData` is empty)
- BR-SRC-003 — no credentials in `configData` or the browser
- BR-SRC-004 — public-link warning
- BR-SRC-005 — Owner-managed sources, seeded and backfilled
- BR-SRC-006 — inactive and deleted sources
- BR-WS-002, BR-WS-003 — tenant isolation, verified workspace context
- Constitution: C-003, C-004, C-006, C-007, C-008, C-101, C-103
- ADR-003, ADR-005, ADR-015, ADR-016

## Assumptions (low-risk, reversible — confirm or change anytime)
- **A-1 Nav label and route (Owner 2026-10-01):** the slot *Sumber klien* becomes *Sumber foto*, slug `photo-sources` (`/w/[workspaceId]/photo-sources`), same position, icon `folder-open`. The library nav label and icon are already updated; the shell and its tests change with the build.
- **A-2 Seeded source:** named *Google Drive*, active, `configData` `{}`.
- **A-3 List order:** active sources first, then inactive; each group by name (case-insensitive).
- **A-4 Setup guide (Indonesian, reviewed in design):** one root folder per project; proofs directly in the root; `edited` and `print` subfolders added later for final delivery; share the root as *Siapa saja yang memiliki link — Pelihat*. The folder link itself is pasted when creating a gallery (F-09).
- **A-5 Zero sources is allowed** (domain `0..*`). The Owner may deactivate or delete the last source; F-09 asks them to add or reactivate one when a gallery needs it.
- **A-6 Coming-soon providers:** Dropbox, OneDrive, Amazon S3, Custom URL, in that order, from the blueprint's list. They are UI only; the database accepts only `GOOGLE_DRIVE` in MVP.
- **A-7 Audit:** each source stores `createdAt`, `updatedAt` and `updatedBy`; no history.
- **A-8 Concurrent edits:** last write wins, except name uniqueness, which the database enforces.

## Dependencies
- F-02 Workspace: `WorkspaceContext`, App Shell, workspace creation (seeding hooks into its transaction per ADR-016).
- F-17 App Shell: the nav slot (renamed by A-1).
- F-09 Gallery: lets the Owner pick an active source for each gallery source, adds the `GallerySourceProvider` interface, the Drive adapter, link validation and the in-use check for delete.

## Out of Scope
- Adding providers other than Google Drive, and any provider credentials or OAuth (BR-SRC-002, ADR-005, scope.md).
- Checking or storing a Drive folder link, syncing, thumbnails, media delivery (F-09, F-10). The link checker from the first F-04 draft is dropped (Owner 2026-10-01).
- Per-source settings, usage counts per source, history.

## Open Questions / SPEC GAPS
- **SPEC GAP (deferred to F-09):** the effect of deactivating a source on gallery sources that already use it (recorded under BR-SRC-006).
- For design: `/sdv:design-feature source-config` needs the list (populated, inactive row, empty, loading), the add dialog (default, field error, submitting), rename, delete confirmation and the toasts, desktop and phone, as HTML exports (AGENTS.md).
