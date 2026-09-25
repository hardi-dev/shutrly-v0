# ADR-011: Resend for transactional auth email

Status: Accepted
Date: 2026-09-25

## Context
Better Auth needs an email sender for verification links and password-reset links (F-01). These are system emails from the platform to the Owner — not messages on the Owner's behalf to clients, which stay manual via WhatsApp (C-106, BR-MSG-001). The runtime is Cloudflare Workers (ADR-008).

## Decision
- Send transactional auth emails through **Resend** (HTTP API, `fetch`-based SDK — Workers-compatible).
- Only the platform's own auth emails go through Resend in MVP: email verification and password reset.
- Sending sits behind an `AuthEmailSender` interface in `infrastructure/email`; Better Auth callbacks call it.
- The API key is a server secret; the sending domain has SPF/DKIM/DMARC configured before production.
- Email bodies and verification/reset URLs are never logged (C-103 redaction applies to these tokens).

## Alternatives Considered
- Cloudflare Email Service: same vendor as runtime; Owner preferred Resend.
- Postmark / SES / SMTP: no advantage for current volume.

## Consequences
### Positive
- Simple API, good deliverability tooling, works on Workers without Node sockets.
### Negative / Trade-offs
- Another vendor and secret to manage; free-tier limits must be watched.
- Sending must not leak account existence via response timing (send without blocking the response where possible).

## Related
- Constitution: C-103, C-106
- Business rules: BR-AUTH-003
- Feature: F-01
