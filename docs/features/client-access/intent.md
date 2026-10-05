# Intent: Client access (gallery, selection, final delivery, add-ons)

Author: Owner (hardi-dev)
Source: IDEA
Status: ACCEPTED (Owner, 2026-10-05; open questions carry into discovery)

Scope decision (Owner, 2026-10-05): F-10 *Client gallery access*, F-11 *Selection*, F-12 *Final delivery* and F-13 *Add-ons* become one feature, `client-access`. Invoices (F-14) stay separate; see Open questions.

## Problem
The Owner can create, sync, password-protect and publish a gallery (F-09), but there is nothing a client can open. The gallery link and password exist only as data: no public page accepts `/g/{token}`, nothing checks the password, nothing limits guessing, and the client's browser has no safe way to receive photos. So J-04, J-05 and J-06 cannot start: a client cannot pick photos within what they paid for, the Owner cannot grant extra picks when asked, and finished files cannot be handed over. The Owner also cannot yet cut off a shared link without changing the password.

## Proposed outcome
One client-facing journey, from first open to final files:
- A client with the project link and the current password opens the published gallery on a phone or desktop. Anyone else gets nothing useful and learns nothing about whether a project exists.
- The client picks photos per selection group within the entitlement, sets print quantities where the group is quantity-based, and submits once (J-04). The Owner reviews and locks.
- When the client asks for more, the Owner creates and approves an add-on that raises the group's limit (J-05).
- When the Owner publishes final delivery, the same link and password show the finished files, each downloadable on its own, and the project moves to `DELIVERED` (J-06).
- Guessing the password is slowed enough to be impractical, and the Owner can end old access by changing the password or the link.

## Affected users and systems
- Client: new public, unauthenticated surface (`/g/{token}`), password gate, client session, gallery view (mobile first, GAP-04), selection, submission, final downloads.
- Owner: *Akses klien* area (link, password, link rotation if kept), review and lock of selections, add-on create/approve/cancel, publish final delivery, close selection without submission.
- F-09 Gallery: published and non-expired state, `passwordVersion`, photo kinds (`PROOF`, `EDITED`, `PRINT`), the Owner-only media endpoint reused behind token and password.
- F-07 Projects: the project token (BR-PRJ-003), project items that yield selection groups (BR-SEL-001), lifecycle and the move to `DELIVERED` (BR-PRJ-004).
- F-05 Catalog: `selectionRequired`, selection types `EDIT` and `PRINT` (BR-CAT-007).
- F-14 Invoices (not in this feature): approving an add-on adds a line to the project's draft invoice (BR-ADD-004).
- F-15 Sharing: the *Kirim link galeri*, *Ingatkan pilih foto* and *Kirim hasil akhir* menu items and messages.

## Constraints
- Access needs the project token and the current password, on a published, non-expired gallery (BR-ACC-001, C-104); client endpoints never reveal another project's data and an Owner session grants nothing on client routes (BR-ACC-003).
- Rate limits on password attempts, public gallery access and public selection submissions (BR-ACC-004).
- Photos reach the client only through the controlled paths and only for photos the client may see; no folder links, IDs, resource keys or API keys in the browser; private pages and JSON never publicly cached (BR-ACC-005, BR-SRC-003, ADR-019). Tokens, passwords and links containing them are never logged (C-103).
- Every unavailable case (wrong token, draft, expired, archived, cancelled project) shows one neutral page (Owner, 2026-10-05).
- Selection: the entitlement is per group (BR-SEL-001..003, BR-SEL-007); only `PROOF` photos are selectable (BR-SEL-004); `OPEN → SUBMITTED → LOCKED`, submit once, never reopened (BR-SEL-005); limits are checked in one locked transaction (BR-SEL-006, C-005).
- Final delivery: same link and password, `EDITED`/`PRINT` hidden until published, publish needs a synced finished file and a project in `BOOKED`, `SHOOTING` or `POST_PROCESSING`, each file downloads independently (BR-DEL-001..004).
- Add-ons: they target a selection group of the same project, approve or cancel atomically, and cancellation is refused below current usage (BR-ADD-001..006).
- Workers Free CPU and subrequest budget (ADR-018): the client view, media and downloads must not make it worse.
- UI is Indonesian and follows the approved design system.

## Out of scope
- Invoices, payments, issuing and the `/i/{token}/{invoiceId}` page (F-14). Whatever add-on approval needs from an invoice is a dependency, not part of this feature (see Open questions).
- WhatsApp sharing and message previews (F-15).
- Project cancellation. *(Project completion, BR-PRJ-005, was moved into scope during discovery, Owner 2026-10-05; spec FC-006.)*
- Client accounts or logins (scope.md); providers other than Google Drive; uploading photos into Shutrly.
- Owner-side gallery management, sync and password rotation (done in F-09).

## Open questions
- **CONFLICT, add-ons need invoices:** BR-ADD-004 says approving an add-on adds a line to the project's sole draft invoice, creating one if needed, and BR-ADD-005 needs billing adjustments on issued invoices. Invoices are F-14, which this decision does not merge. Options: (a) add-on approval raises the limit now and the invoice line arrives with F-14 (needs BR-ADD-004 to say so, an Owner change to a domain rule); (b) pull the minimum invoice model into this feature; (c) merge F-14 too. Not changed until the Owner decides.
- **Size and slicing:** four features in one is large and spans J-04..J-06. Confirm it should still be built as ordered slices (gate and gallery, selection, add-ons, final delivery) with one spec, or whether discovery should split it again.
- **Slug and feature map:** keep `client-access` as the slug for the merged feature? The feature-map rows for F-11..F-13 are marked as merged into F-10 with this intent; the *Project menu* table still lists F-11 and F-12 items and needs the same relabel when this is accepted.
- **Token rotation:** the token is the secret part of the link (BR-PRJ-003). Rotating it gives a new link and kills every link already shared, even for someone who knows the password; password rotation (F-09) keeps the link. Does the Owner want a token rotation control here, or password rotation only for now? (scope.md lists both.)
- **SPEC GAP, client session:** how long a client stays in after the password, and whether a password change signs them out at once (J-04 says old sessions are invalidated).
- **SPEC GAP, rate limits:** the limits (attempts per token and per IP, window, lockout message) and where counters live on the free tier.
- **SPEC GAP, selection types:** BR-SEL-003 leaves quantity-based vs count-based unspecified beyond `EDIT` (count) and `PRINT` (sum); fine while the catalog limits types to those two (BR-CAT-007).
- **SPEC GAP, client requests an add-on:** J-05 starts with "client requests extra"; is the request made in the app, or off-app (for example WhatsApp) with the Owner creating the add-on?
- **SPEC GAP, final download:** one file at a time only, or also a zip of all finished files? BR-DEL-004 says each file is an independent download.
- **SPEC GAP, unavailable page:** confirm an expired gallery shows the same page as a wrong link, with no contact hint.
- **GAP-04:** the client gallery's mobile screens, navigation and breakpoints are not designed yet; that happens in `/sdv:design-feature`.
