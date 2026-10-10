# Product Scope

Status: ACCEPTED (migrated from `_source/` on 2026-09-25)

## MVP

This is the intended completion scope, not a release announcement. TODO features in [feature-map.md](feature-map.md) remain future scope. For partially built features, describe only the implemented, verified behavior and its limits; a partial implementation does not establish complete feature availability. Check the owning spec, acceptance and release evidence before public claims.

- Owner account: register, verify email (link), login/logout, Google sign-in (identity only, auto-linked by email), forgot/reset/change password, update profile (display name only). Transactional auth emails sent by the platform to the Owner.
- Multiple Workspaces (brands) per Owner; branding (name, brand name, contact email/phone/address — no logo), invoice prefix, default currency (IDR). Create, edit and switch only.
- Workspace message templates (WhatsApp channel) and source configuration (Google Drive).
- Service catalog: categories, reusable item definitions (four seeded per workspace), services with item values (`NUMBER`/`RANGE`), service-specific booking fields; archive/unarchive, delete only when unreferenced (F-05, Owner 2026-10-02).
- Clients.
- Projects created from a service with copied package items and booking-field metadata that stay independent of later catalog changes. The Owner may customize item/booking values and the agreed price before shooting; the deal is read-only from `SHOOTING` onward (BR-PRJ-001/009). Sessions, team members (freelancers without login) and per-session assignments with a role are included (F-08, Owner 2026-10-03).
- One access-controlled Shutrly gallery per project, backed by one or more publicly link-shared Google Drive folders. The Owner links folders and initiates metadata sync; there is no scheduled automatic sync. Page access controls do not protect direct public Drive/image links (BR-ACC-005).
- Client access via Project token + required Gallery password; password rotation; token rotation.
- Selection groups derived from project items; quantity-aware selection; one-time submit; Owner lock.
- Final delivery through the same Gallery from Owner-created `edited` / `print` Drive subfolders.
- Project add-ons that extend selection entitlement and/or billing.
- Invoices (one draft per project, many issued), one nominal discount, manual payments with void, derived status.
- WhatsApp deep-link generation from templates; Owner sends manually.

## Explicitly Out of Scope
- Staff/multi-user workspaces (`WorkspaceMember`), freelancer logins.
- Freelancer money: rates, fees per assignment, payment status and payout reports (feature map › *Team fees*, not scheduled); availability calendars and double-booking checks (F-08, Owner 2026-10-03).
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
- Package item value types other than `NUMBER` and `RANGE`; a draft/publish step for services (Owner 2026-10-02).
- Automatic Project completion from payment or delivery.

## Constraints
- Stack fixed by the Owner: Next.js, Better Auth, Drizzle ORM and Neon PostgreSQL; Cloudflare runtime support is retained, staging is on Netlify under ADR-020, and the production host remains undecided (see [tech-stack](../architecture/tech-stack.md)).
- Drive folders are link-shared publicly; anyone holding a direct Drive link bypasses app-level protection. Retained public image URLs may remain usable after gallery expiry or password rotation (BR-ACC-005). Owners must be warned; never describe the underlying files as fully private or access-revocable.
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
1. An Owner can register, verify email, create a first workspace, and reach its dashboard. Returning Owners open their last-used workspace and switch from the shell; there is no standalone workspace-selection step (BR-WS-006).
2. All domain reads and writes are workspace-isolated.
3. A service produces independent project item/booking-field snapshots; later catalog edits do not rewrite them. Explicit Owner edits follow the pre-shooting rules, and the deal locks from `SHOOTING` onward.
4. A project can have sessions, team assignments, one gallery, and multiple external sources.
5. Google Drive metadata sync is idempotent and never exposes provider credentials.
6. A client can open a gallery with the Project token + password, see issued invoices through the same token, select photos by selection group, set print quantities, and submit once.
7. The Owner can publish finished files from `edited`/`print` folders through the same gallery link; finished files download independently.
8. The Owner can manually mark a delivered project complete (actor + timestamp recorded) regardless of invoice status.
9. Approved add-ons update their target selection group and draft invoice consistently; cancellation cannot invalidate saved selections.
10. Invoice totals and payment status are transactionally correct; amounts are IDR with persisted currency codes.
11. WhatsApp links are generated from resolved templates and sent manually.
12. State transitions, public access, and sensitive Owner actions are tested and auditable.

## Bilingual experience (Owner 2026-10-06)

All dashboard and client-gallery journeys follow [localization policy](localization.md): English default, explicit EN/ID switching, complete single-language presentation, bilingual descriptive content and templates, preserved identity/business values. Existing workflows and manual sending remain unchanged. Preference persistence, recipient-language choice and legacy-data rollout must be resolved before implementation. Localization applies to implemented features now and future journey surfaces when they are built.
