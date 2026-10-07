# Business Rules

Status: ACCEPTED (migrated from `_source/` decisions 1–62 and blueprint §2–§11 on 2026-09-25)

Rule IDs are stable. Never renumber; deprecate with `~~strikethrough~~` + reason. Tests and acceptance criteria reference these IDs.

---

## Authentication & Account (AUTH)

### BR-AUTH-001 — Only Owners authenticate
Only internal Owner users have accounts in MVP. Clients never log in; freelancers (TeamMembers) have no access.

### BR-AUTH-002 — Single identity record
The conceptual `User` is exactly one identity record owned by the auth system, extended with domain `status` (`ACTIVE` | `SUSPENDED` | `DISABLED`) and `emailVerifiedAt`. No second domain user record exists. User IDs are opaque (not assumed UUID).

### BR-AUTH-003 — Verified email before workspace
An Owner must have a verified email before creating or opening a workspace.

### BR-AUTH-004 — Onboarding redirect
A verified Owner with zero workspaces is redirected to first-workspace creation.

### BR-AUTH-005 — Non-active users are blocked
`SUSPENDED` or `DISABLED` users cannot access owner features. Status is checked on every owner request, not only at login.
In MVP there is no admin actor and no admin UI: status is changed only by the platform operator through an operational script, which also revokes all of that user's sessions. *(Resolved in F-01 discovery, 2026-09-25.)*

### BR-AUTH-006 — Sign-in methods
An Owner signs in with email + password and/or Google. Both resolve to the same single identity (BR-AUTH-002), matched by email. A Google sign-in is accepted only when Google reports the email as verified, and it counts as email verification for BR-AUTH-003. Google sign-in grants identity only (`openid email profile`) — never Drive access (BR-SRC-001, ADR-005).

### BR-AUTH-007 — Automatic, safe account linking
When a Google sign-in matches an existing account's email, Google is linked to that account automatically. If that account was still unverified, it becomes verified, its password is removed, and all its sessions are revoked before the Google session starts — so whoever registered the email beforehand loses access.

### BR-AUTH-008 — Google-only accounts have no password
An Owner whose account has only Google linked signs in with Google only: they have no password to change, and a forgot-password request for their email sends nothing (the response looks the same as for any email). Adding a password or unlinking Google is out of MVP scope.

---

## Workspace & Tenancy (WS)

### BR-WS-001 — One owner, many workspaces
A Workspace is one brand/business, owned by exactly one Owner. An Owner may own 0..* workspaces.

### BR-WS-002 — Tenant isolation
All tenant data (clients, services, projects, galleries, invoices, payments, templates, source configs, team members and all their children) belongs to exactly one workspace. No relationship may cross workspaces.

### BR-WS-003 — Workspace context is verified
Every Owner action resolves an active workspace and verifies the Owner owns it. A workspace ID supplied by the browser is never trusted without that check.

### BR-WS-004 — Workspace profile
A workspace has a name (required), an optional brand name shown to clients (falling back to the name when empty), optional contact email, phone and address, an invoice prefix (BR-WS-005), and a default currency (BR-CUR-001, IDR only). There is no logo in MVP. *(F-02 discovery, Owner 2026-09-27.)*

### BR-WS-005 — Invoice prefix
Every workspace has an invoice prefix, suggested from its name at creation and editable later. A change applies only to invoices numbered afterwards; issued invoice numbers never change (C-102, BR-INV-001). *(F-02 discovery, Owner 2026-09-27.)*

### BR-WS-006 — Active workspace after sign-in
After sign-in, a verified Owner with zero workspaces goes to first-workspace creation (BR-AUTH-004). Otherwise the workspace they opened most recently opens; there is no workspace-selection step. Creating, opening or switching to a workspace counts as opening it, so every workspace has a last-opened time from the moment it is created. *(F-02 discovery, Owner 2026-09-27; selection step removed after research, Owner 2026-09-27.)*

### BR-WS-007 — Workspaces are not archived or deleted in MVP
An Owner can create and edit workspaces only. Archiving and deleting are out of MVP scope. *(F-02 discovery, Owner 2026-09-27.)*

---

## Communication (MSG)

### BR-MSG-001 — Share by deep link only
The platform generates prefilled WhatsApp deep links; the Owner reviews and sends manually. No messages are sent by the system and no message history/delivery status is stored in MVP.

### BR-MSG-002 — Template types
Templates are workspace-level with type `GALLERY_SHARE` | `INVOICE_SHARE` | `PAYMENT_REMINDER` | `FINAL_DELIVERY` | `SELECTION_REMINDER` and channel `WHATSAPP` (MVP). At most one active template per workspace/type/channel. In MVP every workspace has **exactly one** template per type/channel, always active: the Owner edits its content or restores the default, and cannot create, delete or deactivate templates. *(F-03 discovery, Owner 2026-09-28.)*

