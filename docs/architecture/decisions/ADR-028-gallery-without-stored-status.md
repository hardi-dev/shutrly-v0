# ADR-028: The gallery has no stored status

Status: Accepted (Owner, 2026-10-18, F-27 [intent](../../features/simplify-project-gallery-flow/intent.md) D-1…D-8)
Date: 2026-10-18
Amends: [ADR-019](ADR-019-gallery-media-and-sync-on-free-tier.md) (point 5: `contentVersion` events; point 6: photo clean-up trigger)

## Context
F-09 gave the gallery its own lifecycle (`DRAFT → PUBLISHED → EXPIRED | ARCHIVED`) beside the project's. Every booked project ends up with one gallery, and the Owner found the two lifecycles and the rules that tie them (publish preconditions, delete-draft vs archive, archive on cancel, selection groups at first publish) too complicated. There are no real users yet, so no stored data needs to be kept compatible.

## Decision
1. **No `status` column on `gallery`** and no publish, archive or delete-gallery action. Whether a gallery is open is a pure function of `project.status` and `gallery.expires_at` (BR-GAL-005), computed wherever it is read, the client availability check included.
2. **The gallery is created with the project's move to `BOOKED`**, in the same transaction, through the composition layer (ADR-016): the projects feature doesn't write gallery tables itself. The selection groups are created in that transaction too (BR-SEL-001).
3. **Expiry** is stored only as `expires_at`. A duration chosen by the Owner is turned into `expires_at` when it is saved; no pending duration is stored.
4. **Migration:** drop `gallery.status` and the publish and archive columns (`published_at`, `archived_at` and any pending-duration column) only after the code that reads them is deployed, because the deployed `staging` code shares the database (ADR-027). Projects `BOOKED` or later without a gallery get one, with a generated password, in a data migration (intent D-8).
5. **No final-delivery publish either** (intent D-9, D-10): finished files are visible once synced (BR-DEL-002). *Tandai terkirim* is a project status step that keeps writing `gallery.final_delivery_published_at` (read by F-26), so that column stays.
6. **ADR-019 amended:** `contentVersion` increments on sync, expiry change, password rotation and source removal (publish and archive are gone). Point 6's deferred clean-up keys on galleries of projects `CANCELLED` or `COMPLETED` more than 6 months ago instead of "archived".

## Alternatives considered
- **Keep the status, auto-publish on the first folder:** fewer clicks, but two lifecycles remain for the Owner and the code.
- **Keep only `ARCHIVED`:** the Owner closes a gallery by setting its expiry to today instead (intent D-3).

## Consequences
- A gallery is open from the moment the project is booked. It is still protected by the token **and** the password (BR-ACC-001, ADR-004, ADR-017), and the Owner shares both only when ready (BR-GAL-010).
- A gallery can't be removed apart from deleting its `DRAFT` project, which has none. A cancelled project's gallery stays as a closed, read-only record.
- About 60 source files that read the status change; the client-access availability rule becomes simpler.
- The data migration needs the gallery password key (`GALLERY_PASSWORD_KEY`) to encrypt the generated passwords, so it runs as a script, not plain SQL.

## Related
- BR-GAL-001, 002, 004, 005, 009, 010; BR-ACC-001; BR-SEL-001; BR-PRJ-010; ADR-004, ADR-016, ADR-017, ADR-019, ADR-027
