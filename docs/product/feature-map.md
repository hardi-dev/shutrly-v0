# Feature Map

Features are detailed (under `docs/features/<slug>/`) only when they are being worked on. Order follows dependency; see ADRs and business rules for constraints.

Status legend: `TODO` · `DISCOVERY` · `SPECIFIED` · `DESIGNED` · `PLANNED` · `IN PROGRESS` · `DONE`

| ID | Epic / Feature | Slug | Key rules | Journeys | Status |
|---|---|---|---|---|---|
| F-00 | Foundation: repo scaffold, Drizzle base schema conventions, error model, workspace-scoping helpers, local quality gate (CI + deploy deferred, Owner 2026-09-26) | `foundation` | BR-WS-002, BR-WS-003 | — | DONE (verified 2026-09-27) |
| F-01 | Auth & account (register, verify, login, reset, profile) | `auth` | BR-AUTH-* | J-01 | DONE (verified 2026-09-27; ship needs F-02) |
| F-02 | Workspace onboarding & switching, branding, App Shell / Sidebar code (Owner 2026-09-26) | `workspace` | BR-WS-*, BR-AUTH-004 | J-01 | DONE (2026-09-28; Settings v3 with Section Card, 2026-10-01) |
| F-03 | Message templates | `message-templates` | BR-MSG-001..006 | — | DONE (2026-10-01) |
| F-04 | Source configuration: Owner-managed photo sources (Google Drive in MVP, other providers coming soon), seeded *Google Drive*, setup guide and public-link warning; nav *Sumber foto* (Owner 2026-10-01) | `source-config` | BR-SRC-001..006 | — | DONE (merged to `main` 2026-10-02, PR #1; verify pending) |
| F-05 | Service catalog (categories, item definitions, services, items, booking fields); *Layanan* with tabs, four seeded item definitions (Owner 2026-10-02) | `catalog` | BR-CAT-001..011 | J-02 | DONE (merged to `main` 2026-10-02, PR #3; verify pending) |
| F-06 | Clients: name, WhatsApp number (normalized, unique per workspace), social-media links; search, archive, delete while unused (Owner 2026-10-02) | `clients` | BR-CLI-001..003, BR-WS-002 | J-03 | DONE (2026-10-03) |
| F-07 | Project creation from service + snapshots | `projects` | BR-PRJ-*, BR-CAT-003 | J-03 | DONE (2026-10-04; Owner accepted, fidelity pass and keyboard-only a11y tests remain as follow-ups) |
| F-08 | Team: members (WhatsApp, email, roles), workspace roles, who works which session (*Atur tim*); no fees, no stored session status (sessions themselves moved to F-07, Owner 2026-10-02; scope Owner 2026-10-03) | `team-sessions` | BR-TEAM-001..006 | J-03 | IN PROGRESS (2026-10-04) |
| F-09 | Gallery, sources, Drive sync (Owner side: create with password, link Drive folders, sync, photos by kind with Owner-only media, publish, expiry, rotate, archive; [intent](../features/gallery/intent.md), [spec](../features/gallery/spec.md)) | `gallery` | BR-GAL-001..009, BR-SRC-* | J-04 | IN PROGRESS (free-tier rework R1–R5 built, CPU check done (go on with Workers Free), verified 2026-10-05 ([report](../features/gallery/verification-report.md)), pending Owner acceptance on `feat/gallery-free-tier`, 2026-10-05; Slices 0–8 built and verified on `main`; [design](../features/gallery/design.md), [technical design](../features/gallery/technical-design.md), [plan](../features/gallery/plan.md): Slices 0–8 and R1–R5) |
| F-10 | Client access: gallery (token, password, rate limits, media delivery), selection, final delivery and add-ons, merged from F-10..F-13 (Owner 2026-10-05; [intent](../features/client-access/intent.md)) | `client-access` | BR-ACC-*, BR-SEL-*, BR-DEL-*, BR-ADD-*, BR-PRJ-004..006 | J-04..J-06 | DONE, pending verification (built 2026-10-07, Slices 0–11; planned 2026-10-06; [spec](../features/client-access/spec.md), AC-ACC/SEL/ADD/DEL, [design](../features/client-access/design.md), [technical design](../features/client-access/technical-design.md), [plan](../features/client-access/plan.md)) |
| F-11 | Selection groups and client selection | `selection` | BR-SEL-* | J-04 | MERGED into F-10 (2026-10-05) |
| F-12 | Final delivery and project completion | `final-delivery` | BR-DEL-*, BR-PRJ-004..006 | J-06 | MERGED into F-10 (2026-10-05) |
| F-13 | Add-ons | `add-ons` | BR-ADD-* | J-05 | MERGED into F-10 (2026-10-05) |
| F-14 | Invoices and payments | `billing` | BR-INV-*, BR-PAY-*, BR-CUR-* | J-07 | TODO |
| F-15 | WhatsApp sharing | `whatsapp-share` | BR-MSG-* | J-04..J-07 | TODO |
| F-16 | Operational hardening (isolation, abuse, concurrency, provider-failure tests; backups; caching review) | `hardening` | constitution C-004..C-006 | — | TODO |
| F-17 | App Shell revamp (desktop/mobile navigation, workspace switcher, page header, content shell, responsive transitions) | `app-shell-revamp` | BR-WS-002..003, BR-WS-006..007, C-007..008 | J-01 | DONE (2026-10-01) |
| F-18 | Team fees: freelancer rates, a fee per assignment, paid / unpaid tracking, what the Owner still owes (split out of F-08, Owner 2026-10-03; BR-TEAM-007 deprecated until then) | `team-fees` | — | — | TODO (not scheduled) |

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
**F-08 Team** — DONE 2026-10-04 (Owner decision; open items in [verification-report.md](../features/team-sessions/verification-report.md)) on `feat/team-sessions` (branched from `feat/projects`, since assignments need sessions) ([spec.md](../features/team-sessions/spec.md)). Owner decisions:
- each assignment puts one member on one session, in one role;
- sessions and assignments have no stored status;
- no money at all: rates, fees and payment tracking moved to F-18 *Team fees* (BR-TEAM-007 deprecated);
- a member has a name, a required WhatsApp number (unique per workspace), an optional email and one or more roles from the workspace role list (*Fotografer*, *Videografer* and *Asisten* are seeded);
- members are archived, and deleted only while unused;
- on the project page each session shows an avatar group (or a `user-plus` button) that opens *Atur tim*.

Rules BR-TEAM-004..006; the SPEC GAP in BR-TEAM-002 is resolved. Design approved: 48 frames with HTML exports ([design.md](../features/team-sessions/design.md)). Plan: [technical-design.md](../features/team-sessions/technical-design.md) (D-1…D-17) and [plan.md](../features/team-sessions/plan.md) (Slices 1–6, migrations 0010/0011). Next: `/sdv:build-feature team-sessions 1`.

**F-07 Projects** — SPECIFIED 2026-10-02 on `feat/projects` (branched from `feat/clients`, because a project needs a client) ([spec.md](../features/projects/spec.md), AC-PRJ-001…026). Owner decisions:
- status steps are manual, and sessions never move the status;
- a project is created directly as `BOOKED` or saved as a `DRAFT`, and required booking fields apply to both;
- while `DRAFT`/`BOOKED`, the deal (price, item values, add/remove items, booking values) stays editable;
- only drafts are deleted, and other projects are cancelled;
- final delivery may move `BOOKED`, `SHOOTING` or `POST_PROCESSING` to `DELIVERED`;
- the fields are title (default *{service} — {client}*) and internal notes, with inline client creation;
- sessions (name, date, times, location) are part of F-07 and replace the event date; `BOOKED` needs at least one (BR-TEAM-003, design review 2026-10-02).

New rules BR-PRJ-008..010; BR-PRJ-004's gap is resolved and BR-DEL-003 updated. Next: `/sdv:design-feature projects`.

**F-06 Clients** — PLANNED 2026-10-02 ([spec.md](../features/clients/spec.md), AC-CLI-001…021). Design approved (40 frames + exports, [design.md](../features/clients/design.md)); [technical-design.md](../features/clients/technical-design.md) and [plan.md](../features/clients/plan.md) list 14 test-first tasks (booking context, migration 0008). Pushed on `feat/clients`. Next: `/sdv:build-feature clients 1`.

**Verification still owed** — each of these is built and merged to `main`, but has no verification report yet:
- F-04 Source configuration (PR #1, [spec.md](../features/source-config/spec.md), AC-SRC-001…017): `/sdv:verify-feature source-config`.
- F-05 Service catalog (PR #3, [spec.md](../features/catalog/spec.md), AC-CAT-001…023; [implementation record](../features/catalog/technical-design.md#implementation-record--2026-10-02)): Neon integration was blocked by pooler connectivity. `/sdv:verify-feature catalog`.
- F-17 App Shell revamp (DONE 2026-10-01, [design.md](../features/app-shell-revamp/design.md)): `/sdv:verify-feature app-shell-revamp`.

**Before the first `/sdv:ship`:** schedule CI (GitHub Actions) and the Cloudflare deploy.

**F-06 Clients** — DONE 2026-10-03 ([spec.md](../features/clients/spec.md), AC-CLI-001…021). The client domain, migration 0008, repository/actions/routes, responsive list and dialog UI, lifecycle actions, search/paging, browser journeys and accessibility coverage are implemented on `codex/clients` and merged to `main`. The Owner accepted it as done after a browser review and the full unit/E2E/axe gate; integration tests were skipped by the Owner and AC-CLI-015's real-FK check stays with F-07. See the [implementation record](../features/clients/technical-design.md#implementation-record--2026-10-03).
