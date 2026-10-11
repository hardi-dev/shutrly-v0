# Product Overview

Status: ACCEPTED product intent (migrated from `_source/` on 2026-09-25); wording clarified 2026-10-06. Feature availability is tracked separately in [feature-map.md](feature-map.md).

## Product

Shutrly’s central product goal is to help photographers move from a shoot’s photos to a clear record of which photos their client wants edited. The intended workflow links photos from Google Drive to a project gallery, lets the client choose within the package allowance, and lets the photographer review those choices before editing. Finished files are delivered through the same gallery.

Package details, agreed price, scheduling, brand workspaces, team assignments and billing support that photography workflow. They are not the primary positioning. Payments remain manually recorded and WhatsApp messages manually sent.

This describes product intent, not a claim that the complete MVP is already available. Consult the feature map and owning feature verification before describing a capability as usable today. In the bilingual worktree, client access/selection, final delivery, add-ons, billing and real template-based WhatsApp sharing remain future surfaces.

## Primary User

**Owner / Photographer** — a solo photographer or small studio owner who may run several brands (for example, Aster Wedding and Aster Family) and hires freelancers for particular shoots. Only the Owner signs in; recording a team assignment does not give a freelancer access to Shutrly.

Secondary: **Client** — the photographer’s customer, who uses project-specific links in the intended client journey without creating an account.

## Central Problem — Knowing Which Photos to Edit

When a client communicates photo choices through chat messages or separate lists, the photographer has to connect those choices to the right files and check the package allowance. The product addresses that handoff with choices recorded against photos in the project’s gallery. This is the product-discovery problem, not a measured claim of hours saved.

Feature chain: **F-09** links and displays Drive photos → **F-10** grants client gallery access → **F-11** records client selections per package group for Owner review → **F-12** delivers final photos. J-04 describes the selection/review handoff; J-06 continues with final delivery. The client chooses; the photographer reviews and edits outside Shutrly. An independent photographer-culling workflow, AI image ranking, editing software integration or an exported editing checklist is not specified by the feature map.

## Supporting Problems and Product Response

These situations come from the original product discovery and describe the problem the product is intended to address. They are not measured customer outcomes or evidence of time/revenue savings.

| Photographer’s situation | Shutrly’s response | Boundary |
|---|---|---|
| The client’s chosen package, agreed price and shoot schedule are spread across messages and notes. | Record the client, package details, agreed price, booking information and sessions in one project. | The Owner enters and updates the record; Shutrly does not import or reconcile WhatsApp conversations. |
| A service package changes after a client has booked. | Copy package items and booking-field metadata into the project when it is created, so later catalog edits do not silently change that project. | The Owner may explicitly adjust project values and price while it is draft/booked; the deal locks when shooting starts (BR-PRJ-009). |
| Several brands need separate client and project records. | Keep each brand’s records in a separate workspace and let the Owner switch between them. | This is data separation, not staff collaboration or automatic detection of a brand. |
| It is unclear who is working each session. | Record a team member and role against the project session. | No freelancer login, availability checks, double-booking prevention or fee/payment tracking in F-08. |
| Clients choose photos by sending lists, while editing/print allowances are checked manually. | Intended client selection groups show and enforce each package item’s allowance, with print quantities where applicable. | This is a future client-selection feature in this branch; no live-tracking or automatic reminder promise. |
| Final files and payment follow-up need to stay connected to the project. | Intended delivery reuses the gallery link; invoices record charges and manually entered payments; templates prepare client messages. | These future workflows do not provide a payment gateway, bank reconciliation, automatic sending or automatic project completion. |

## Value Proposition and Claim Boundaries

- **Know which photos the client wants edited:** in the intended F-11 workflow, client choices refer to gallery photo records and stay within their group’s package allowance. The photographer reviews the selections before working on the files. This is the main product benefit, not a claim that F-11 is already implemented.

- **A project record for each shoot:** the client’s package, agreed price and sessions can be checked together. Do not promise that the entire photography business is automated or that no other tools are needed.
- **Catalog changes do not rewrite existing projects:** distinguish independence from the service template from the Owner’s permitted project edits. Avoid “the agreement never changes”.
- **Separate records for each brand:** workspace isolation does not imply staff accounts, shared team access or collaborative editing.
- **Existing Google Drive files can be linked:** the Owner shares folders and initiates sync; Shutrly reads metadata and displays the photos without uploading, editing or deleting the originals. Drive storage charges/quotas and Shutrly pricing are separate; “no storage cost” is not an approved claim.
- **Controlled access to the Shutrly gallery page, in the intended client feature:** link and password checks do not make publicly link-shared Drive files private. A direct Drive link bypasses app protection, and a retained Google image URL may still work after gallery expiry/password rotation (BR-ACC-005, ADR-019). Do not promise that access controls revoke downloaded files or all direct-image access.
- **Selection, delivery and billing remain tied to project rules, when their features are delivered:** the Owner still creates/uploads final files in Drive, records payments and sends WhatsApp messages. Scope does not establish present availability.

## Message Direction

Lead overall product positioning with the photo-choice handoff: the client chooses photos in the gallery and the photographer reviews what to edit. Explain the mechanism with Drive photos, gallery selections and package allowances. Use project, scheduling and billing benefits as supporting context. Page-specific copy still explains its own task; not every screen needs a selection headline. Short page titles and CTAs remain literal and actionable.

Avoid unverified time savings, more bookings, faster payment, “all-in-one”, “secure photos”, “free storage”, automatic reminders, or claims that the complete intended journey is already shipped. Selection-led product/editorial copy is a draft for the intended F-10/F-11 experience and must wait for those features before implying present availability. Interim auth copy can describe the existing project record; current implementation order does not change the central product goal. [The copy deck](../features/bilingual-copy-revamp/copy-deck.md) contains proposed EN/ID wording and its claim review.

## Primary Journey

Intended complete MVP: set up a service → create a client project and record the agreement/sessions → link a Drive folder and publish a gallery → client submits photo selections → Owner publishes finished files through the same gallery → issue invoices and record payments → Owner marks the project complete. Delivery, billing and communication are explicit actions; the sequence does not imply automatic progression or present availability of all steps.

## Success

The MVP is complete only when [scope.md § MVP Completion Criteria](scope.md#mvp-completion-criteria) is verified end-to-end for a real project. Availability claims must also match the release/acceptance state of the relevant feature.

## Open Decisions

The MVP is not yet complete on this branch. Localization preference/recipient/legacy policies remain open in [localization.md](localization.md); pricing is undecided in [pricing-and-costs.md](pricing-and-costs.md). Remaining feature-specific gaps are recorded in their owning specs and the feature map. Deferred scope is listed in [scope.md § Later](scope.md#later).

## Bilingual experience (Owner 2026-10-06)

All dashboard and client-gallery journeys follow [localization policy](localization.md): English default, explicit EN/ID switching, complete single-language presentation, bilingual descriptive content and templates, preserved identity/business values. Existing workflows and manual sending remain unchanged. Preference persistence, recipient-language choice and legacy-data rollout must be resolved before implementation. Localization applies to implemented features now and future journey surfaces when they are built.
