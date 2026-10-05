# F-09 Gallery — verification report (free-tier rework)

Date: 2026-10-05 · Verifier: agent (`/sdv:verify-feature gallery`, **focused run**: the Owner asked for the gallery only, not the full suite) · Branch `feat/gallery-free-tier` (PR draft) · Result: **PASS for the rework, pending Owner acceptance**, with two open findings and one decided risk (below).

Sources: [spec.md](spec.md), [acceptance-criteria.md](acceptance-criteria.md) (AC-GAL-001…036), [technical-design.md](technical-design.md) (D-1…D-27, R-1…R-9), [plan.md](plan.md) (slices 0–8, R1–R5), [design.md](design.md), constitution v1.2, `docs/coding-rules.md`, ADR-017/018/019, [findings/](../../findings/README.md).

## Scope of this run

- **Run:** typecheck; ESLint on the gallery code, its adapters, composition, the shared units it touches and the gallery tests and scripts; unit/dom tests for those; `tests/integration/gallery`; an AC-to-test coverage check.
- **Not run, on purpose:** `pnpm test` (full suite), the full E2E suite. The ship run (same day, after the Owner's manual-test UI fixes) added `pnpm build` (PASS) and `gallery-create.spec.ts` + `gallery-sync.spec.ts` against the fixture Drive (PASS). `gallery-drive-smoke.spec.ts` (real Drive) passed before those fixes.

## Quality gate (related checks)

| Check | Result |
|---|---|
| `tsc --noEmit` | PASS |
| ESLint (gallery, adapters, composition, `photo-tile`, `media-viewer`, `src/ui/hooks`, gallery tests and scripts) | PASS |
| Unit/dom: `src/features/gallery`, `src/adapters`, `photo-tile`, `media-viewer`, `src/ui/hooks`, `Input`, `TextField`, `Icon` | PASS: 327 tests, 87 files |
| `tests/integration/gallery` (non-production Neon) | PASS: 39 tests, 7 files |
| `pnpm tokens:check` (last run with the cursor change) | PASS: 623 tokens, CSS variable usage valid |
| Migrations `0013_gallery_free_tier`, `0014_gallery_drop_last_seen` | PASS: generated, reviewed, applied. `0014` drops `gallery_photo.last_seen_at` (Owner-approved) and breaks older F-09 code on other branches against the shared database. |

## Acceptance criteria → tests

Checked by searching the test files for each AC ID. Every one of AC-GAL-001…036 has at least one test.

- **Unit, integration and E2E:** 001, 003, 005, 006, 008, 015, 027, 032.
- **Unit and integration:** 004, 007, 010, 012, 013, 014, 016, 018, 021–025, 028, 030, 033.
- **Unit only:** 002, 009, 011, 017, 019, 020, 026, 029, 031, 034.
- **Integration only:** 035 (folder identifiers never reach a view or result), 036 (content version per event).
- AC-GAL-026 (accessibility) is carried by the axe and keyboard steps inside the E2E specs (`gallery-create`, `gallery-sync`, `gallery-drive-smoke`) rather than by tests named with the ID.

## Business rules and amendments

- BR-GAL-001…009 and BR-SRC-001…006: enforced server-side and covered above. BR-ACC-005 and BR-SRC-003 were amended with the Owner's decision (images from the provider by file ID, folder identifiers never in a browser); C-103 is v1.2.
- C-005 (consistency): sync steps claim with a lease, write in one locked transaction and are tested for concurrent steps, a stale run and a failed run.
- C-101 (isolation): `gallery-isolation.test.ts` drives every use case and the media route from another workspace.

## Deviations (all reported, none silent)

- No *Ganti password* button in the *Akses klien* header (it is in the ⋯ menu); *Galeri dibuka lagi* toast not wired (slice 6 record).
- *Buat ulang* sits inside the password input, not beside it as in the exports (Owner, 2026-10-05; `design.md`). The viewer's next arrow is the chevron pair of the previous arrow (Owner).
- The view flag for direct images is `directImages`, and the direct URL is chosen by the photo's provider (`source-image` domain table), not the global `imageHost` of the first D-22 (Owner, after checking `source-config`).
- D-24: a sync step bumps `content_version` only when a photo row changed, because AC-GAL-036 says an unchanged re-sync leaves it.
- "Earlier photos stay unchanged" became "photos already saved are kept, none marked missing" for a failed run (D-23; Owner agreed).
- The Owner media route's provider adapter is still the single Google one; `serveOwnerPhoto` must choose by `photo.provider` when a second provider exists (D-22).

## Findings and risks

- **Decided risk (Owner, 2026-10-05): go on with Workers Free.** [ADR-018 › Measurement](../../architecture/decisions/ADR-018-free-tier-runtime-budget.md): every measured path used far more than the documented 10 ms CPU (sync step 102–173 ms, browse 365 ms, pages 354–631 ms, `/login` 22–1,007 ms) yet no request was refused on a Workers Free account. The Owner chose to watch for CPU errors (upgrade trigger in ADR-018 point 4).
- `SYNC_STEP_MAX_ENTRIES = 1,000`: derived from the measurements (technical design R-6), still a lower-bound model for the variable part.
- [FND-001](../../findings/FND-001-reset-password-hangs-on-workers.md) (OPEN): `POST /reset-password` hangs on Workers. Auth, not gallery; to be fixed later.
- [FND-002](../../findings/FND-002-gallery-page-save-failed-once-in-e2e.md) (OPEN, low): one `SAVE_FAILED` page render logged during an E2E run, cause unproven.
- A gallery page for a project that has no gallery shows the generic *Workspace tidak ditemukan* (`notFound()`); not a gallery defect, but the message is misleading.

## Result

The rework meets its design and all 36 acceptance criteria have tests that pass. Open before production: the Owner's acceptance, the production secrets and migrations (see the release notes), and FND-001 for the auth path on Workers.
