# Production runbook (Coolify, server 1)

Read this when touching production. It records every identifier, file, command and open step so the next agent can continue without the conversation. Never put secret values in this file: names and locations only.

Last verified: 2026-10-21. Owner: Hardiansa (`hardiansya94@gmail.com`).

## 1. Architecture as it stands

| Piece | Where | Notes |
|---|---|---|
| App host | Coolify v4.4.6 on server 1, public IP `168.110.219.5` (Oracle Cloud Batam, Ubuntu 24.04 ARM) | Dashboard `https://56.hardi.website`. Access and hardening: `server/oracle-free-tier/SERVERS.md` (outside this repo) |
| App | Coolify application `docker-image-paj7d979xt4ubruq6uuskwss` in project `wx632bs38yyfyrwjlg4rwtiq`, environment `mtuktmtkikzvxzdbxuoeywoi` | Docker image source, port 3000 |
| Image | `ghcr.io/hardi-dev/shutrly:main-e8d816da` (digest `sha256:38e7f6170b448efe40e6b5e4632729443591d0d84e9336cb3f0a367ebb418aa8`) | Built from `origin/main` at `e8d816da`. Coolify pulls it with the GHCR login |
| Domains | `https://shutrly.space`, `https://www.shutrly.space` (set on the application) | Let's Encrypt cert issued by Traefik |
| DNS | Namecheap (registrar and DNS, BasicDNS nameservers `dns1/dns2.registrar-servers.com`) | Domain `shutrly.space`, expires 2027-10-07 |
| Database | Neon project `shutrly-app` (`damp-mud-07829433`, ap-southeast-1), branch `main` (production, `br-still-bonus-azejk7r4`), database `neondb` | Pooled host `ep-muddy-heart-aznwz3gs-pooler.c-3.ap-southeast-1.aws.neon.tech` |
| Staging | Neon branch `staging` (`br-sweet-water-azjeozab`), Netlify site `shutrly` (team `hardiansya94`) | Unchanged. Staging deploys with `pnpm deploy:staging` (ADR-020) |
| Email | Resend, domain `shutrly.space` (id `a30a95ba-43fa-4248-9a0b-2b8e18b58e07`, Namecheap DNS, Tokyo) | **Verified** (2026-10-21). Sender `Shutrly <auth@shutrly.space>`. Earlier subdomain `mail.shutrly.space` (id `17cb9e30-…`) is still verified and can be removed later |
| Google sign-in | GCP project `shutrly` (project id `shutrly`), OAuth client "Shutrly production" | Redirect `https://shutrly.space/api/auth/callback/google`. Consent screen in **Testing** |
| Local secrets | `.env.production` in the repo root (git-ignored by `.env*`). Coolify token `~/shutrly-secrets/coolify.token` (mode 600, outside repo) | Never print values |

## 2. Production configuration

### 2.1 `.env.production` (local, git-ignored)

Keys and sources. Values are never copied here.

| Key | Source |
|---|---|
| `DATABASE_URL` | Neon `main`, pooled (`neonctl connection-string main --project-id damp-mud-07829433 --pooled`) |
| `APP_STAGE` | `production` |
| `BETTER_AUTH_URL` | `https://shutrly.space` |
| `BETTER_AUTH_SECRET`, `CLIENT_SESSION_KEY`, `GALLERY_PASSWORD_KEY` | Generated for production with Python `secrets` (not copied from staging) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | GCP OAuth client "Shutrly production" (copied via clipboard, not displayed) |
| `GOOGLE_DRIVE_API_KEY` | Copied from `.dev.vars` (the same GCP API key restricted to Drive API, ADR-005) |
| `RESEND_API_KEY` | Resend key `shutrly-production-auth` (Sending access). Shown once; pasted by the Owner |
| `AUTH_EMAIL_FROM` | `Shutrly <auth@shutrly.space>` (changed 2026-10-21 from `mail.shutrly.space`; Coolify updated and app restarted) |
| `RESEND_WAITLIST_API_KEY`, `RESEND_WAITLIST_SEGMENT_ID` | **Empty** (optional, ADR-022) |

Required at startup (`src/shared/env/app-env.schema.ts`): every key above except the two waitlist keys. Missing a required key makes the container fail to start.

### 2.2 Coolify environment

The application holds the 11 required keys, one entry each (duplicates were deleted on 2026-10-21). Check with:

```bash
tok=$(cat ~/shutrly-secrets/coolify.token)
curl -s -H "Authorization: Bearer $tok" https://56.hardi.website/api/v1/applications/paj7d979xt4ubruq6uuskwss/envs | python3 -c 'import json,sys; print(sorted(e["key"] for e in json.load(sys.stdin)))'
unset tok
```

Sending changes: `PATCH /api/v1/applications/{uuid}/envs/bulk` with `{"data":[{"key","value","is_preview":false,"is_build_time":false,"is_literal":false}]}`. This endpoint stores each key twice (build-time and runtime). Delete the extra copy with `DELETE /api/v1/applications/{uuid}/envs/{env_uuid}` so one entry per key remains. Restart the app after changing values.

### 2.3 Coolify API token