### BR-MSG-003 — Gallery password in messages
`{{galleryPassword}}` is resolved server-side from the gallery's encrypted password during the Owner's share action; the Owner does not re-enter it. It is never logged; the Owner is told the password will appear in the WhatsApp link/draft. *(Amended in F-09 design, Owner 2026-10-04; previously required re-entry against the hash. ADR-017.)*

### BR-MSG-004 — Template output is sanitized
Template variables are validated and output is sanitized before building the link. Generated links containing passwords are never logged.


### BR-MSG-005 — Default templates are seeded
Every workspace gets the platform's default content for all five types when it is created; workspaces that exist before F-03 are backfilled. Restoring a default replaces only that one template's content. *(F-03 discovery, Owner 2026-09-28.)*

### BR-MSG-006 — Variables are typed per template type
A template may use only the variables its type allows, written `{{name}}`, and must contain its type's required link variable. Unknown variables, malformed placeholders and a missing required link are rejected on save, on the server. *(F-03 discovery, Owner 2026-09-28; catalogue approved by the Owner 2026-09-28.)*

| Type | Allowed variables | Required |
|---|---|---|
| all types | `clientName`, `projectTitle`, `brandName` | — |
| `GALLERY_SHARE` | + `galleryUrl`, `galleryPassword` | `galleryUrl` |
| `SELECTION_REMINDER` | + `galleryUrl` | `galleryUrl` |
| `FINAL_DELIVERY` | + `galleryUrl`, `galleryPassword` | `galleryUrl` |
| `INVOICE_SHARE` | + `invoiceNumber`, `invoiceTotal`, `invoiceUrl` | `invoiceUrl` |
| `PAYMENT_REMINDER` | + `invoiceNumber`, `invoiceTotal`, `invoiceBalance`, `invoiceUrl` | `invoiceUrl` |

`brandName` resolves to the workspace's client-facing name (BR-WS-004). `galleryPassword` follows BR-MSG-003.

**SPEC GAP (deferred to F-14 discovery):** `dueDate` appears in the source examples, but invoices have no due date in BR-INV-*; it is added to the catalogue only if F-14 introduces one.

**SPEC GAP (deferred to F-11 discovery):** a selection-deadline variable for `SELECTION_REMINDER`; selection groups have no deadline in BR-SEL-*; it is added to the catalogue only if F-11 introduces one.

---

## Source configuration (SRC)

### BR-SRC-001 — Provider-agnostic sources
Provider configuration lives at workspace level (`WorkspaceSourceConfig`); concrete folders are `GallerySource`s. MVP provider: `GOOGLE_DRIVE` only. The domain depends on a provider interface, never on Drive types.

### BR-SRC-002 — Public Drive links, read-only
MVP accepts only Owner-supplied Drive folder links shared "Anyone with the link". The platform reads metadata only — no Owner OAuth, no service account, no folder creation, no uploads.

### BR-SRC-003 — Credentials never reach clients
The platform API key is a server secret, never stored in `configData`/gallery data and never sent to browsers. Drive folder links, folder IDs and resource keys are never exposed in any browser response, Owner or client; only the file IDs of photos the reader may see are. *(Amended: F-09 free-tier rework, Owner 2026-10-05, ADR-019.)*

### BR-SRC-004 — Public-link warning
During source setup the Owner is warned that anyone holding the direct Drive link bypasses gallery token and password.

### BR-SRC-005 — Workspace sources are Owner-managed
A workspace has zero or more `WorkspaceSourceConfig`s. Each has a provider, a display name (1–60 characters after trimming, unique per workspace ignoring case), `configData` and `isActive`. In MVP only `GOOGLE_DRIVE` can be added, with empty `configData`; other providers (Dropbox, OneDrive, S3, Custom URL) are shown as coming soon and cannot be added. Every workspace starts with one active Google Drive source named *Google Drive*: it is created with the workspace and backfilled for workspaces that exist before F-04. The Owner may add, rename, deactivate, reactivate and delete sources. *(F-04 discovery, Owner 2026-10-01.)*

### BR-SRC-006 — Inactive and deleted sources
An inactive source keeps its data but cannot be chosen for a new gallery source. A source can be deleted only while no gallery source refers to it; otherwise the Owner deactivates it instead. *(F-04 discovery, Owner 2026-10-01.)*

Gallery sources that already use a source keep syncing after the source is deactivated, and still count as active for BR-GAL-004. *(F-09 discovery, Owner 2026-10-04.)*

---

## Catalog (CAT)

### BR-CAT-001 — Package value types
Package item definitions have `valueType` `NUMBER` or `RANGE` only. `NUMBER` = one non-negative decimal; `RANGE` = non-negative `min` ≤ `max`. Validated on every write.

