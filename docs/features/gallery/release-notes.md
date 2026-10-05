# Release F-09 Gallery — free-tier rework

Date: 2026-10-05 · Status: **ready to merge, not deployed to production** · PR: [hardi-dev/shutrly-v0#8](https://github.com/hardi-dev/shutrly-v0/pull/8) (draft until the Owner marks it ready)

## Included Features

- **Sync in steps.** A sync is a run of requests, each with at most 40 Drive list calls and one Drive page of entries, resumed from a cursor kept on the source. It shows *Menyinkronkan… n dari m folder*, any folder size works, and a re-sync of an unchanged folder rewrites no photo row. A source that fails keeps the photos its earlier steps saved.
- **Images from the provider.** Tiles and the preview load from Google by file ID (`lh3.googleusercontent.com/d/<id>`), with no referrer and one fallback to the Owner-only media route. The provider decides whether a direct URL exists, so a future provider needs one table entry, not a UI change. Folder links, folder IDs and the API key never reach a browser.
- **Content version.** `gallery.content_version` rises on every change a client could see, ready for F-10's cache key.
- **Publish** stops checking folders at the first accessible one.
- **Owner manual-test fixes (2026-10-05).** *Buat ulang* sits inside the password input and stays while the field shows an error; the viewer's next arrow matches the previous one; *Cari nama file* has a clear button; every enabled control now shows the pointer cursor (a global base rule).
- **Docs and rules.** Constitution v1.2 (C-103), BR-ACC-005, BR-SRC-003, AC-GAL-015 amended and AC-GAL-032…036 added; ADR-018 and ADR-019 accepted; a findings register (`docs/findings/`).

## Verification

- [verification-report.md](verification-report.md): focused run, all 36 acceptance criteria have passing tests.
- Ship run (2026-10-05): `pnpm build` PASS; E2E `gallery-create.spec.ts` and `gallery-sync.spec.ts` (fixture Drive) PASS after the manual-test fixes; the real-Drive smoke spec passed earlier on the Owner's 113-photo folder. Typecheck, ESLint and the related unit and integration tests PASS (327 unit/dom, 39 integration).
- **Not run, by the Owner's choice:** the full unit, integration and E2E suites.

## Smoke Test

- Critical journey J-04, Owner half, on a Cloudflare Workers preview (a throwaway Worker, deleted afterwards) against the non-production database and the Owner's public Drive folder: sign in, project, *Buat galeri*, *Tambah folder*, sync of 113 photos, thumbnails, *Lihat semua foto*, re-sync. It worked end to end.
- Locally (2026-10-05): the same journey, plus password rotation, the viewer and search, tried by the Owner.

## Known Issues

- **CPU on Workers Free.** Measured paths use far more than the documented 10 ms (sync step 102–173 ms, browse 365 ms, pages 354–631 ms) but no request was refused on a Workers Free account. Decision (Owner): go on and watch for CPU errors; upgrade trigger in ADR-018 point 4.
- [FND-001](../../findings/FND-001-reset-password-hangs-on-workers.md): `POST /reset-password` hangs on Workers (auth, to be fixed later).
- [FND-002](../../findings/FND-002-gallery-page-save-failed-once-in-e2e.md): one unexplained `SAVE_FAILED` page render (low).
- A gallery page for a project with no gallery shows *Workspace tidak ditemukan*.
- Small deviations from the design are listed in the verification report.

## Rollback / Recovery Notes

- **Code:** revert the merge commit. The old sync (one request, up to 300 list calls) needs Workers Paid and a cursor-less schema, so a revert should be paired with a decision on the plan.
- **Database:** the shared non-production database already has `0013` and `0014`. `0014` dropped `gallery_photo.last_seen_at`; older F-09 code that writes it fails against that database. Restoring the column is a new migration, not an edit of `0014`. **Production has not been migrated**: apply `0013` and `0014` in order, from `main` through the migration path in `docs/architecture/tech-stack.md`, only when production is provisioned.
- **Production prerequisites (Owner):** the Drive API key (`GOOGLE_DRIVE_API_KEY`) and the gallery password key (`GALLERY_PASSWORD_KEY`, 32 random bytes, base64url) as Worker secrets; nothing else changed in the runtime configuration.
- A source stuck in *Menyinkronkan* (a closed browser) is continued by the next *Sinkronkan*, or restarts after 30 minutes.