- Name `shutrly-deploy`, permissions Write, Deploy, Read, expires **2026-11-19**. Created in Keys & Tokens → API Tokens.
- Stored in `~/shutrly-secrets/coolify.token` (single line, mode 600). Verify with `GET /api/v1/version` (expects 200).
- Revoke and recreate when it expires. The existing `mcp` token is read-only and belongs to another tool.

### 2.4 Deploy

```bash
tok=$(cat ~/shutrly-secrets/coolify.token)
curl -s -X POST -H "Authorization: Bearer $tok" https://56.hardi.website/api/v1/applications/paj7d979xt4ubruq6uuskwss/start
unset tok
```

This returns a `deployment_uuid`. Poll `GET /api/v1/deployments/{deployment_uuid}` until `status` is `finished`. The GET form `/api/v1/deploy?uuid=…` returns 405 and must not be used.

### 2.5 One-command deploy

`pnpm deploy:prod` runs `scripts/deploy/coolify-deploy.sh`. It builds `origin/main` in a temporary worktree (arm64), pushes `ghcr.io/hardi-dev/shutrly:main-<sha>`, sets that tag on the Coolify application, restarts it, waits for `finished`, and checks `https://shutrly.space/`. It asks for confirmation unless run with `--yes`. Netlify's `prod` mode is refused. Run it from the repo, after the change is merged to `main` (`origin/main` is what gets built).

## 3. Building and pushing the image

Build from a clean checkout of `origin/main`, never from uncommitted work.

1. Docker runtime: Colima (profile `default`, 4 CPU, 6 GiB, aarch64). Start with `colima start --cpu 4 --memory 6 --arch aarch64`. Docker Desktop was too heavy and is not needed.
2. Worktree: `git worktree add --detach <scratch-dir> origin/main`, in the session scratchpad. Remove it afterwards with `git worktree remove --force`.
3. Build: `docker buildx build --platform linux/arm64 --load -t ghcr.io/hardi-dev/shutrly:<tag> .` First build takes about 10 to 20 minutes on the M1 (8 GB); later builds reuse layers.
4. Test: run the image with `docker run --env-file <file>`, check `/login` returns 200, then stop the container.
5. Login and push: `echo "$TOKEN" | docker login ghcr.io -u hardi-dev --password-stdin` (the Owner runs this, the token is not pasted in chat), then `docker push ghcr.io/hardi-dev/shutrly:<tag>`.
6. Tag convention: `main-<short sha>` for releases. Do not push `wip-*` tags for production. `wip-74db37e2` exists and should be deleted from GHCR.

Dockerfile (repo root) is a three-stage build: deps, build (`pnpm build`), and a runtime stage with `pnpm install --prod`. `.dockerignore` excludes `.env*`, `.dev.vars`, `.netlify`, `.claude`, caches and build output.

## 4. Database

- `main` (production) migrations: 24 of 24 applied, 30 tables, not seeded. Run on 2026-10-20.
- Command used: `DATABASE_URL_UNPOOLED=$(neonctl connection-string main --project-id damp-mud-07829433 --unpooled) pnpm db:migrate`. The env var overrides `.dev.vars` because dotenv does not override existing variables (`drizzle.config.ts`).
- Rules (AGENTS.md hard stops): migrate `main` only from a reviewed, committed migration, and report the run. Never seed production. Keep migrations additive.
- Seed scripts (`scripts/dev/seed.ts`) are for staging and local only. The demo owner `owner@shutrly.test` must not exist in production.

## 5. DNS (Namecheap)

Current state after the change on 2026-10-21:

| Type | Host | Value | Notes |
|---|---|---|---|
| A | `@` | `168.110.219.5` | Server 1 |
| CNAME | `www` | `shutrly.space` | Via the apex |
| CNAME | `rsend.mail` | `rsend-apne1.forge.rmta.net` | Resend SPF |
| CNAME | `send.mail` | `send.forge.rmta.net` | Resend SPF |
| TXT | `resend._domainkey.mail` | Resend DKIM public key | Copy the full value from Resend |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | |
| TXT | `@` | `v=spf1 include:spf.privateemail.com ~all` | Created by Private Email auto-config |
| MX | `@` | `mx1/mx2.privateemail.com` | Created by Private Email auto-config. Do not add by hand |

- Mail settings: Private Email (2 of 3 mailboxes in use).
- Removed: the default `www` CNAME to `parkingpage.namecheap.com`, the default `@` URL redirect, and the two Netlify A records `13.215.239.219` and `52.74.6.109`.
- Netlify DNS zone `shutrly.space` (team `hardiansya94`) was deleted by the Owner. Its email records duplicated Namecheap. Owner removed `shutrly.space` and `www` from the Netlify site on 2026-10-21. Owner deleted the Netlify DNS zone on 2026-10-21; the Netlify DNS list no longer shows `shutrly.space`.
- Namecheap editing: click a row to edit, then press Enter or tick the row's check. `SAVE ALL CHANGES` saves pending rows. Delete asks for **Yes**.
- Propagation: authoritative and Google DNS answer `168.110.219.5`. Some local resolvers still cache Netlify (`52.74.6.109`). Check with `dig @8.8.8.8 A shutrly.space`.

