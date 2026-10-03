# ADR-005: Google Drive via Owner-shared public folder links, read-only, behind a provider interface

Status: Accepted
Date: 2026-09-25

## Context
Photographers already keep photos in Google Drive. OAuth/service-account integration adds verification and credential burden for MVP.

## Decision
- The Owner shares a root folder "Anyone with the link" and pastes it. The server extracts folder ID + optional resource key and lists public metadata with a server-side Google Cloud API key.
- Root images → `PROOF`; files directly in `edited` / `print` (case-insensitive) → `EDITED` / `PRINT`; others ignored. *Amended 2026-10-04 (Owner, F-09): the whole folder tree is synced; see BR-GAL-007 for the classification.*
- Sync is idempotent on `(gallerySourceId, externalFileId)` with status/error recorded.
- The platform never writes to Drive. The domain depends on a `GallerySourceProvider` interface.
- The Owner is warned that direct Drive links bypass app protection.

## Alternatives Considered
- Owner OAuth (drive.readonly) — Google app verification, token storage; deferred.
- Service account with folder sharing — setup friction for Owners; deferred.
- Uploading into platform storage — storage cost, migration friction; out of scope.

## Consequences
### Positive
- Zero storage cost; minimal Owner setup; no stored credentials.
### Negative / Trade-offs
- Security of originals depends on Drive link secrecy.
- Revoked sharing breaks sync/media; must surface as sync error.
- Media delivery must proxy or use controlled URLs to avoid exposing the API key.

## Related
- Business rules: BR-SRC-*, BR-GAL-006, BR-GAL-007, BR-ACC-005
- Feature: F-04, F-09