### BR-CAT-002 — Selection items are whole numbers
A definition with `selectionRequired = true` must be `NUMBER`, and its values must be non-negative whole numbers. Selection entitlements never derive from a range.

### BR-CAT-003 — Templates affect only the future
Services, service items, item definitions, and booking-field definitions are templates. Changes affect only projects created afterwards.

### BR-CAT-004 — Archive, don't delete, referenced templates
A definition or service referenced by historical snapshots can only be archived.

### BR-CAT-005 — One item per definition per service
A service uses each item definition at most once.

### BR-CAT-006 — Booking field keys are unique per service
Booking field types: `TEXT` | `NUMBER` | `DATE` | `BOOLEAN` | `SELECT` | `TEXTAREA`. Booking fields are independent from package item value types.

### BR-CAT-007 — Selection types
A definition has a `pickMode` exactly when `selectionRequired = true`. The pick mode is `COUNT` (each picked photo uses one place) or `QUANTITY` (each picked photo has a quantity), and the Owner chooses it per definition, so a studio can add its own selection items (album, frame, canvas…) without a code change (BR-SEL-003). A selection definition also has `allowsPickNotes` (default off): when on, the client may write a note on each photo picked for it (BR-SEL-004). *(F-10 design, Owner 2026-10-05: per-pick client notes.)* *(F-05 discovery, Owner 2026-10-02; the fixed `EDIT`/`PRINT` types were replaced by a pick mode in F-10 discovery, Owner 2026-10-05.)*

### BR-CAT-008 — Catalog lifecycle: active, archived, deleted
Categories, item definitions and services are created active. The Owner may archive and unarchive them at any time; archived records keep their data but are not offered for new services, new service items or new projects, and existing services keep using them until changed. A record may be deleted only while nothing refers to it: a category with no services, a definition used by no service and no snapshot, a service from which no project was created. Otherwise it can only be archived (BR-CAT-004). There is no draft or publish step. *(F-05 discovery, Owner 2026-10-02.)*

### BR-CAT-009 — Catalog names
Category, item-definition and service names are 1–60 characters after trimming and unique per workspace among records of the same kind, ignoring case, archived records included. A booking field's name is unique within its service, ignoring case. *(F-05 discovery, 2026-10-02.)*

### BR-CAT-010 — Definition type is fixed once used
A definition's `valueType`, `selectionRequired` and `pickMode` cannot change while any service item uses it; its name and unit can. This keeps every stored service-item value valid (BR-CAT-001, BR-CAT-002). *(F-05 discovery, 2026-10-02.)*

### BR-CAT-011 — Seeded item definitions
Every workspace starts with active item definitions *Foto edit* (`NUMBER`, unit *foto*, pick mode `COUNT`, pick notes on), *Foto cetak* (`NUMBER`, unit *lembar*, pick mode `QUANTITY`, pick notes off), *Jumlah orang* (`RANGE`, unit *orang*) and *Durasi pemotretan* (`NUMBER`, unit *jam*). They are created with the workspace and backfilled for workspaces that exist before F-05; the backfill skips a workspace that already has a definition with the same name. They are ordinary definitions: the Owner may edit, archive or delete them. No categories or services are seeded. *(F-05 discovery, Owner 2026-10-02.)*

---

## Client (CLI)

### BR-CLI-001 — Client record
A client belongs to one workspace and never logs in (BR-AUTH-001). It has a name (1–100 characters after trimming; not unique), an optional WhatsApp number (BR-CLI-002) and 0–10 social-media links. Each link has a platform (`INSTAGRAM`, `TIKTOK`, `FACEBOOK`, `YOUTUBE`, `X`, `OTHER`) and a value: a handle (stored without a leading `@`) or an `https://` URL, 1–200 characters after trimming. A client can't have the same platform and value twice (ignoring case and a leading `@`); links keep the Owner's order. There are no phone, email or address fields in MVP. *(F-06 discovery, Owner 2026-10-02.)*

### BR-CLI-002 — WhatsApp number
The WhatsApp number is optional. It is normalized before validation: spaces, `-`, `.` and parentheses are removed; then only the first matching step applies: a leading `+` is dropped, otherwise a leading `0` becomes `62`, otherwise a leading `8` gets `62` in front. The result must be 10–15 digits, must not start with `0`, and must not continue with `0` after a leading `62`. It is stored in that form (country code, digits only), which is what WhatsApp deep links need (BR-MSG-001). A number is unique per workspace across active and archived clients, enforced by the database; another workspace may use the same number. *(F-06 discovery, Owner 2026-10-02.)*

