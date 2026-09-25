# ADR-006: WhatsApp communication via prefilled deep links only

Status: Accepted
Date: 2026-09-25

## Context
Indonesian clients communicate via WhatsApp. The WhatsApp Business API adds cost, approval, and template restrictions.

## Decision
Resolve workspace `MessageTemplate`s into text and build `wa.me` links; the Owner reviews and sends manually. No Message/MessageLog entity, delivery status, or provider message IDs in MVP. The template model stays channel-generic for future EMAIL/SMS/API sending.

## Alternatives Considered
- WhatsApp Business API — deferred to post-MVP.

## Consequences
### Positive
- No external messaging dependency or cost.
### Negative / Trade-offs
- No delivery tracking; message content (possibly including the gallery password) lives in the link — never log it.

## Related
- Business rules: BR-MSG-*
- Feature: F-03, F-15
