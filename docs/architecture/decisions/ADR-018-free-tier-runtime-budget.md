# ADR-018: Run on the free tiers of Cloudflare Workers, Neon and Resend

Status: Accepted (Owner, 2026-10-05). Point 2, the CPU measurement, was done on 2026-10-05: every measured path used far more than the documented 10 ms, yet ran without errors on a Workers Free account. The Owner decided to go on with Workers Free as it is and watch for CPU errors (see Measurement › Decision).
Date: 2026-10-05
Follow-up (2026-10-06): the staging Worker hit Cloudflare error 1102; staging moved to Netlify Free by [ADR-020](ADR-020-staging-on-netlify.md). Follow-up (2026-10-07): production moved to Netlify too, serving only the landing page during development, by [ADR-021](ADR-021-production-on-netlify-landing-only.md).
Amends: [ADR-008](ADR-008-cloudflare-runtime.md) (adds the plan the runtime must fit), [ADR-011](ADR-011-resend-transactional-email.md) (adds the email budget)

## Context
The Owner wants to run Shutrly on free plans only, not the Workers Paid plan. F-09's technical design assumed the paid plan (R-1). The free-plan limits below were checked on the vendors' pages on 2026-10-05; re-check them before relying on them.

| Service | Free-plan limit that matters | Source |
|---|---|---|
| Cloudflare Workers | 50 subrequests per request; **10 ms CPU per request**; 100,000 requests per day; 128 MB memory | developers.cloudflare.com/workers/platform/limits |
| Neon | 1 GB storage per project (20 GB per account); **100 CU-hours per project per month**; scale to zero after 5 min (mandatory); 5 GB egress; 6 h restore window | neon.com/pricing |
| Resend | **3,000 emails per month, 100 per day**; 3 domains | resend.com/pricing |

Paid fallbacks on the same date: Workers Paid $5/month; Neon Launch $0.106/CU-hour plus $0.35/GB-month, no monthly minimum; Resend Pro $20/month for 50,000 emails.

## Decision (proposed)
1. **Target the free plans** of Workers, Neon and Resend for the Owner's own use and the first tenants.
2. **Measure CPU before ship.** Deploy a preview to a free Workers account and read CPU time per request (`wrangler tail` or the dashboard) for register, login, the dashboard, the gallery page and a sync.
   - Every path stays ≤ 10 ms, or does after a fix (for example a lighter password hash): stay on Workers Free.
   - A path stays over 10 ms: a new ADR picks between Workers Paid, another host (candidate: Google Cloud Run free tier; only `src/composition/request-context` uses `getCloudflareContext`) or a different hash. Vercel Hobby is excluded because it is non-commercial only.
3. **Design every request for 50 subrequests and 10 ms CPU.** Long work is split into short requests. The gallery sync is the first case ([ADR-019](ADR-019-gallery-media-and-sync-on-free-tier.md)).
4. **Upgrade triggers.** Move a service to its paid plan when its dashboard shows one of these, not before:
   - Resend over ~80 emails on a day, or over 2,500 in a month;
   - Neon over ~80 CU-hours in a month, or storage over ~800 MB;
   - Workers over ~80,000 requests on a day, or CPU errors (exceeded limit) in the logs.
5. **No limit evasion.** Shutrly never spreads load across several free accounts, projects or API keys to avoid a limit. Cloudflare and Google forbid it, and a ban would take down every tenant.

## Capacity estimate
Per tenant (Owner, 2026-10-05): 50 clients a year, 300 proof + 30 edited photos per client. At about 0.75 KB per `gallery_photo` row including indexes (measured 0.6 KB on test data), that is ~16,500 photos and **~12 MB a year**, or ~25 MB while the sync still rewrites every row (ADR-019 removes that).

| Limit | First reached at about |
|---|---|
| Resend 100 emails/day | 30–50 active tenants |
| Neon 100 CU-hours/month (the database is awake more than ~13 h a day) | 30–100 active tenants, depending on how spread out their use is |
| Neon 1 GB storage, no cleanup | ~76 tenant-years (one tenant: ~76 years) |
| Neon 1 GB storage, archived galleries cleaned after 6 months | 160–300 tenants, then flat |
| Workers 100,000 requests/day (images served by Google, ADR-019) | ~450 tenants |
| Workers 10 ms CPU | independent of tenants: passes or fails from the start (point 2) |

Cost once every service is paid: about **$45/month** (Neon Launch with 0.25 CU awake all month ≈ $20, Resend Pro $20, Workers Paid $5). Pricing and break-even are discussed in [docs/product/pricing-and-costs.md](../../product/pricing-and-costs.md).

## Measurement (2026-10-05, point 2)

