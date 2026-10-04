# Pricing, running costs and competitors

Status: DRAFT for discussion (findings 2026-10-05; nothing here is decided)

This note keeps the business findings from the free-tier review so the Owner can decide pricing later. The technical side is in [ADR-018](../architecture/decisions/ADR-018-free-tier-runtime-budget.md) and [ADR-019](../architecture/decisions/ADR-019-gallery-media-and-sync-on-free-tier.md).

## Running costs

| Stage | Tenants (active) | Monthly cost | Note |
|---|---|---|---|
| Owner's own studio | 1 | $0 | Free plans, if the 10 ms CPU check passes (ADR-018) |
| Early tenants | up to ~20–30 | $0 | Watch the upgrade triggers in ADR-018 |
| Beyond the free plans | ~30–50 and up | ~$45 (≈ Rp 740k at Rp 16,500/USD; check the rate) | Neon Launch ~$20, Resend Pro $20, Workers Paid $5 |

Prices were checked on the vendors' pages on 2026-10-05: Neon Launch $0.106/CU-hour plus $0.35/GB-month, no minimum; Resend Pro $20 for 50,000 emails; Workers Paid $5.

Per-tenant volume used (Owner's own studio): 50 clients a year, 300 proof + 30 edited photos each, about 12 MB of database a year.

## Competitor: Fastpik (fastpik.id)
These are public facts from its site and the Owner's own client gallery, 2026-10-05.
- **Product:**
  - clients pick photos from a Google Drive folder, with live tracking;
  - extra photos, print picks with a quota per size (4R, 5R, 10R…) and downloads;
  - separate link durations for picking and downloading;
  - password, custom domain, WhatsApp templates, Telegram reminders to the photographer;
  - dark mode, Indonesian and English;
  - no limit on the number of photos, subfolders included.
- **Price:**
  - Rp 29,000/month, Rp 79,000/3 months or Rp 289,000/year, all features;
  - 7-day trial with up to 3 projects;
  - payment by QRIS only (via Mayar);
  - sign-in with Google only.
- **Its own comparison table** lists: a competitor at 130k + 15k/year, another at 149k/month, and Google Drive "depends on the Google plan".
- **Stack (observed):** Next.js behind Cloudflare, Supabase (auth, database, realtime), Sentry, self-hosted Umami. Photos are listed live from Drive and loaded straight from Google's image servers.
- **Weak spot to avoid:** the gallery page sends the Drive folder link to the browser, so a client can open the folder directly, past the password and expiry.

## Break-even sketch
At a Fastpik-like Rp 29,000/month per tenant, ~$45/month is covered by about **25 paying tenants**. That is roughly where the free plans run out (30–50 active tenants), so a paid plan should exist before then.

## Open questions for the Owner
- **Business model:** free for the Owner's studio only, a trial then subscription, or freemium (for example free up to N projects).
- **Price point** against Fastpik (Rp 29k/month) and the others it lists (130k + 15k/year, 149k/month).
- **Where Shutrly differs:** Fastpik covers selection and delivery. Shutrly also covers projects, clients, catalog, team, invoices and WhatsApp messages. Is that the pitch?
- **Payment method:** QRIS like Fastpik, or a gateway with more methods.
- **Features Fastpik has that Shutrly hasn't planned:** live selection tracking, print picks with a quota per size, client downloads, custom domain, Telegram reminders. Which belong on the feature map?
- **When to add a paid plan:** at the ADR-018 upgrade triggers, or earlier.
