# ADR-004: One client access token per project + required hashed gallery password

Status: Accepted · password storage and re-entry superseded by ADR-017 (2026-10-04)
Date: 2026-09-25

## Context
Clients have no accounts but must reach their gallery and invoices privately. Slugs are guessable. WhatsApp sharing wants to include the gallery password.

## Decision
- Each project has one high-entropy random `clientAccessToken`, used by `/g/{token}` and `/i/{token}/{invoiceId}`. Rotating it invalidates all links of that project.
- The gallery additionally requires a password; only a hash is stored, with `passwordVersion`. Rotation increments the version and invalidates older gallery sessions immediately; invoice links are unaffected.
- `{{galleryPassword}}` is resolved only when the Owner re-enters and verifies the password during a share action. Plaintext is never persisted or logged.
- Slug is display-only.

## Alternatives Considered
- Separate tokens per gallery/invoice — more links to manage, no product benefit.
- Storing encrypted plaintext password for re-sharing — rejected; secret at rest.

## Consequences
### Positive
- Simple link model; strong secret; password re-share without storing plaintext.
### Negative / Trade-offs
- Token holder sees all issued invoices of the project.
- Password appears in the WhatsApp draft/link; Owner is warned.

## Related
- Business rules: BR-PRJ-003, BR-GAL-002, BR-GAL-003, BR-ACC-*, BR-MSG-003