### BR-CLI-003 — Archived and deleted clients
The Owner may archive a client and restore it. An archived client keeps its data and its projects but can't be chosen for a new project. A client can be deleted only while no project refers to it; otherwise the Owner archives it instead. *(F-06 discovery, Owner 2026-10-02.)*

---

## Project (PRJ)

### BR-PRJ-001 — Snapshot on creation
Creating a project from a service atomically copies every service item (with name, valueType, value, unit, selectionRequired, pickMode, allowsPickNotes) into `ProjectItem`s and every booking value (with fieldKey, fieldName, fieldType) into `ProjectFieldValue`s. While creating the project, the Owner may already adjust the deal as BR-PRJ-009 allows (item values, removing items, adding items from active definitions), and the snapshot stores the adjusted items in the same transaction. *(F-07 design, Owner 2026-10-02.)* Snapshots are the authoritative deal; `serviceId` is only an origin reference.

### BR-PRJ-002 — One value per booking field
A project has at most one value per logical booking `fieldKey`. Required booking fields must be valid on creation.

### BR-PRJ-003 — Client access token
Each project gets one cryptographically random, unique, high-entropy client access token at creation. It is shared by the gallery link and all issued invoice links of that project. Rotating it invalidates every previously shared gallery and invoice link of that project.

### BR-PRJ-004 — Project lifecycle
`DRAFT → BOOKED → SHOOTING → POST_PROCESSING → DELIVERED → COMPLETED`; `DRAFT | BOOKED | SHOOTING → CANCELLED` (cancel from `SHOOTING` requires an audit reason). `CANCELLED` is terminal in MVP.
`DRAFT → BOOKED`, `BOOKED → SHOOTING` and `SHOOTING → POST_PROCESSING` are manual Owner actions, one step forward at a time; sessions never move a project's status. Moving a project to `BOOKED` (created as `BOOKED` or confirmed from `DRAFT`) requires at least one session (BR-TEAM-003). Publishing final delivery moves a `BOOKED`, `SHOOTING` or `POST_PROCESSING` project to `DELIVERED` (BR-DEL-003). No transition goes backwards. *(F-07 discovery, Owner 2026-10-02.)*

### BR-PRJ-005 — Completion is manual
Only the Owner can move a `DELIVERED` project to `COMPLETED`, recording actor and timestamp. Outstanding invoice balances are shown as a warning but never block completion.

### BR-PRJ-006 — Billing never drives project status
Invoice or payment state never changes project status automatically.

### BR-PRJ-007 — Currency snapshot
A project snapshots its service's currency; all project prices, add-ons, and invoices use that currency.

### BR-PRJ-008 — Project record
A project belongs to one workspace, one client and one service of that workspace (BR-WS-002). It is created from an active service for an active client (BR-CAT-008, BR-CLI-003); archiving either later leaves the project unchanged. It has a title (1–100 characters after trimming, not unique), optional internal notes (at most 2000 characters, never shown to the client) and an agreed price (whole IDR, ≥ 0) that starts at the service's base price. The Owner creates it either as `DRAFT` or directly as `BOOKED`; both require valid required booking fields (BR-PRJ-002), and `BOOKED` also requires at least one session (BR-TEAM-003). The project has no event date of its own: its schedule is its sessions. *(F-07 discovery, Owner 2026-10-02; event date replaced by sessions in F-07 design, Owner 2026-10-02.)*

### BR-PRJ-009 — The deal is editable until shooting starts
While a project is `DRAFT` or `BOOKED`, the Owner may change its agreed price, the values of its project items, its booking-field values, and add or remove project items. An added item is snapshotted from an active item definition that the project doesn't use yet (one item per definition per project), with values valid under BR-CAT-001/002. Edited booking values must stay valid for the snapshotted field type; required fields stay required. Field metadata (key, name, type, options) never changes. From `SHOOTING` onwards the deal is read-only; later changes go through add-ons (BR-ADD-*) or invoices. Edits never touch the service template (BR-CAT-003). *(F-07 discovery, Owner 2026-10-02.)* Once a selection item has a group (BR-SEL-001), an edit is refused if it would remove an item whose group has selections, lower a value below the group's usage, or change an item whose group is no longer `OPEN`. *(F-10 discovery, Owner 2026-10-05.)* Removing an item is also refused while an `APPROVED` add-on targets its group (cancel the add-on first, BR-ADD-005); `DRAFT` and `CANCELLED` add-ons on that group lose their target and stay, since none of them changed the limit (BR-ADD-002). *(F-10 build, Owner 2026-10-07.)*

