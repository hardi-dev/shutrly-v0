# Development and production log

A dated record of how Shutrly got from the staging-only setup to a production host on our own server. Newest entries go at the bottom. Secret values are never written here: they live in the git-ignored `.env.production` and in the Coolify UI, and the Coolify token lives outside the repo in `~/shutrly-secrets/`.

## Status at the time of writing (2026-10-21)

| Area | State |
|---|---|
| Production host | Coolify on server 1 (`168.110.219.5`), application `docker-image-paj7…`, port 3000 |
| Image | `ghcr.io/hardi-dev/shutrly:main-e8d816da` (built from `origin/main` at `e8d816da`) |
| Public DNS | `shutrly.space` and `www` point to server 1 in Namecheap; public resolvers still caching Netlify for a while |
| Production database | Neon project `shutrly-app`, branch `main`: 24 migrations applied, 30 tables, not seeded |
| Staging | Netlify, branch `staging`, unchanged |
| Email (Resend) | Domain `mail.shutrly.space` added, DNS records added, status **Pending** |
| Google sign-in | GCP project `shutrly`, OAuth client "Shutrly production", consent screen in **Testing** mode |

## Timeline

### 2026-10-18 to 2026-10-19: server 1 and Coolify

- Oracle Cloud server 1 (`instance-20261017-0025`, Ubuntu 24.04, ARM) set up for apps. Hardening and access rules are in `server/oracle-free-tier/SERVERS.md` (outside this repo).
- Coolify v4.4.6 installed on server 1 and served at `https://56.hardi.website`.

### 2026-10-18: staging database and F-27

- Feature F-27 (simplify project and gallery creation) merged to `staging` through PR #16, with follow-ups #17 to #22.
- PR #22 restored page headings on pages without a server heading. Staging redeployed from `staging` at `74db37e2`.

### 2026-10-19: database layout (ADR-029, PR #21)

- Decided one Neon project `shutrly-app` with two branches: `main` for production and `staging` as the only non-production database. Older Neon projects are retired by the Owner.
- Staging migrated to 0023 and seeded with the demo owner account. The seed is staging-only and was not run on production.

### 2026-10-20: production image and Cloudflare removal

- Cloudflare was the first host, then Netlify, and now Coolify. The Cloudflare runtime (`@opennextjs/cloudflare`, `wrangler`, `open-next.config.ts`, `wrangler.jsonc`) was removed, so the production build runs as a plain Node server.
- Local development now loads `.dev.vars` through `process.loadEnvFile` in `next.config.ts`, and only outside production.
- The request context reads `process.env` and no longer reads Cloudflare or Netlify headers for the client IP and request ID. `x-nf-*` headers are still read because staging remains on Netlify.
- `Dockerfile` (multi-stage, arm64-compatible Node 22) and `.dockerignore` added. The runtime stage installs production dependencies only.
- `workers-client-list-cache` was kept on purpose: it only uses Cloudflare's `caches.default` when present and returns null on Node.
- Docker runtime: Docker Desktop used too much RAM, so Colima (4 CPU, 6 GiB) replaced it. First arm64 build takes roughly 10 to 20 minutes.
- PR #23 (`chore/remove-cloudflare-dockerfile`) merged into `staging`. PR #24 merged `staging` into `main` (6 commits, including PR #22).
- Image built from a clean worktree of `origin/main` and pushed as `main-e8d816da` (digest `sha256:38e7f617…`). The local container served `/login` with 200 before the push.
- An earlier test image `wip-74db37e2` was pushed from uncommitted changes. It is not a release and can be deleted from GHCR.

### 2026-10-20: GitHub registry and Coolify application

- GHCR login created with a classic GitHub token (`write:packages`, 90-day expiry, so renewal is due around 2027-01-18). The token was entered in Coolify's Docker Registries page, not in chat.
- Coolify project `shutrly`, environment `production`, application created as a Docker image from `ghcr.io/hardi-dev/shutrly:main-e8d816da`. Port 3000 set in the application's Networking section.

### 2026-10-20: production database migration

- Neon `main` got the migrations from `drizzle/` (commit `308ab2f9` is the last migration commit). Run with the direct (unpooled) connection from `neonctl`.
- Result: 24 of 24 migrations applied, 30 tables. The seed was not run.
- Connection details came from `neonctl connection-string main`. Pooled and direct URLs are stored only in `.env.production`.

### 2026-10-20: Google OAuth

