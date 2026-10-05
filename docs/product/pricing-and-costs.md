# Pricing, running costs and competitors

Status: DRAFT for discussion (findings 2026-10-05; nothing here is decided)

This note keeps historical business findings from the free-tier review so the Owner can decide pricing later. It is not approved customer-facing pricing or proof of free storage, profitable scaling or competitor superiority. The 2026-10-05 figures have not been reverified by the copy review. The technical side is in [ADR-018](../architecture/decisions/ADR-018-free-tier-runtime-budget.md) and [ADR-019](../architecture/decisions/ADR-019-gallery-media-and-sync-on-free-tier.md).

## Running costs

Historical scenario, not the current staging bill or a capacity guarantee. Its Workers Free assumption must be read with [ADR-020](../architecture/decisions/ADR-020-staging-on-netlify.md): staging moved to Netlify after a CPU-limit failure; production hosting remains undecided. Tenant counts are planning assumptions, not verified limits or pricing tiers. Google Drive storage costs are separate.

| Stage | Tenants (active) | Monthly cost | Note |
|---|---|---|---|
| Owner's own studio | 1 | $0 | Free plans, if the 10 ms CPU check passes (ADR-018) |
| Early tenants | up to ~20–30 | $0 | Watch the upgrade triggers in ADR-018 |
| Beyond the free plans | ~30–50 and up | ~$45 (≈ Rp 740k at Rp 16,500/USD; check the rate) | Neon Launch ~$20, Resend Pro $20, Workers Paid $5 |

Prices were checked on the vendors' pages on 2026-10-05: Neon Launch $0.106/CU-hour plus $0.35/GB-month, no minimum; Resend Pro $20 for 50,000 emails; Workers Paid $5.

Per-tenant volume used (Owner's own studio): 50 clients a year, 300 proof + 30 edited photos each, about 12 MB of database a year.

## Competitor: Fastpik (fastpik.id)
These are dated observations recorded from its site and the Owner’s own client gallery on 2026-10-05, not a current independently verified comparison. Recheck original sources before publishing competitor claims; observations of one gallery do not establish every deployment’s behavior.

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

## Historical infrastructure-cost illustration
In the historical scenario, Rp 29,000/month × 26 paying tenants generates Rp 754,000, covering Rp 742,500 of assumed monthly infrastructure cost at the stated exchange rate. This is gross revenue against an illustrative cost subtotal, not business break-even: it excludes taxes, fees, support, labor and other costs. The 30–50-tenant range is not a verified free-plan capacity. Pricing and upgrade timing remain Owner decisions.

## Open questions for the Owner
- **Business model:** free for the Owner's studio only, a trial then subscription, or freemium (for example free up to N projects).
- **Price point** against Fastpik (Rp 29k/month) and the others it lists (130k + 15k/year, 149k/month).
- **Positioning:** test whether recording each shoot’s agreed package, price and schedule is useful to photographers. Invoicing and template-based sharing remain planned on this branch; do not imply current complete-MVP coverage or superiority over competitors.
- **Shutrly subscription payment method, if a paid plan is approved:** this commercial question is separate from the MVP’s client-invoice payments, which are recorded manually and have no gateway.
- **Scope comparison:** live selection tracking, size-specific print quotas, custom domains and Telegram reminders are not approved Shutrly MVP features. Client downloads are already planned in F-12, though not implemented here. Compare availability separately from intent before proposing additions.
- **When to add a paid plan:** at the ADR-018 upgrade triggers, or earlier.