### BR-PRJ-010 — Deleting and cancelling projects
A `DRAFT` project can be deleted permanently, with its snapshots. Any other project is never deleted: `BOOKED` and `SHOOTING` projects are cancelled instead (BR-PRJ-004), recording actor and timestamp (BR-AUD-001). *(F-07 discovery, Owner 2026-10-02.)* Cancelling also archives the project's published or expired gallery in the same transaction (BR-GAL-005). *(F-09 discovery, Owner 2026-10-04.)*

---

## Team & Sessions (TEAM)

### BR-TEAM-001 — Freelancers are resources
Freelancers are workspace `TeamMember`s without login. A project may have zero, one, or many assignments. Each assignment puts one member on one session of the project, in one role (BR-TEAM-006). F-08 records no fees or payments for freelancers (Owner 2026-10-03). *(Assignment per session: F-08 discovery, Owner 2026-10-03.)*

### BR-TEAM-002 — Sessions belong to a project
A project may have 0..* sessions; a project that is `BOOKED` or later keeps at least one (BR-TEAM-003). Photos may optionally reference a session of the same project.
Sessions have no stored status in MVP. Screens may label a session by its date relative to today, but nothing is stored and nothing is clicked. Assignments have no status either. *(F-08 discovery, Owner 2026-10-03; resolves the session- and assignment-status SPEC GAP. Fee payment status dropped with BR-TEAM-007, Owner 2026-10-03.)*

### BR-TEAM-003 — Session record
A session is one shoot of a project, created and edited by the Owner (F-07; team assignments stay in F-08). It has a name (1–100 characters after trimming, e.g. *Akad*, *Resepsi*), a date, an optional start time, an optional end time (only with a start time, and later than it on the same day) and an optional location (free text, at most 200 characters). Times are local wall-clock times of the workspace, stored without a time zone. Sessions are listed by date, then start time (sessions without a time first), then creation time. A `DRAFT` project may have none; creating a project as `BOOKED` or confirming a draft requires at least one, and the last session of a `BOOKED`-or-later project can't be deleted. Sessions can be added, edited and deleted in every status except `CANCELLED`. *(F-07 design, Owner 2026-10-02.)*

### BR-TEAM-004 — Team member record
A team member belongs to one workspace and never logs in (BR-AUTH-001). It has:
- a name (1–100 characters after trimming; not unique);
- a WhatsApp number, which is required. It is normalized and validated as in BR-CLI-002, and is unique per workspace across active and archived members, enforced by the database. Client numbers are a separate set, so one person can be both a client and a member.
- an optional email (a valid address, at most 254 characters, stored in lower case; not unique);
- one or more roles from the workspace's role list (BR-TEAM-005).

A member has no rate or other money fields (Owner 2026-10-03).

A member is archived and restored at any time. Archiving keeps their existing assignments, but an archived member can't be assigned again. A member is deleted permanently only while no assignment refers to them. *(F-08 discovery, Owner 2026-10-03.)*

### BR-TEAM-005 — Team roles
Each workspace keeps a list of role names: 1–50 characters after trimming, unique per workspace ignoring case. Every workspace starts with *Fotografer*, *Videografer* and *Asisten*. These are created with the workspace and backfilled for workspaces that existed before F-08; the backfill skips a name the workspace already has. The Owner may add and rename roles. A role is deleted only while no member and no assignment uses it. Renaming a role changes its name wherever it is shown. *(F-08 discovery, Owner 2026-10-03.)*

### BR-TEAM-006 — Session assignment
An assignment links one active member (BR-TEAM-004) to one session of a project in the same workspace (BR-TEAM-003), in one role, which must be one of the member's roles when the assignment is saved. It has no fee (Owner 2026-10-03).

A member is assigned at most once per session, enforced by the database. Archiving a member, or removing a role from them, leaves their existing assignments unchanged. An assignment is never edited: to change the member or the role, the Owner removes it and adds a new one (Owner 2026-10-03, design). Assignments are added and removed in every project status except `CANCELLED`.

Deleting a session deletes its assignments, and deleting a draft project deletes the assignments of its sessions. *(F-08 discovery, Owner 2026-10-03; fee, fee prefill and the paid-delete guard removed, Owner 2026-10-03.)*

### ~~BR-TEAM-007 — Fee payment status~~
**Deprecated (Owner 2026-10-03):** freelancer fees and their payment are out of F-08 and wait for their own feature (feature map › *Team fees*). The rule was: ~~An assignment's fee is `UNPAID` or `PAID`, starting `UNPAID`. The Owner marks it `PAID` with a payment date (default today, not in the future), recording who did it and when. The Owner can undo that, back to `UNPAID`, which clears the date. While an assignment is `PAID`, its fee, role and member can't change and it can't be removed. Payment can be marked or undone in every project status, `CANCELLED` included. This only records money the Owner pays outside the app: it is not a payment in BR-PAY-* and never touches invoices or project status (BR-PRJ-006). *(F-08 discovery, Owner 2026-10-03.)*~~