- **How:** `opennextjs-cloudflare build`, then `wrangler deploy` of the F-09 rework branch as a throwaway Worker `shutrly-cpu-check` (non-production secrets, deleted afterwards), and `wrangler tail --format json` for each request's `cpuTime`. Wrangler 4.141.0.
- **Result, `GET /login` (a page with no session and no database):** 20 requests, CPU **22–43 ms on 9 of them, 356–1,007 ms on the other 11** (median 356 ms). `GET /robots.txt` (a redirect from the middleware): 2, 4 and 45 ms.
- **Reading:** the Workers Free limit is 10 ms CPU per request, and even the best `/login` request used more than twice that. The high values look like cold isolates paying for the bundle's start-up. Every request returned HTTP 200 with outcome `ok`. The account's billing page shows **Workers Free** (Owner, 2026-10-05), so the 10 ms limit was **not enforced in this low-traffic test**. Why is unknown: the limit may be applied loosely at very low load, or `cpuTime` in `wrangler tail` may not be the figure that is enforced. The numbers therefore show the cost of **Next.js on OpenNext itself**, before any F-09 code runs; they say nothing against the gallery sync.
- **Second round, signed-in paths (2026-10-05).** A second throwaway Worker, the Owner signed in themselves with a named test account, and the gallery flow was driven in the in-app browser against the real Drive folder (113 photos). `wrangler tail` `cpuTime`, one sample each (a cold or warm isolate is not controlled):

  | Path | CPU | Wall |
  |---|---|---|
  | `POST /login` | 444 ms | 785 ms |
  | Projects list page (document) | 631 ms | 729 ms |
  | Project page (document) | 354 ms | 430 ms |
  | Client navigation (RSC) between pages | 6–60 ms | 6–240 ms |
  | Propose password (open *Buat galeri*) | 27 ms | 101 ms |
  | Create gallery | 184 ms | 366 ms |
  | Check folder link | 17 ms | 94 ms |
  | Link folder | 144 ms | 330 ms |
  | Sync, 113 photos in one step (1 Drive list call) | 102 ms | 1,085 ms |
  | Re-sync, same folder (one step, nothing changed) | 173 ms | 1,396 ms |
  | *Lihat semua foto* (browse) | 365 ms | 582 ms |

  Every request returned HTTP 200 on a Workers Free account. **Every measured server path used more than the documented 10 ms CPU; the smallest, the check of a folder link, used 17 ms.** The sync step itself (102–173 ms) is 10–17 times the limit, and a normal gallery visit is dominated by the Next.js render, not by the gallery code.
- **A separate defect found on the way:** `POST /reset-password` hung for about 550 seconds (CPU 176 ms, wall 549,628 ms, outcome `canceled` once the browser tab was closed), so the form stayed on *Menyimpan…*. The earlier requests in the same Worker logged `Network connection lost`. It is not part of this ADR's question but affects any Workers deployment.
- **Reading:** the app exceeds the documented Free limit by roughly 10× on a sync step and 35–60× on page renders, but no request was refused in a session with one user. That is evidence that it can run, not that it will keep running: the documentation says a request over the limit is stopped (error 1102), and the looser behaviour seen here is not documented.
- **Decision (Owner, 2026-10-05): go on with Workers Free as it is.** No further load test now and no change of host or plan. The cost of being wrong is visible and cheap to fix: the upgrade trigger in point 4 (CPU errors in the logs) already says when to move to Workers Paid ($5/month), and `src/composition/request-context` is the only code tied to the Workers context if a host change is ever needed. Until then, watch the Worker's error rate (1102 and 5xx) in the dashboard or `wrangler tail`.
- **Unresolved:** the reason the limit was not enforced, and the separate reset-password hang found in the same test ([FND-001](../../findings/FND-001-reset-password-hangs-on-workers.md); not fixed yet).
- **Sync step size (follow-up, 2026-10-05):** `SYNC_STEP_MAX_ENTRIES` is 1,000, derived from these measurements (see the gallery technical design, R-6).

## Alternatives considered
- **Workers Paid from the start ($5/month):** removes the CPU and subrequest risk at once. Rejected for now by the Owner (free only).
- **Move to Google Cloud Run (free tier, card required):** a plain Node runtime with no 10 ms or 50-subrequest limit. Cold starts of a few seconds. Kept as the fallback if point 2 fails.
- **Oracle Cloud Always Free VM or Render free:** the VM brings server upkeep; Render sleeps after 15 min with 30–60 s wake-ups. Not preferred.

## Consequences
- The Owner can run Shutrly for their own studio at no cost, as long as the CPU measurement passes.
- Every feature plan checks its requests against 50 subrequests and 10 ms CPU.
- Neon scale-to-zero adds a short wake-up delay to the first request after 5 idle minutes.
- Paid plans become necessary at roughly 30–50 active tenants; the business side must cover about $45/month by then.

## Related
- ADR-008, ADR-009, ADR-011, ADR-019
- F-09 technical design › Risks R-1, R-3
