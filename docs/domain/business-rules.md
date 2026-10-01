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

### BR-MSG-003 — Gallery password in messages needs re-entry
`{{galleryPassword}}` can only be resolved during a share action in which the Owner re-enters the gallery password and it verifies against the stored hash. The raw password is never stored or logged; the Owner is told the password will appear in the WhatsApp link/draft.

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
The platform API key is a server secret, never stored in `configData`/gallery data and never sent to browsers. Direct Drive folder links are not exposed in client responses.

### BR-SRC-004 — Public-link warning
During source setup the Owner is warned that anyone holding the direct Drive link bypasses gallery token and password.

### BR-SRC-005 — Workspace sources are Owner-managed
A workspace has zero or more `WorkspaceSourceConfig`s. Each has a provider, a display name (1–60 characters after trimming, unique per workspace ignoring case), `configData` and `isActive`. In MVP only `GOOGLE_DRIVE` can be added, with empty `configData`; other providers (Dropbox, OneDrive, S3, Custom URL) are shown as coming soon and cannot be added. Every workspace starts with one active Google Drive source named *Google Drive*: it is created with the workspace and backfilled for workspaces that exist before F-04. The Owner may add, rename, deactivate, reactivate and delete sources. *(F-04 discovery, Owner 2026-10-01.)*

### BR-SRC-006 — Inactive and deleted sources
An inactive source keeps its data but cannot be chosen for a new gallery source. A source can be deleted only while no gallery source refers to it; otherwise the Owner deactivates it instead. *(F-04 discovery, Owner 2026-10-01.)*

**SPEC GAP (deferred to F-09 discovery):** whether gallery sources under a deactivated workspace source keep syncing and count as *active* for BR-GAL-004.

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
A definition has a `selectionType` exactly when `selectionRequired = true`. In MVP the only selection types are `EDIT` and `PRINT`; others (album, frame, custom) are added only when their selection behavior is specified (BR-SEL-003). *(F-05 discovery, Owner 2026-10-02.)*

### BR-CAT-008 — Catalog lifecycle: active, archived, deleted
Categories, item definitions and services are created active. The Owner may archive and unarchive them at any time; archived records keep their data but are not offered for new services, new service items or new projects, and existing services keep using them until changed. A record may be deleted only while nothing refers to it: a category with no services, a definition used by no service and no snapshot, a service from which no project was created. Otherwise it can only be archived (BR-CAT-004). There is no draft or publish step. *(F-05 discovery, Owner 2026-10-02.)*

### BR-CAT-009 — Catalog names
Category, item-definition and service names are 1–60 characters after trimming and unique per workspace among records of the same kind, ignoring case, archived records included. A booking field's name is unique within its service, ignoring case. *(F-05 discovery, 2026-10-02.)*

### BR-CAT-010 — Definition type is fixed once used
A definition's `valueType`, `selectionRequired` and `selectionType` cannot change while any service item uses it; its name and unit can. This keeps every stored service-item value valid (BR-CAT-001, BR-CAT-002). *(F-05 discovery, 2026-10-02.)*

### BR-CAT-011 — Seeded item definitions
Every workspace starts with active item definitions *Foto edit* (`NUMBER`, unit *foto*, selection `EDIT`), *Foto cetak* (`NUMBER`, unit *lembar*, selection `PRINT`), *Jumlah orang* (`RANGE`, unit *orang*) and *Durasi pemotretan* (`NUMBER`, unit *jam*). They are created with the workspace and backfilled for workspaces that exist before F-05; the backfill skips a workspace that already has a definition with the same name. They are ordinary definitions: the Owner may edit, archive or delete them. No categories or services are seeded. *(F-05 discovery, Owner 2026-10-02.)*

---

## Project (PRJ)

### BR-PRJ-001 — Snapshot on creation
Creating a project from a service atomically copies every service item (with name, valueType, value, unit, selectionRequired, selectionType) into `ProjectItem`s and every booking value (with fieldKey, fieldName, fieldType) into `ProjectFieldValue`s. Snapshots are the authoritative deal; `serviceId` is only an origin reference.

### BR-PRJ-002 — One value per booking field
A project has at most one value per logical booking `fieldKey`. Required booking fields must be valid on creation.

### BR-PRJ-003 — Client access token
Each project gets one cryptographically random, unique, high-entropy client access token at creation. It is shared by the gallery link and all issued invoice links of that project. Rotating it invalidates every previously shared gallery and invoice link of that project.

