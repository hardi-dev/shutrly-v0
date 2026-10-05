# Product Overview

Status: ACCEPTED (migrated from `_source/` on 2026-09-25)

## Product
Shutrly — a web platform that runs the operational side of a photography business: service catalog, client projects, private proofing galleries with entitlement-aware photo selection, final delivery, invoicing with manual payments, and WhatsApp-based client communication.

## Primary User
**Owner / Photographer** — a solo photographer or small studio owner who may run several brands (e.g. "Aster Wedding", "Aster Family") and occasionally hires freelancers.

Secondary: **Client** — the photographer's customer, who never creates an account and interacts only through private links.

## Problem
Photographers juggle packages, bookings, Google Drive folders, WhatsApp chats, photo-selection spreadsheets, and invoices across disconnected tools. Clients select photos in ad-hoc ways, entitlement limits ("20 edited, 5 prints, +5 extra") are tracked manually, and billing drifts from what was agreed.

## Value Proposition
- One place per brand (Workspace) for services, clients, projects, galleries, and invoices.
- Package benefits are snapshotted per project, so the agreed deal never drifts when services change.
- Clients select photos against clear, add-on-aware limits (e.g. "12 / 25 selected") via one private link + password — the same link later delivers final files.
- Photos stay in the Owner's Google Drive; no upload/storage cost or migration.
- Invoices and payments stay consistent with add-ons; sharing happens through prefilled WhatsApp messages the Owner already uses.

## Primary Journey
Owner sets up a service → creates a project for a client → links a Drive folder and publishes a gallery → client selects photos → Owner delivers finished files through the same gallery → invoices and records payments → marks the project complete.

## Success
MVP works when the criteria in [scope.md § MVP Completion Criteria](scope.md#mvp-completion-criteria) hold end-to-end for a real project.

## Open Questions
None blocking MVP. Deferred topics are listed in [scope.md § Later](scope.md#later).

## Bilingual experience (Owner 2026-10-06)

All dashboard and client-gallery journeys follow [localization policy](localization.md): English default, explicit EN/ID switching, complete single-language presentation, bilingual descriptive content and templates, preserved identity/business values. Existing workflows and manual sending remain unchanged. Preference persistence, recipient-language choice and legacy-data rollout must be resolved before implementation. Localization applies to implemented features now and future journey surfaces when they are built.
