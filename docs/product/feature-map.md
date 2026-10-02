# Feature Map

Features are detailed (under `docs/features/<slug>/`) only when they are being worked on. Order follows dependency; see ADRs and business rules for constraints.

Status legend: `TODO` · `DISCOVERY` · `SPECIFIED` · `DESIGNED` · `PLANNED` · `IN PROGRESS` · `DONE`

| ID | Epic / Feature | Slug | Key rules | Journeys | Status |
|---|---|---|---|---|---|
| F-00 | Foundation: repo scaffold, Drizzle base schema conventions, error model, workspace-scoping helpers, local quality gate (CI + deploy deferred, Owner 2026-09-26) | `foundation` | BR-WS-002, BR-WS-003 | — | DONE (verified 2026-09-27) |
| F-01 | Auth & account (register, verify, login, reset, profile) | `auth` | BR-AUTH-* | J-01 | DONE (verified 2026-09-27; ship needs F-02) |
| F-02 | Workspace onboarding & switching, branding, App Shell / Sidebar code (Owner 2026-09-26) | `workspace` | BR-WS-*, BR-AUTH-004 | J-01 | DONE (2026-09-28; Settings v3 with Section Card, 2026-10-01) |
| F-03 | Message templates | `message-templates` | BR-MSG-001..006 | — | DONE (2026-10-01) |
| F-04 | Source configuration: Owner-managed photo sources (Google Drive in MVP, other providers coming soon), seeded *Google Drive*, setup guide and public-link warning; nav *Sumber foto* (Owner 2026-10-01) | `source-config` | BR-SRC-001..006 | — | IN PROGRESS (2026-10-02) |
| F-05 | Service catalog (categories, item definitions, services, items, booking fields); *Layanan* with tabs, four seeded item definitions (Owner 2026-10-02) | `catalog` | BR-CAT-001..011 | J-02 | SPECIFIED (2026-10-02; designed and in build on `feat/catalog`) |
| F-06 | Clients: name, WhatsApp number (normalized, unique per workspace), social-media links; search, archive, delete while unused (Owner 2026-10-02) | `clients` | BR-CLI-001..003, BR-WS-002 | J-03 | SPECIFIED (2026-10-02) |
| F-07 | Project creation from service + snapshots | `projects` | BR-PRJ-*, BR-CAT-003 | J-03 | TODO |
| F-08 | Sessions, team members, assignments | `team-sessions` | BR-TEAM-* | J-03 | TODO |
| F-09 | Gallery, sources, Drive sync | `gallery` | BR-GAL-*, BR-SRC-* | J-04 | TODO |
| F-10 | Client gallery access (token, password, rate limits, media delivery) | `client-access` | BR-ACC-* | J-04 | TODO |
| F-11 | Selection groups and client selection | `selection` | BR-SEL-* | J-04 | TODO |
| F-12 | Final delivery and project completion | `final-delivery` | BR-DEL-*, BR-PRJ-004..006 | J-06 | TODO |
| F-13 | Add-ons | `add-ons` | BR-ADD-* | J-05 | TODO |
| F-14 | Invoices and payments | `billing` | BR-INV-*, BR-PAY-*, BR-CUR-* | J-07 | TODO |
| F-15 | WhatsApp sharing | `whatsapp-share` | BR-MSG-* | J-04..J-07 | TODO |
| F-16 | Operational hardening (isolation, abuse, concurrency, provider-failure tests; backups; caching review) | `hardening` | constitution C-004..C-006 | — | TODO |
| F-17 | App Shell revamp (desktop/mobile navigation, workspace switcher, page header, content shell, responsive transitions) | `app-shell-revamp` | BR-WS-002..003, BR-WS-006..007, C-007..008 | J-01 | DONE (2026-10-01) |

## Next up
**F-17 App Shell revamp** — DONE 2026-10-01 (implemented 2026-09-29; sticky Sidebar fix 2026-10-01) ([technical-design.md](../features/app-shell-revamp/technical-design.md), 9 iterations; design approved 2026-09-29, [design.md](../features/app-shell-revamp/design.md)).

Owner decisions:
- tablet keeps the rail in v3 styling;
- the phone switcher is the header pill only;
- the sub-page compact bar is in scope, with an optional Actions slot;
- Search and Notifications are visible and open *Segera hadir*, with a danger unread badge;
- a failed switch shows a danger Toast with *Coba lagi*;
- phone option A: Invoice goes into the Bottom Nav, and a header Menu button opens the menu sheet.

Badge conflict decided: follow the code (Count Badge Danger variant). Rules v3.1 APPROVED, and the library promotion PERSISTED 2026-09-29 (531 tokens, `594f560b`); `app-shell-revamp.pen` is rebound. HTML exports are done (31 frames). `/sdv:verify-design-system` was skipped at the Owner's request. Built and browser-validated at 1440/1024/390 (commits `8df6492`, `a787464`, `70ce31d`). Next: `/sdv:verify-feature app-shell-revamp`.

F-03 is built and verified (DONE 2026-10-01; see `features/message-templates/verification-report.md`). CI (GitHub Actions) and Cloudflare deploy must still be scheduled before the first `/sdv:ship`.

**F-04 Source configuration** — IN PROGRESS 2026-10-02 ([spec.md](../features/source-config/spec.md), AC-SRC-001…017). Owner decisions: Owners manage a list of sources (add, rename, deactivate, delete; BR-SRC-005/006); only Google Drive can be added, and Dropbox, OneDrive, S3 and Custom URL show as *Segera hadir*; every workspace is seeded with *Google Drive*; the link checker is dropped; the nav slot *Sumber klien* becomes *Sumber foto* with the `folder-open` icon. Designed and approved 2026-10-02 ([design.md](../features/source-config/design.md), 24 frames + exports); promoted Status Chip (C12), List Card Item Two-line/Skeleton (C42) and Option Card (C44) to the library (585 tokens, `284a052f`). All 14 test-first tasks are implemented on `feat/source-config`, with migrations 0004/0005 applied by the Owner. Next: `/sdv:verify-feature source-config`.

**F-05 Service catalog** — SPECIFIED 2026-10-02 ([spec.md](../features/catalog/spec.md), AC-CAT-001…023). Owner decisions: *Layanan* has three tabs (Layanan · Kategori · Item paket) and a service detail sub-page; categories, definitions and services are active/archived, deleted only when unreferenced, no draft/publish (BR-CAT-008); selection types `EDIT` and `PRINT` only (BR-CAT-007); four item definitions seeded and backfilled per workspace (BR-CAT-011). New rules BR-CAT-007…011. Its library promotion (C45 Tabs, Page Header/Tabs, Segmented Control/Full width) were merged into `feat/clients` from `feat/catalog` (`2dc3da6`); the build continues on `feat/catalog`.

**F-06 Clients** — SPECIFIED 2026-10-02 ([spec.md](../features/clients/spec.md), AC-CLI-001…020). Picked ahead of F-05 by the Owner. Owner decisions: fields are name, WhatsApp number and social-media links (add/remove rows, Instagram prefilled; no phone or email); the WhatsApp number is optional, normalized to `62…` and unique per workspace (blocked, database-enforced); clients are archived, and deleted only while no project refers to them (BR-CLI-001..003). Next: `/sdv:design-feature clients`.
