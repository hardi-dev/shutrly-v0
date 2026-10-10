# Feature Map

Features are detailed (under `docs/features/<slug>/`) only when they are being worked on. Order follows dependency; see ADRs and business rules for constraints.

Status legend: `TODO` · `DISCOVERY` · `SPECIFIED` · `DESIGNED` · `PLANNED` · `IN PROGRESS` · `DONE`

| ID | Epic / Feature | Slug | Key rules | Journeys | Status |
|---|---|---|---|---|---|
| F-00 | Foundation: repo scaffold, Drizzle base schema conventions, error model, workspace-scoping helpers, local quality gate (CI + deploy deferred, Owner 2026-09-26) | `foundation` | BR-WS-002, BR-WS-003 | — | DONE (verified 2026-09-27) |
| F-01 | Auth & account (register, verify, login, reset, profile) | `auth` | BR-AUTH-* | J-01 | DONE (verified 2026-09-27; ship needs F-02) |
| F-02 | Workspace onboarding & switching, branding, App Shell / Sidebar code (Owner 2026-09-26) | `workspace` | BR-WS-*, BR-AUTH-004 | J-01 | DONE (2026-09-28; Settings v3 with Section Card, 2026-10-01) |
| F-03 | Message templates | `message-templates` | BR-MSG-001..006 | — | DONE (2026-10-01) |
| F-04 | Source configuration: Owner-managed photo sources (Google Drive in MVP, other providers coming soon), seeded *Google Drive*, setup guide and public-link warning; nav *Sumber foto* (Owner 2026-10-01) | `source-config` | BR-SRC-001..006 | — | DONE (merged to `main` 2026-10-02, PR #1; verified, Owner 2026-10-09) |
| F-05 | Service catalog (categories, item definitions, services, items, booking fields); *Layanan* with tabs, four seeded item definitions (Owner 2026-10-02) | `catalog` | BR-CAT-001..011 | J-02 | DONE (merged to `main` 2026-10-02, PR #3; verified, Owner 2026-10-09) |
| F-06 | Clients: name, WhatsApp number (normalized, unique per workspace), social-media links; search, archive, delete while unused (Owner 2026-10-02) | `clients` | BR-CLI-001..003, BR-WS-002 | J-03 | DONE (2026-10-03) |
| F-07 | Project creation from service + snapshots | `projects` | BR-PRJ-*, BR-CAT-003 | J-03 | DONE (2026-10-04; Owner accepted, fidelity pass and keyboard-only a11y tests remain as follow-ups) |
| F-08 | Team: members (WhatsApp, email, roles), workspace roles, who works which session (*Atur tim*); no fees, no stored session status (sessions themselves moved to F-07, Owner 2026-10-02; scope Owner 2026-10-03) | `team-sessions` | BR-TEAM-001..006 | J-03 | DONE (2026-10-04; open items in [verification-report](../features/team-sessions/verification-report.md)) |
| F-09 | Gallery, sources, Drive sync (Owner side: create with password, link Drive folders, sync, photos by kind with Owner-only media, publish, expiry, rotate, archive; [intent](../features/gallery/intent.md), [spec](../features/gallery/spec.md)) | `gallery` | BR-GAL-001..009, BR-SRC-* | J-04 | DONE (Owner accepted 2026-10-09; free-tier rework R1–R5 merged, PR #8; [report](../features/gallery/verification-report.md); [design](../features/gallery/design.md), [technical design](../features/gallery/technical-design.md), [plan](../features/gallery/plan.md): Slices 0–8 and R1–R5) |
| F-10 | Client access: gallery (token, password, rate limits, media delivery), selection, final delivery and add-ons, merged from F-10..F-13 (Owner 2026-10-05; [intent](../features/client-access/intent.md)) | `client-access` | BR-ACC-*, BR-SEL-*, BR-DEL-*, BR-ADD-*, BR-PRJ-004..006 | J-04..J-06 | DONE (Owner reviewed, verified and shipped, 2026-10-09; merged to `staging` PR #12, deploy fix PR #13; Slices 0–16 incl. Owner 7 revision and Revision OT ([findings](../features/client-access/manual-test-findings.md)); [spec](../features/client-access/spec.md), AC-ACC/SEL/ADD/DEL, [design](../features/client-access/design.md), [technical design](../features/client-access/technical-design.md), [plan](../features/client-access/plan.md)) |
| F-11 | Selection groups and client selection | `selection` | BR-SEL-* | J-04 | MERGED into F-10 (2026-10-05) |
| F-12 | Final delivery and project completion | `final-delivery` | BR-DEL-*, BR-PRJ-004..006 | J-06 | MERGED into F-10 (2026-10-05) |
| F-13 | Add-ons | `add-ons` | BR-ADD-* | J-05 | MERGED into F-10 (2026-10-05) |
| F-14 | Invoices and payments | `billing` | BR-INV-*, BR-PAY-*, BR-CUR-* | J-07 | TODO |
| F-15 | WhatsApp sharing | `whatsapp-share` | BR-MSG-* | J-04..J-07 | TODO |
| F-16 | Operational hardening (isolation, abuse, concurrency, provider-failure tests; backups; caching review) | `hardening` | constitution C-004..C-006 | — | TODO |
| F-17 | App Shell revamp (desktop/mobile navigation, workspace switcher, page header, content shell, responsive transitions) | `app-shell-revamp` | BR-WS-002..003, BR-WS-006..007, C-007..008 | J-01 | DONE (2026-10-01; verified, Owner 2026-10-09) |
| F-18 | Team fees: freelancer rates, a fee per assignment, paid / unpaid tracking, what the Owner still owes (split out of F-08, Owner 2026-10-03; BR-TEAM-007 deprecated until then) | `team-fees` | — | — | TODO (not scheduled) |
| F-19 | Landing page: public page at `/` explaining Shutrly to prospective Owners, with an email waitlist; the only route served on production during development; no pricing (Owner 2026-10-07; [intent](../features/landing/intent.md), [spec](../features/landing/spec.md); production host [ADR-021](../architecture/decisions/ADR-021-production-on-netlify-landing-only.md)) | `landing` | C-006..008, C-106 | — | DONE (2026-10-08; live at https://shutrly.space; [verification](../features/landing/verification-report.md) blocking items closed; non-blocking: Private Email DKIM, scoped token exception) |
| F-20 | Client proof downloads and bulk picks on *Semua foto* (Owner 2026-10-07, finding #6) | `client-proof-downloads` | BR-DEL-*, BR-SEL-*, BR-ACC-005 | J-04 | DONE (built 2026-10-07, verified and shipped with F-10, Owner 2026-10-09; [intent](../features/client-proof-downloads/intent.md), [build notes](../features/client-proof-downloads/build-notes.md)) |
| F-21 | Delivery folder mapping: map each linked Drive folder's subfolders to the project's selection items; replaces the `edited`/`print` names (Owner 2026-10-07, finding #5) | `delivery-folder-mapping` | BR-GAL-007, BR-DEL-* | J-06 | DONE (built 2026-10-07, verified and shipped with F-10, Owner 2026-10-09; [intent](../features/delivery-folder-mapping/intent.md), [build notes](../features/delivery-folder-mapping/build-notes.md)) |
| F-22 | Bilingual copy revamp: English default, EN/ID switching, complete copy and authored content coverage | `bilingual-copy-revamp` | BR-L10N-001..006 | J-01..J-07 | SPECIFIED (scope and library accepted 2026-10-06; behavior gaps, design and implementation pending) |

## Core product emphasis — photo selection to editing (Owner 2026-10-06)

The primary benefit is helping the photographer know which photos the client wants edited. F-09 supplies the gallery/photo records, F-10 provides client access, F-11 records choices within each package allowance for Owner review, and F-12 delivers the finished photos. This follows J-04 → J-06. Catalog, projects, sessions, team and billing support that workflow; administrative organization is a supporting benefit.

This records product emphasis, not a new capability or status change. F-11 specifies client selection and Owner review; it does not establish a separate photographer-culling tool, automatic best-photo selection, photo editing or an export to editing software. Selection remains TODO here.

## Project menu (F-07 row and detail menu)
F-07 defines one menu per project (row ⋯ on the list and the detail page menu) with a **Kirim ke klien** group (Owner 2026-10-02). Its items are named after the message template they load. Later features add their items to that menu, shown only when their condition holds; each template message shows a preview (`communications/ui/message-preview`) before opening WhatsApp (BR-MSG-001). *Chat WhatsApp* (no template) shows only when no template item applies; in F-07 that is always. Target menus: `docs/features/projects/projects.pen` › *Row menu per status / Target*.

| Feature | Item | Shown when | Template |
|---|---|---|---|
| F-10 | *Kirim link galeri* (password re-entry, BR-MSG-003) | the project has a gallery; `SHOOTING` to `COMPLETED` | `GALLERY_SHARE` |
| F-10 (was F-11) | *Ingatkan pilih foto* | a selection is open | `SELECTION_REMINDER` |
| F-10 (was F-12) | *Tandai selesai* (step) · *Kirim hasil akhir* | `DELIVERED` | `FINAL_DELIVERY` |
| F-14 | *Kirim invoice* · *Ingatkan pembayaran* | an invoice exists · it has a balance | `INVOICE_SHARE` · `PAYMENT_REMINDER` |
| Planned (Owner 2026-10-02, feature not yet scheduled) | *Kirim konfirmasi booking* | `DRAFT`, `BOOKED` | new type `BOOKING_CONFIRMATION`: changes BR-MSG-002 (five → six types), the F-03 catalogue and the default seed; needs its own discovery |

## Next up
**F-14 Invoices and payments** (`billing`, BR-INV-*, BR-PAY-*, BR-CUR-*, J-07) — next in dependency order; it needs only projects and clients (both DONE) and adds *Kirim invoice* · *Ingatkan pembayaran* to the project menu. Next: `/sdv:capture-intent billing`.

After it: F-15 WhatsApp sharing, then F-16 Operational hardening. F-18 Team fees is not scheduled.

Status as of 2026-10-09 (Owner): F-10 client-access with F-20 and F-21 is reviewed, verified and shipped; F-04, F-05 and F-17 are verified; F-09 is accepted. Earlier *Next up* notes are in git history.

## Product-copy availability gate

This map tracks the feature lifecycle; inclusion in MVP scope does not mean a feature is shipped. Use the [product overview](overview.md) for problem/mechanism wording, and verify the feature’s release/acceptance evidence before public present-tense claims. F-10–F-15 remain future client-selection/delivery/add-on/billing/sharing surfaces on this branch. F-03 edits templates; it does not send real project messages. F-08 records assignments, not staff logins, availability or payouts. The existing dashboard is a placeholder, not a verified project/invoice summary. Feature statuses above are preserved by this editorial review.