---

## Gallery (GAL)

### BR-GAL-001 — One gallery per project
A project has at most one gallery. The gallery owns no files; photos are metadata references to external files.

### BR-GAL-002 — Required password, encrypted and Owner-visible
Every gallery has a password, set when the gallery is created, so no gallery exists without one. Shutrly proposes an easy-to-type generated password that the Owner may keep, regenerate or replace; a password is 6–64 characters. It is stored encrypted with a server-side key, next to a hash used for verification (ADR-017). Only the Owner of the workspace can see it, on the gallery screen; it is decrypted only server-side, never logged, and never sent to anyone but that Owner and the client message they build (BR-MSG-003). *(F-09 discovery and design review, Owner 2026-10-04.)*

### BR-GAL-003 — Password rotation
The Owner may rotate the gallery password at any time; Shutrly proposes a new generated password, which the Owner may replace. Rotation replaces the encrypted password and the hash, increments `passwordVersion`, and immediately invalidates the old password and all gallery sessions authenticated under older versions. Invoice links are unaffected. The Owner is reminded to share the new password.

### BR-GAL-004 — Publish preconditions
A gallery can be published only with a password hash and at least one active, accessible source. Draft galleries may have zero sources. A gallery source is *active* while it is linked to the gallery (not removed, BR-GAL-009); deactivating its workspace source does not change that (BR-SRC-006). It is *accessible* when the provider can list its folder at the moment of publishing: publishing checks every linked source again and is refused if none passes. *(F-09 discovery, Owner 2026-10-04.)*

### BR-GAL-005 — Gallery lifecycle
`DRAFT → PUBLISHED → EXPIRED | ARCHIVED`; `EXPIRED → PUBLISHED | ARCHIVED`. Every public request honors `status` and `expiresAt`.
- **Expiry:** none by default. The Owner may set an expiry date or a duration in days, and change or remove it at any time before archiving. A duration on a draft is kept as a duration and becomes `expiresAt` when the gallery is published; on a published gallery it counts from the moment it is saved. A published gallery whose `expiresAt` has passed is `EXPIRED`.
- **Re-opening:** an `EXPIRED` gallery returns to `PUBLISHED` when the Owner sets a later expiry or removes it; the link and password are unchanged.
- **Ending:** `ARCHIVED` is final in MVP; there is no unpublish. A `DRAFT` gallery (never published) may be deleted with its sources and photo records; a gallery that was ever published is archived instead. Cancelling the project archives a `PUBLISHED` or `EXPIRED` gallery in the same transaction (BR-PRJ-010); a `DRAFT` gallery stays and can only be deleted. *(F-09 discovery, Owner 2026-10-04.)*

### BR-GAL-006 — Idempotent sync
Sync upserts photos by `(gallerySource, externalFileId)` and records sync status, time, and error. Repeated syncs never duplicate photos. Sync runs only when the Owner links a source or asks for it; nothing is scheduled. A photo whose file is no longer found is kept and marked *missing*: it is hidden from the client and flagged to the Owner, and it becomes visible again if a later sync finds the file. Sync errors never record the Drive link (C-103). *(F-09 discovery, Owner 2026-10-04.)*

### BR-GAL-007 — Folder classification
A source is synced with its whole folder tree. An image's kind comes from its nearest ancestor folder named `edited` or `print` (case-insensitive, at any depth): that folder makes it `EDITED` or `PRINT`. Every other image, in the source root or in any other subfolder (for example `Akad`, `Resepsi`, `raw`), is `PROOF`. Each photo keeps its folder path, so the Owner can browse the tree. Non-image files are ignored. *(F-09 design review, Owner 2026-10-04.)*

### BR-GAL-008 — Slug is display-only
An optional gallery slug never grants access.

### BR-GAL-009 — Gallery record and sources
A gallery belongs to one project of the same workspace (BR-WS-002). The Owner can create it while the project is `BOOKED`, `SHOOTING`, `POST_PROCESSING`, `DELIVERED` or `COMPLETED`; never on a `DRAFT` or `CANCELLED` project. On a `CANCELLED` project an unarchived gallery can't be published, synced or edited. Each gallery source is created from an active workspace source (BR-SRC-006) and a public folder link (BR-SRC-002). A folder (by its provider folder ID) is linked at most once per gallery; another gallery may link the same folder, and the Owner is warned. The Owner may remove a source from a non-archived gallery unless that would leave a published or expired gallery without an active source (BR-GAL-004); its photos are kept but hidden, like missing photos (BR-GAL-006). An `ARCHIVED` gallery is read-only: no sync, no source changes, no password rotation. *(F-09 discovery, Owner 2026-10-04.)*

---

## Client Access (ACC)