- GCP project `shutrly` created. Consent screen: app name `Shutrly`, audience External, support and contact email `hardiansya94@gmail.com`.
- OAuth client "Shutrly production", type Web application, redirect URI `https://shutrly.space/api/auth/callback/google`.
- Client ID and secret copied into `.env.production` without being displayed.
- Consent screen still in Testing mode. Only test users can sign in until it is published. Publishing needs a privacy policy URL and verified domain.

### 2026-10-20 to 2026-10-21: Resend (email sending)

- Domain `mail.shutrly.space` added in Resend, region Tokyo (NS1 provider).
- Records for DKIM (`resend._domainkey.mail`), SPF (`rsend.mail` and `send.mail` CNAMEs) and DMARC (`_dmarc`) added in Namecheap.
- Verification attempted; status **Pending** while DNS propagates. Recheck with the **Verify DNS Records** button.
- Production API key `shutrly-production-auth` created with Sending access only, not the Full access key used by staging.
- `AUTH_EMAIL_FROM` set to `Shutrly <auth@mail.shutrly.space>`. Sending address does not need an inbox.

### 2026-10-21: DNS move from Netlify to Namecheap

- `shutrly.space` is registered at Namecheap. Its DNS was on Netlify (`nsone.net`).
- Mail stays on Namecheap Private Email. MX and mailbox settings were left to Private Email auto-configuration, so the MX records were not added by hand.
- Nameservers changed to Namecheap BasicDNS.
- Default Namecheap records removed (`www` CNAME to parking page, `@` URL redirect).
- Records set in Namecheap: A `@` to `168.110.219.5`, `www` CNAME to `shutrly.space`, plus the Resend records. Old Netlify A records (`13.215.239.219`, `52.74.6.109`) removed.
- Authoritative and Google DNS now answer `168.110.219.5`. Local resolver caches still show Netlify until the TTL expires.
- Netlify DNS zone for `shutrly.space` still exists. Delete it only after the cutover is confirmed.

### 2026-10-21: Coolify deploy on the real domain

- Coolify API token `shutrly-deploy` created with Write and Deploy permissions, 30-day expiry (until 2026-11-19). Saved to `~/shutrly-secrets/coolify.token`, outside the repo.
- Eleven production environment variables sent to the application through the Coolify API. A bulk send created duplicate entries, so the duplicates were deleted, leaving one entry per key.
- Domains on the application: `https://shutrly.space` and `https://www.shutrly.space`.
- Deploy triggered through `POST /api/v1/applications/{uuid}/start` (the GET deploy endpoint returned 405). Deployment finished.
- Let's Encrypt certificate issued for `shutrly.space`.
- Landing-only gate (ADR-021) working as designed: `/` returns 200, and `/login` returns 404 on production while the development phase lasts.

## Decisions made along the way

- **Production host:** Coolify on server 1, not Netlify. Netlify stays for staging.
- **Production build:** from a clean `origin/main` worktree, never from uncommitted work.
- **DNS:** Namecheap BasicDNS instead of Netlify DNS, so the domain and its records are managed in one place. Netlify DNS is removed only after the move is stable.
- **Sending domain:** subdomain `mail.shutrly.space` so the main domain's reputation is kept separate.
- **Secrets:** not sent through chat. Copied through the clipboard or pasted by the Owner into a git-ignored file or the Coolify UI.

## Open items

- Resend: wait for DNS propagation, then verify `mail.shutrly.space` and check the `send.mail` CNAME (it was still "Not Started" last time).
- `RESEND_WAITLIST_API_KEY` and `RESEND_WAITLIST_SEGMENT_ID` are empty in `.env.production`. Both are optional.
- Google OAuth: add privacy policy, verify the domain, then publish the consent screen. Until then, add test users to let people sign in.
- Local DNS cache: confirm `shutrly.space` and `www.shutrly.space` reach server 1 once caches expire.
- Netlify: delete the `shutrly.space` DNS zone after the cutover is stable, and decide what to do with the Netlify site for production.
- WhatsApp "Open WhatsApp" button: confirm in a real browser that it opens a new tab. The browser pane replaced the same tab on automated clicks, which is a pane limitation, not confirmed app behaviour.
- Documentation: ADRs and docs that still mention Cloudflare as a host (for example ADR-008, ADR-018, `docs/architecture/tech-stack.md`) are not updated yet. Those are Owner-level decisions.
- Old GHCR tag `wip-74db37e2` can be deleted.
- Owner deletes the retired Neon projects (`shutrly-v0`, `shutrly-staging-us`, `shutrly-f00-foundation`, `shutrly`).
