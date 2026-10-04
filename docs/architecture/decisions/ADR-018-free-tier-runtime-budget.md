# ADR-018: Run on the free tiers of Cloudflare Workers, Neon and Resend

Status: Accepted (Owner, 2026-10-05). Point 2, the CPU measurement on a free Workers preview, is still to do and needs the Owner's go-ahead to deploy.
Date: 2026-10-05
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