### BR-PRJ-004 — Project lifecycle
`DRAFT → BOOKED → SHOOTING → POST_PROCESSING → DELIVERED → COMPLETED`; `DRAFT | BOOKED | SHOOTING → CANCELLED` (cancel from `SHOOTING` requires an audit reason). `CANCELLED` is terminal in MVP.
**SPEC GAP (deferred to F-07 discovery):** whether `BOOKED → SHOOTING` and `SHOOTING → POST_PROCESSING` are manual Owner actions or derived from sessions; from which states final delivery may move a project to `DELIVERED` (see BR-DEL-003).

### BR-PRJ-005 — Completion is manual
Only the Owner can move a `DELIVERED` project to `COMPLETED`, recording actor and timestamp. Outstanding invoice balances are shown as a warning but never block completion.

### BR-PRJ-006 — Billing never drives project status
Invoice or payment state never changes project status automatically.

### BR-PRJ-007 — Currency snapshot
A project snapshots its service's currency; all project prices, add-ons, and invoices use that currency.

---

## Team & Sessions (TEAM)

### BR-TEAM-001 — Freelancers are resources
Freelancers are workspace `TeamMember`s without login. A project may have zero, one, or many assignments, each with its own role and fee.

### BR-TEAM-002 — Sessions belong to a project
A project may have 0..* sessions. Photos may optionally reference a session of the same project.
**SPEC GAP (deferred to F-08 discovery):** session status values and assignment status values.

---

## Gallery (GAL)

### BR-GAL-001 — One gallery per project
A project has at most one gallery. The gallery owns no files; photos are metadata references to external files.

### BR-GAL-002 — Required password, hash only
Every gallery has a password; only its hash is stored. The plaintext is accepted only at setup, Owner re-entry for sharing, and rotation.

### BR-GAL-003 — Password rotation
The Owner may rotate the gallery password at any time. Rotation replaces the hash, increments `passwordVersion`, and immediately invalidates the old password and all gallery sessions authenticated under older versions. Invoice links are unaffected. The Owner is reminded to share the new password.

### BR-GAL-004 — Publish preconditions
A gallery can be published only with a password hash and at least one active, accessible source. Draft galleries may have zero sources.

### BR-GAL-005 — Gallery lifecycle
`DRAFT → PUBLISHED → EXPIRED | ARCHIVED`; `EXPIRED → ARCHIVED`. Every public request honors `status` and `expiresAt`.

### BR-GAL-006 — Idempotent sync
Sync upserts photos by `(gallerySource, externalFileId)` and records sync status, time, and error. Repeated syncs never duplicate photos.

### BR-GAL-007 — Folder classification
Image files directly in the source root are `PROOF`. Files directly inside child folders named `edited` / `print` (case-insensitive) are `EDITED` / `PRINT`. Other folders and deeper nesting are ignored in MVP.

### BR-GAL-008 — Slug is display-only
An optional gallery slug never grants access.

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
Clients receive media through server-controlled or short-lived URLs; provider URLs and API keys are never exposed. Private gallery/invoice responses are never publicly cached.

---

## Selection (SEL)

### BR-SEL-001 — Selection groups are the entitlement
Each project item with `selectionRequired = true` yields one selection group with `baseLimit` = the item's whole-number value. A project may have zero groups. There is no project-wide photo limit.

### BR-SEL-002 — Effective limit is derived
`effectiveLimit = baseLimit + extraLimit`, never stored. `extraLimit` = sum of `quantity` of approved add-ons targeting the group, maintained transactionally.

### BR-SEL-003 — Usage
Usage for quantity-based groups (e.g. `PRINT`) = sum of selection quantities; otherwise = count of selections. Usage may never exceed `effectiveLimit`.
**SPEC GAP (deferred to F-11 discovery):** exact rule deciding quantity-based vs count-based per `selectionType` (only EDIT→count and PRINT→sum are stated; ALBUM, FRAME, custom types unspecified). F-05 limits MVP selection types to `EDIT` and `PRINT` (BR-CAT-007), so the gap only matters when a new type is added.

### BR-SEL-004 — Only proof photos are selectable
A selection references a `PROOF` photo from the gallery of the group's own project. One row per `(group, photo)`; quantity > 0. A photo may be selected in several groups.

### BR-SEL-005 — Group lifecycle
`OPEN → SUBMITTED → LOCKED`; `OPEN → LOCKED` (Owner closes without submission). Clients may change selections only while `OPEN`. Submission happens once and cannot be reopened by anyone in MVP. Status lives only on the group.

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
Requires at least one synced `EDITED` or `PRINT` file; records `finalDeliveryPublishedAt` and moves the project to `DELIVERED` (never to `COMPLETED`).

### BR-DEL-004 — Independent finished files
Each finished file is an independent download with no link to its original proof photo; no inference from names/paths.

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
