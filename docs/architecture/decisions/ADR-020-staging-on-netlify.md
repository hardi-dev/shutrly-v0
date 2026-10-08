# ADR-020: Run staging on Netlify Free, with its own Neon project in us-east-2

Status: Accepted (Owner, 2026-10-06). Applies to **staging only**; the production host is not decided here.
Date: 2026-10-06
Amends: [ADR-008](ADR-008-cloudflare-runtime.md) (a second runtime for the same build), [ADR-009](ADR-009-neon-serverless-driver.md) (the staging database moves to its own project), [ADR-018](ADR-018-free-tier-runtime-budget.md) (point 2 is answered for staging: another host)

## Context
ADR-018 point 2 said a path over the Workers Free CPU limit needs a new ADR choosing Workers Paid, another host or a lighter start-up. The staging Worker `shutrly-staging` then failed with **Cloudflare error 1102, Worker exceeded resource limits**, so staging was unusable. The Owner chose to try another host. Netlify was picked because it runs a Next.js build on plain Node with no per-request CPU cap, and it has a free plan.

## Decision
1. **Staging runs on Netlify Free.** Site `shutrly` (admin: `app.netlify.com/projects/shutrly`), deployed by hand from the `staging` git branch with `netlify deploy --build --alias staging` to `https://staging--shutrly.netlify.app`. It is a branch deploy (not the site's main URL), so `BETTER_AUTH_URL` is the alias URL and the Google OAuth client lists `<alias>/api/auth/callback/google`.
2. **One build, two hosts.** `src/composition/request-context` picks the binding source:
   - on Workers, or under `next dev` (`.dev.vars`): the Cloudflare context, as before;
   - on a production Node build that is not a Worker (`NODE_ENV=production` and `navigator.userAgent` is not `Cloudflare-Workers`, i.e. Netlify): `process.env`, with `waitUntil` mapped to Next's `after()`.
   - Client IP and request ID also read Netlify's `x-nf-client-connection-ip` and `x-nf-request-id` after the Cloudflare headers.
   - This file is the only one allowed to read `process.env` in `src/` (eslint exemption); every other unit still reads config from `getRequestContext().env`. `next.config.ts` skips `initOpenNextCloudflareForDev()` when `NETLIFY` is set. `netlify.toml` sets `pnpm build`, publish `.next` and Node 22.
3. **Runtime variables** (`DATABASE_URL` pooled, `APP_STAGE`, `BETTER_AUTH_*`, Google, Resend, Drive, `GALLERY_PASSWORD_KEY`) are Netlify site environment variables, never in `netlify.toml`. `DATABASE_URL_UNPOOLED` is not set there; only migrations use it.
4. **Staging database moves to its own Neon project** `shutrly-staging-us` (`aws-us-east-2`, Postgres 18; org `hardiansa`). It started **empty** and received migrations `0000`–`0014` from the committed files with drizzle-kit over its direct connection (an Owner-approved exception to "migrate runs only against the shared non-production database", for this new staging database only). The old staging branch (`staging` of `shutrly-v0`, ap-southeast-1) is kept until the Owner deletes it. Staging still receives only migrations already merged to `main`.
5. **Visitor access** on the Netlify site is public (changed by the Owner in the Netlify UI; branch deploys are private by default and returned 401 until then).
6. **The Cloudflare path stays.** `wrangler.jsonc`, `open-next.config.ts` and the `@opennextjs/cloudflare` and `wrangler` dependencies stay, and the Worker `shutrly-staging` is not deleted. The `pnpm preview` and Cloudflare `pnpm deploy:staging` scripts were removed (Owner 2026-10-06); `pnpm deploy:staging` and `pnpm deploy:prod` now deploy to Netlify. Run `opennextjs-cloudflare build` and `preview` or `deploy --env staging` by hand if the Workers path is needed. Remove the rest only by a later ADR once the production host is chosen.

## Measurements (2026-10-06, from the Owner's network in Indonesia)
Lighthouse performance (`/login`): **94** (FCP 1.4 s, LCP 2.9 s, TBT 110 ms, 356 KiB). The frontend is not the problem; the server round trips are.

| Request on staging | TTFB |
|---|---|
| `favicon.ico` (no code, no database) | 0.5–0.8 s |
| `/login` (no database for a signed-out visitor) | 0.8–1.1 s before, 0.5–0.9 s after the database move |
| `/api/health` (one query) | 1.3–1.6 s before, 0.9–1.1 s after |
| first request after idle (cold start) | 4–7 s |

Reference: `fastpik.id/id/login` (Next.js behind Cloudflare, Singapore edge) 0.17–0.31 s.

- **Cause:** Netlify Free runs functions in `us-east-2` only (changing it returns "Your plan does not support configuring function regions"; the attempt failed the build and was reverted). Every request goes Singapore edge → Ohio → back. With the database in Singapore, each query also crossed the Pacific, plus a Neon WebSocket handshake per request.
- **Fix applied:** the database moved next to the function (point 4). About 0.4 s of query cost went away; the **~0.5 s edge-to-function hop remains**.

## Amendment (Owner, 2026-10-07)
- Point 4: migrations `0015_pick_mode`, `0016_selection` and `0017_add_on` were applied to `shutrly-staging-us` (and to the old staging branch) before they were merged to `main`, at the Owner's request, so F-10 could be tested on staging. All three are additive, with triggers that keep the `main` code working. Every database (shared non-production, `shutrly-staging-us`, the old staging branch) records `0000`–`0017` with hashes matching the files.
- Point 4 (Owner, 2026-10-09): migration `0018_folder_map` (F-21, additive: table `gallery_folder_map`, `gallery_photo.project_item_id`, `gallery_source.known_folders`) was applied to `shutrly-staging-us` with drizzle-kit over its direct connection before PR #12 was merged, at the Owner's request. It records `0000`–`0018`, the `0018` hash matching the file. The old staging branch was not migrated.
- Point 3: `CLIENT_SESSION_KEY` (F-10, ADR-023) was added as a Netlify **secret** for the production, deploy-preview and branch-deploy contexts; Netlify refuses secrets in the `dev` context.
- Staging and both other databases were seeded with demo data by `pnpm db:seed` (tech-stack › Seed data).

## Alternatives considered
- **Workers Paid ($5/month):** removes the 1102 risk and keeps one runtime. Not chosen for staging; still the cheapest way back to Cloudflare (ADR-018 point 4).
- **Netlify Pro with a function region in Asia:** the pricing page (checked 2026-10-06) lists Free $0 / 300 credits, Personal $9 / 1,000, Pro $20 / 3,000 per month; it does not say which plan unlocks function regions. Not tested.
- **Draft deploy without an alias, or the site's main URL (`--prod`):** the alias gives a stable URL for `BETTER_AUTH_URL` without calling a staging build "production".
- **Copy staging data to the new database:** needs `pg_dump` 18 (the local one is 14). Owner chose an empty start.

## Consequences
- Staging works again. The Neon staging database starts empty: register the owner and link a gallery folder again.
- Netlify Free allows 300 credits a month (a deploy costs 15, compute 10 per GB-hour, bandwidth 20 per GB). Watch *Usage & billing*; a gallery sync is the first heavy request.
- Latency on Netlify Free is bounded by the Ohio function (~0.5 s). Production on Cloudflare Workers would run at the edge, so the numbers above are not a production forecast.
- Two Neon regions exist now (ap-southeast-1 for dev and non-production, us-east-2 for staging). A migration must be applied to each by hand until CI exists.
- The `.dev.vars.staging` file and the Cloudflare staging Worker still point at the old database; they are stale for the new staging.
- The Netlify CLI printed secret values once (`env:import`); the staging secrets should be rotated if that transcript is shared.

## Related
- ADR-008, ADR-009, ADR-018; `docs/architecture/tech-stack.md` › Deployment