### BR-ACC-001 — Gallery access
Gallery access requires a valid project token (`/g/{token}`) **and** the correct current gallery password, on a published, non-expired gallery.

### BR-ACC-002 — Invoice access
Issued invoices are accessible by project token + invoice ID (`/i/{token}/{invoiceId}`) and only if the invoice belongs to that project. Draft and cancelled invoices are Owner-only.

### BR-ACC-003 — Owner sessions don't grant client access
Client-facing endpoints authorize only via the project token (+ password for gallery). Client endpoints never reveal other projects' data.

### BR-ACC-004 — Abuse limits
Password attempts, public gallery access, and public selection submissions are rate-limited.

### BR-ACC-005 — Controlled media
Clients receive photos either through a server-controlled URL or from Google's public image host by file ID (`lh3.googleusercontent.com/d/<fileId>`, ADR-019), and only for photos they may see (BR-GAL-007, BR-DEL-002). Folder links, folder IDs, resource keys and API keys are never exposed. Private gallery/invoice pages and JSON are never publicly cached. A client who saw a photo may keep its image URL after the gallery expires or its password changes, because the file is already link-shared on Drive (BR-SRC-004). *(Amended: F-09 free-tier rework, Owner 2026-10-05.)*

---

## Selection (SEL)

### BR-SEL-001 — Selection groups are the entitlement
Each project item with `selectionRequired = true` yields one selection group with `baseLimit` = the item's whole-number value. A project may have zero groups. There is no project-wide photo limit.
Groups exist from the moment the gallery is first published, so the client can select from then on. While the deal is still editable (BR-PRJ-009), groups follow the project items: an added selection item gets an `OPEN` group, and a changed value changes `baseLimit`. *(F-10 discovery, Owner 2026-10-05.)*

### BR-SEL-002 — Effective limit is derived
`effectiveLimit = baseLimit + extraLimit`, never stored. `extraLimit` = sum of `quantity` of approved add-ons targeting the group, maintained transactionally.

### BR-SEL-003 — Usage
A group's usage depends on the pick mode of its project item (BR-CAT-007):

| Pick mode | Usage | A pick has | Typical item |
|---|---|---|---|
| `COUNT` | number of picked photos | quantity fixed at 1 | *Foto edit*, *Foto album* |
| `QUANTITY` | sum of pick quantities | a whole-number quantity ≥ 1 | *Foto cetak*, *Foto bingkai* |

Usage may never exceed `effectiveLimit`. Any number of selection items, each with its own name, unit and mode, may exist; each becomes its own group (BR-SEL-001). *(F-10 discovery, Owner 2026-10-05; closes the SPEC GAP deferred from F-05.)*

### BR-SEL-004 — Only proof photos are selectable
A selection references a `PROOF` photo from the gallery of the group's own project. One row per `(group, photo)`; quantity > 0. A photo may be selected in several groups. When the group's project item allows pick notes (BR-CAT-007), a selection may carry an optional client note of at most 500 characters; the note is changed only while the group is `OPEN` (BR-SEL-005), is checked and saved like a pick (BR-SEL-006), and is shown to the Owner with the pick. *(F-10 design, Owner 2026-10-05: per-pick client notes.)*

### BR-SEL-005 — Group lifecycle
`OPEN → SUBMITTED → LOCKED`; `OPEN → LOCKED` (Owner locks or closes). Clients may change selections only while `OPEN`. A submission that uses the whole effective limit makes the group `SUBMITTED`. A submission below the limit (after the client confirms the places left) records `submittedAt` and keeps the group `OPEN`: the client may still add, remove and change picks and notes and submit again, until a submission reaches the limit or the Owner locks the group. The Owner locks a `SUBMITTED` group, or an `OPEN` group the client has sent (*Kunci pilihan*), and closes an `OPEN` group never sent (*Tutup pilihan*). *(Owner 2026-10-07: a partial submission keeps the remaining places open.)* A `SUBMITTED` group returns to `OPEN` only when an add-on that targets it is approved (BR-ADD-004), so the client can use the extra places and submit again; picks already made are kept. A `LOCKED` group never reopens, and nothing else reopens a group. Status lives only on the group. *(F-10 modelling, Owner 2026-10-05.)*

### BR-SEL-006 — Concurrency-safe submission
Selection changes and submission validate limits inside one transaction holding a lock on the group, so concurrent requests cannot exceed entitlement.

### BR-SEL-007 — Clients see effective limits only
Clients see "used / effective" per group, without a separate add-on bucket.

---

## Final Delivery (DEL)

### BR-DEL-001 — Same link, same password
Final delivery uses the existing gallery link and password. No separate delivery URL.

### BR-DEL-002 — Hidden until published
`EDITED`/`PRINT` files are hidden from clients until final delivery is published. They are never selectable and never count toward limits.

