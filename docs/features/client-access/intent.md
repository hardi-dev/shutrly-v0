# Intent: Client gallery access

Author: Owner (hardi-dev)
Source: IDEA
Status: DRAFT

## Problem
The Owner can create, sync, password-protect and publish a gallery (F-09), but there is nothing a client can open. The gallery link and password exist only as data: no public page accepts `/g/{token}`, nothing checks the password, nothing limits guessing, and the client's browser has no safe way to receive photos. Until a client can get in, J-04 stops at "Owner shares", and the selection (F-11), final delivery (F-12) and sharing (F-15) features have no client surface to build on. The Owner also cannot yet cut off an old link without changing the password.

## Proposed outcome
A client who holds the project link and the current password can open the published gallery on their phone or desktop and use it: look through the photos they are allowed to see, and, per the Owner's answer on 2026-10-05, take the further client actions of the proofing journey (see Open questions for exactly which). A client without the right link, password, or a valid gallery gets nothing useful and learns nothing about whether a project exists. Guessing is slowed down enough to be impractical. When the Owner changes the password or rotates the link, previously shared access stops working as BR-PRJ-003 and J-04 describe.

## Affected users and systems
- Client: new public, unauthenticated surface (`/g/{token}`), password gate, client session, gallery view on mobile first (GAP-04 in the handoff: client gallery mobile screens, bottom navigation and breakpoints are still open).
- Owner: *Akses klien* area of the gallery/project (link, password, and any link rotation control); Owner is the only one who sees the password (ADR-017).
- F-09 Gallery: published, non-expired state, `passwordVersion`, the Owner-only media endpoint that F-10 reuses behind token and password.
- F-07 Projects: the project token (BR-PRJ-003) and cancel-archives-gallery rule.
- Photo delivery: server-controlled media URLs or Google's image host by file ID (BR-ACC-005, ADR-019).
- Downstream: F-11 selection, F-12 final delivery, F-14 invoices (`/i/{token}/{invoiceId}`), F-15 sharing.

## Constraints
- Access needs the project token and the current password, on a published, non-expired gallery (BR-ACC-001, C-104).
- Client endpoints authorize only by token (+ password) and never reveal another project's data; an Owner session grants nothing on client routes (BR-ACC-003).
- Password attempts, public gallery access and public submissions are rate-limited (BR-ACC-004).
- Photos reach the client only through the controlled paths and only for photos the client may see; folder links, folder IDs, resource keys and API keys never reach the browser; private pages and JSON are never publicly cached (BR-ACC-005, BR-SRC-003, ADR-019).
- Tokens, passwords and links containing them are never logged or put in analytics (constitution C-103).
- Every unavailable case (wrong token, draft, expired, archived, cancelled project) shows one neutral page (Owner, 2026-10-05).
- Runs on the Workers Free plan under the CPU and subrequest budget in ADR-018; the client view must not make that budget worse.
- UI is Indonesian and follows the approved design system.

## Out of scope
- Anything not named in "Proposed outcome" or settled under Open questions.
- Client accounts or logins (scope.md).
- Owner-side gallery management, sync and password rotation (done in F-09).
- Providers other than Google Drive; uploading photos into Shutrly.

## Open questions
- **CONFLICT (needs Owner decision), scope of the client view:** the Owner answered "all of them" to browse only / browse plus download / browse plus selection. The feature map splits selection to F-11, final delivery to F-12 and invoices to F-14, and scope.md has no proof download. Options: (a) keep F-10 as browse + gate + session + media and ship the rest in their own features (recommended: the gate is the shared base and the rest need their own rules, AC and design); (b) fold selection into F-10 and rename/merge F-11; (c) also add proof download as a new rule. The feature map and BR-SEL-* are not changed until the Owner decides.
- **Token rotation, what it means:** the *token* is the secret part of the link, `/g/{token}`, created with the project (BR-PRJ-003). Rotating it gives the project a new link and kills every link already shared, for the gallery and for invoices, even if the client still knows the password. Rotating the *password* (F-09, BR-GAL-003) keeps the same link and changes only what the client types. Do you want a token rotation control for the Owner in this feature, or only password rotation for now? (scope.md lists both.)
- **SPEC GAP, client session:** how long a client stays in after entering the password, whether a password rotation signs them out at once (J-04 says old sessions are invalidated), and whether one browser session covers the gallery only or also invoices later.
- **SPEC GAP, rate limits:** the limits themselves (attempts per token, per IP, window, lockout message) and where the counters live on the free tier.
- **SPEC GAP, unavailable page:** a neutral page for every case also hides *expired*; confirm that a client with an expired gallery sees the same page as a wrong link, with no contact hint.
- **GAP-04:** the client gallery's mobile screens, navigation and breakpoints are not designed yet; design happens in `/sdv:design-feature`.
