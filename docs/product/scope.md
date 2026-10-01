# Product Scope

Status: ACCEPTED (migrated from `_source/` on 2026-09-25)

## MVP
- Owner account: register, verify email (link), login/logout, Google sign-in (identity only, auto-linked by email), forgot/reset/change password, update profile (display name only). Transactional auth emails sent by the platform to the Owner.
- Multiple Workspaces (brands) per Owner; branding (name, brand name, contact email/phone/address — no logo), invoice prefix, default currency (IDR). Create, edit and switch only.
- Workspace message templates (WhatsApp channel) and source configuration (Google Drive).
- Service catalog: categories, reusable item definitions (four seeded per workspace), services with item values (`NUMBER`/`RANGE`), service-specific booking fields; archive/unarchive, delete only when unreferenced (F-05, Owner 2026-10-02).
- Clients.
- Projects created from a service, with immutable item and booking-field snapshots, customizable deal, sessions, team members (freelancers without login) and assignments.
- One private Gallery per Project backed by one or more public Google Drive folder links; idempotent metadata sync.
- Client access via Project token + required Gallery password; password rotation; token rotation.
- Selection groups derived from project items; quantity-aware selection; one-time submit; Owner lock.
- Final delivery through the same Gallery from Owner-created `edited` / `print` Drive subfolders.
- Project add-ons that extend selection entitlement and/or billing.
- Invoices (one draft per project, many issued), one nominal discount, manual payments with void, derived status.
- WhatsApp deep-link generation from templates; Owner sends manually.

## Explicitly Out of Scope
- Staff/multi-user workspaces (`WorkspaceMember`), freelancer logins.
- Workspace logo upload, workspace archive or deletion (Owner 2026-09-27, F-02 discovery).
- Client accounts.
- Social sign-in providers other than Google, adding a password to a Google-only account, unlinking Google, 2FA, email change, avatar, self-service account deletion, admin UI for user status.
- Direct WhatsApp API sending, message history, delivery status.
- Owner Google OAuth **for Drive access** (Google sign-in is identity-only), service accounts, private Drive access, creating folders or uploading to Drive.
- Providers other than Google Drive.
- Reopening submitted/locked selections.
- Mapping finished files back to their proof photos.
- Payment gateway, payment proof upload, refunds, overpayment.
- Coupons, percentage or per-line discounts.
- Currencies other than IDR, exchange rates, mixed-currency invoices, automatic tax.
- Package item value types other than `NUMBER` and `RANGE`; selection types other than `EDIT` and `PRINT`; a draft/publish step for services (Owner 2026-10-02).
- Automatic Project completion from payment or delivery.

## Constraints
- Stack fixed by the Owner: Next.js, Better Auth, Drizzle ORM, Neon PostgreSQL, Cloudflare (see [tech-stack](../architecture/tech-stack.md)).
- Drive folders are link-shared publicly; anyone holding a direct Drive link bypasses app-level protection. Owners must be warned.
- Primary market: Indonesia (IDR, WhatsApp-first communication).

## Later
- Staff access (Better Auth Organizations vs domain membership — decide after roles are specified).
- Freelancer as system actor.
- WhatsApp Business API with message log.
- Additional source providers (Dropbox, OneDrive, S3, custom URL); private Drive integration.
- Linked photo variants (final ↔ proof).
- Payment gateway, refunds, proof uploads.
- Multi-currency and tax.

## MVP Completion Criteria
The MVP is ready when:
1. An Owner can register, verify email, create/select a workspace, and reach a dashboard.
2. All domain reads and writes are workspace-isolated.
3. A service can produce a project with immutable item and booking-field snapshots.
4. A project can have sessions, team assignments, one gallery, and multiple external sources.
5. Google Drive metadata sync is idempotent and never exposes provider credentials.
6. A client can open a gallery with the Project token + password, see issued invoices through the same token, select photos by selection group, set print quantities, and submit once.
7. The Owner can publish finished files from `edited`/`print` folders through the same gallery link; finished files download independently.
8. The Owner can manually mark a delivered project complete (actor + timestamp recorded) regardless of invoice status.
9. Approved add-ons update their target selection group and draft invoice consistently; cancellation cannot invalidate saved selections.
10. Invoice totals and payment status are transactionally correct; amounts are IDR with persisted currency codes.
11. WhatsApp links are generated from resolved templates and sent manually.
12. State transitions, public access, and sensitive Owner actions are tested and auditable.