## 6. Resend

- Domain `shutrly.space`: **Verified** on 2026-10-21 00:37 (`https://resend.com/domains/a30a95ba-43fa-4248-9a0b-2b8e18b58e07`). DNS records at Namecheap: TXT `resend._domainkey` (DKIM), CNAME `rsend` and CNAME `send` (SPF subdomains). These are checked by Resend and must stay.
- Test email from production key to `hardiansya94@gmail.com` (sender `auth@shutrly.space`): **Delivered** on 2026-10-21 (Resend Emails page).
- Domain `mail.shutrly.space` (id `17cb9e30-…`) was verified earlier and is no longer used. Its DNS records can be removed later.
- Click-tracking is not configured (optional).
- API keys: `shutrly-production-auth` (Sending access, production). `Shutrly` (Full access) is probably staging's key. Do not reuse it for production.
- Staging still uses `onboarding@resend.dev` (test sender, only to the account owner).

## 7. Google OAuth

- Project `shutrly`. Branding: app name `Shutrly`, support and developer email `hardiansya94@gmail.com`, audience External.
- Status: **Testing**. Only listed test users can sign in. The test-user list was not set yet.
- To publish: privacy policy URL (check `https://shutrly.space/privacy` exists), verify `shutrly.space` in Google Search Console, add the authorized domain, then **Publish app**.
- Client "Shutrly production": Web application, redirect `https://shutrly.space/api/auth/callback/google`. Staging uses its own client in the other GCP project (ADR-012).
- The user's other project `promocc-528fa` is unrelated. Do not change it.

## 8. Gate and behaviour

- Production is landing-only during development ([ADR-021](../architecture/decisions/ADR-021-production-on-netlify-landing-only.md)). The proxy's production gate answers `/login` with 404. This is intended.
- Verified on 2026-10-21 against server 1 directly: `/` returns 200 (landing page), `/login` returns 404.
- Lifting the gate is an Owner product decision.

## 9. Code changes that made production possible

Merged to `staging` (PR #23) and `main` (PR #24, then #26 merged docs):

- Removed `@opennextjs/cloudflare`, `wrangler`, `open-next.config.ts`, `wrangler.jsonc`, the `workerd` build allowance, and the Cloudflare entries in `eslint.config.mjs`, `tsconfig.json` and `.gitignore`.
- `next.config.ts` loads `.dev.vars` with `process.loadEnvFile` when `NODE_ENV !== "production"`.
- `src/composition/request-context/request-context.ts` reads `process.env` and uses `after()` for `waitUntil`. Client IP comes from `x-nf-client-connection-ip` then `x-forwarded-for`. Request ID from `x-nf-request-id`, else a UUID.
- `workers-client-list-cache` is kept on purpose: it returns null on Node.
- Added `Dockerfile` and `.dockerignore`.
- Docs: `docs/operations/development-log.md` (PR #25 and #26).

## 10. Known gotchas

- **`head` is forbidden on this machine** (`CLAUDE.md`). Use `sed -n` or `tail -n`. This was broken repeatedly during the session.
- The Claude auto-mode classifier blocked DNS edits and some Namecheap and Resend actions even after the Owner gave permission. When blocked, stop and ask the Owner to do the click, then check the result with `dig`.
- Browser-pane clipboard copies from web pages were unreliable. Copy the value with the page's copy button and confirm the clipboard length, or let the Owner paste it into a file.
- Commit messages containing `.env` text are blocked by `.claude/hooks/guard.py`. Reword them.
- Coolify bulk env send creates duplicates. Clean up with DELETE as in 2.2.
- Coolify deploy uses `POST …/start`. GET `/api/v1/deploy` returns 405.
- `.env.production` contains live secrets. It is git-ignored. Do not paste it, print it, or copy it into docs.

## 11. Open steps, in order

1. Confirm public DNS: `dig +short A shutrly.space` on 8.8.8.8 returns `168.110.219.5`. Then `curl -s -o /dev/null -w "%{http_code}" https://shutrly.space/` and the same for `www`.
2. Resend: done. Sender is `auth@shutrly.space`, test email Delivered on 2026-10-21. Auth emails only send once the login is open.
3. Google: privacy policy page, Search Console verification, authorized domain, Publish app. Until then, add test users if people need to sign in.
4. Owner decision: lift the landing-only gate (ADR-021) and document it with a new ADR.
5. Optional: `RESEND_WAITLIST_API_KEY` and `RESEND_WAITLIST_SEGMENT_ID` for the waitlist (ADR-022).
6. After the DNS is stable for a day: delete the Netlify DNS zone for `shutrly.space`, and decide what to do with the Netlify production site (`shutrly`, builds currently stopped).
7. Delete GHCR tag `wip-74db37e2`.
8. Renewals: Coolify token by 2026-11-19; GHCR classic token by about 2027-01-18; Namecheap domain by 2027-10-07.
9. Staging items that remain open (not production-blocking): WhatsApp "Open WhatsApp" new-tab check on staging; F-26 verification (see the handoff).
