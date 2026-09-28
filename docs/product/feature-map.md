# Feature Map

Features are detailed (under `docs/features/<slug>/`) only when they are being worked on. Order follows dependency; see ADRs and business rules for constraints.

Status legend: `TODO` · `DISCOVERY` · `SPECIFIED` · `DESIGNED` · `PLANNED` · `IN PROGRESS` · `DONE`

| ID | Epic / Feature | Slug | Key rules | Journeys | Status |
|---|---|---|---|---|---|
| F-00 | Foundation: repo scaffold, Drizzle base schema conventions, error model, workspace-scoping helpers, local quality gate (CI + deploy deferred, Owner 2026-09-26) | `foundation` | BR-WS-002, BR-WS-003 | — | DONE (verified 2026-09-27) |
| F-01 | Auth & account (register, verify, login, reset, profile) | `auth` | BR-AUTH-* | J-01 | DONE (verified 2026-09-27; ship needs F-02) |
| F-02 | Workspace onboarding & switching, branding, App Shell / Sidebar code (Owner 2026-09-26) | `workspace` | BR-WS-*, BR-AUTH-004 | J-01 | DONE (implementation, workspace E2E and docs write-back complete, 2026-09-28) |
| F-03 | Message templates | `message-templates` | BR-MSG-001..006 | — | SPECIFIED (2026-09-28) |
| F-04 | Source configuration (Google Drive) | `source-config` | BR-SRC-001 | — | TODO |
| F-05 | Service catalog (categories, item definitions, services, items, booking fields) | `catalog` | BR-CAT-* | J-02 | TODO |
| F-06 | Clients | `clients` | BR-WS-002 | J-03 | TODO |
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
| F-17 | App Shell revamp (desktop/mobile navigation, workspace switcher, page header, content shell, responsive transitions) | `app-shell-revamp` | BR-WS-002..003, BR-WS-006..007, C-007..008 | J-01 | IMPLEMENTED (2026-09-29) |

## Next up
**F-17 App Shell revamp** — IMPLEMENTED 2026-09-29; final verification next ([technical-design.md](../features/app-shell-revamp/technical-design.md), 9 iterations; design approved 2026-09-29, [design.md](../features/app-shell-revamp/design.md)).

Owner decisions:
- tablet keeps the rail in v3 styling;
- the phone switcher is the header pill only;
- the sub-page compact bar is in scope, with an optional Actions slot;
- Search and Notifications are visible and open *Segera hadir*, with a danger unread badge;
- a failed switch shows a danger Toast with *Coba lagi*;
- phone option A: Invoice goes into the Bottom Nav, and a header Menu button opens the menu sheet.

Badge conflict decided: follow the code (Count Badge Danger variant). Rules v3.1 APPROVED, and the library promotion PERSISTED 2026-09-29 (531 tokens, `594f560b`); `app-shell-revamp.pen` is rebound. HTML exports are done (31 frames). `/sdv:verify-design-system` was skipped at the Owner's request. Next: `/sdv:build-feature app-shell-revamp 1`.

F-03 design stays paused until the F-17 shell is approved. CI (GitHub Actions) and Cloudflare deploy must still be scheduled before the first `/sdv:ship`.