### BR-DEL-003 — Publishing final delivery
Requires at least one synced `EDITED` or `PRINT` file and a project in `BOOKED`, `SHOOTING` or `POST_PROCESSING` (BR-PRJ-004); records `finalDeliveryPublishedAt` and moves the project to `DELIVERED` (never to `COMPLETED`).

### BR-DEL-004 — Independent finished files
Each finished file is an independent download with no link to its original proof photo; no inference from names/paths. The client may download one file, several chosen files, or all finished files at once; a bulk download never exposes the Drive folder link or folder ID (BR-ACC-005). *(Download modes: F-10 discovery, Owner 2026-10-05.)*

---

## Add-ons (ADD)

### BR-ADD-001 — Add-on vs discount
Add-ons add entitlement/service and usually add to billing. Discounts only reduce an invoice total and never change entitlement.

### BR-ADD-002 — Selection target
An add-on that changes selection entitlement must target a selection group (`selectionGroupId`) of the same project, set before approval. If `relatedProjectItemId` is also set it must equal the group's source project item.

### BR-ADD-003 — Lifecycle
`DRAFT → APPROVED → CANCELLED`, and `DRAFT → CANCELLED`. An approved add-on's target and quantity are never edited in place; use a new add-on or cancel + replace.

### BR-ADD-004 — Approval effects are atomic
Approval, in one transaction: increases the target group's `extraLimit` (if selection-related) and adds an invoice line to the project's sole draft invoice, creating one if none exists; invoice totals are recalculated.
Approving an add-on on a `SUBMITTED` group also returns that group to `OPEN` (BR-SEL-005); a `LOCKED` group can't be targeted. *(F-10 modelling, Owner 2026-10-05.)*
Until invoices exist (F-14), approval only increases `extraLimit` and keeps quantity, unit price and total on the add-on. When F-14 ships, every approved add-on that is not yet on an invoice is added to the project's draft invoice under this rule. *(F-10 discovery, Owner 2026-10-05.)*

### BR-ADD-005 — Safe cancellation
Cancellation is rejected if the reduced limit would be below current usage. If the add-on is on an issued or paid invoice, cancellation requires an explicit billing adjustment. Draft invoice lines are removed/recalculated in the same transaction.

### BR-ADD-006 — Quantities and prices
Quantity > 0; unit price and total ≥ 0; `totalAmount = quantity × unitPrice`; currency = project currency.

---

## Invoice (INV)

### BR-INV-001 — Numbering
Invoice numbers are unique within a workspace (using the workspace invoice prefix).

### BR-INV-002 — One draft per project
A project has at most one `DRAFT` invoice at a time and any number of issued invoices.

### BR-INV-003 — Issue preconditions and immutability
Issuing requires at least one line. After issue, lines (description, quantity, unit price, amount) and discount are immutable except through an explicit adjustment flow.

### BR-INV-004 — Server-calculated totals
`subtotal = Σ line amounts`; `total = subtotal − discount`; always computed server-side.

### BR-INV-005 — Discount
One optional nominal discount per invoice, `0 ≤ discount ≤ subtotal`, editable only in `DRAFT`. No coupons, percentages, or per-line discounts.

### BR-INV-006 — Status
`DRAFT → UNPAID` on issue. `UNPAID` / `PARTIALLY_PAID` / `PAID` are derived from the sum of non-voided payments and never edited directly. `DRAFT | UNPAID → CANCELLED`.

---

## Payment (PAY)

### BR-PAY-001 — Manual recording
The Owner records payments with positive amount, date, method, optional reference and notes. No gateway, proof upload, or refunds.

### BR-PAY-002 — No overpayment
A payment above the invoice's remaining balance is rejected.

### BR-PAY-003 — Void, don't delete
A mistaken payment is voided (actor + timestamp recorded); the row is kept, excluded from the paid sum, and invoice status is recalculated in the same transaction.

### BR-PAY-004 — Idempotent recording
Payment recording is idempotent against duplicate submissions.

---

## Currency & Money (CUR)

### BR-CUR-001 — IDR only, codes persisted
MVP accepts IDR only, displayed as whole rupiah. Currency codes are stored on workspace default, service, project, and invoice; add-ons inherit the project currency, invoice lines and payments inherit the invoice currency.

### BR-CUR-002 — No mixing, no tax
No mixed currencies within a project or invoice, no conversion, no automatic tax.

### BR-CUR-003 — Exact money
Money is exact decimal; never floating point.

---

## Audit (AUD)

### BR-AUD-001 — Sensitive actions are auditable
Project completion, project cancellation, payment void, password rotation, token rotation, selection lock, and add-on approval/cancellation record actor and timestamp.
