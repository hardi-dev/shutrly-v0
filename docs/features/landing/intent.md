# Intent: Landing page

Author: Owner (hardi-dev)
Source: IDEA
Status: DRAFT

## Problem
Shutrly has no public face. Anyone who opens the root URL sees the F-00 placeholder ("Fondasi siap. Fitur berikutnya: F-01 Auth."), which says nothing about the product. A photographer who hears about Shutrly can't learn what it does, why it differs from the tools they use now (Google Drive, WhatsApp, spreadsheets, Fastpik), or how to show interest. The Owner has no way to collect interested photographers before opening Shutrly to other studios (`docs/product/pricing-and-costs.md` › open questions).

## Proposed outcome
A visitor to the root URL quickly understands what Shutrly is and who it is for: an Indonesian photographer or small studio. The page makes two points. First, Shutrly runs the whole studio in one place per brand: services, clients, projects, team, galleries, invoices and WhatsApp messages. Second, its private Google Drive galleries let clients choose photos within clear limits and receive final files. An interested photographer can join a waitlist in a few seconds. The Owner can see who joined. Returning Owners can still reach sign-in.

## Affected users and systems
- Visitor: a prospective Owner (photographer or studio), not signed in, often on a phone.
- Owner: sees the waitlist entries. Where and how is an open question.
- Root route `/`: replaces the F-00 placeholder. It is already a public route.
- Entry points for existing Owners: sign-in (F-01).
- Something that stores waitlist entries. Which store is a planning decision, not part of this intent.

## Constraints
- The copy is in Indonesian (id-ID), as assumed under GAP-05, and follows the approved design system (Studio Lime tokens, `docs/design-system/token-usage.md`).
- The page describes features in product terms that match the product overview and scope (C-001, C-002). It must not claim anything the MVP scope excludes, such as direct WhatsApp sending (C-106) or file uploads to Shutrly.
- The waitlist collects personal data from people who are not signed in. Input is validated, the endpoint is protected against abuse, and the data stays server-side (C-006).
- The waitlist form and the page handle their loading, validation, error and success states (C-007) and are accessible (C-008).
- Hosting cost stays within the free-tier budget (ADR-018). The page is mostly static, and the waitlist must not add a paid dependency.
- No pricing on the page while `docs/product/pricing-and-costs.md` is still a draft (Owner, 2026-10-07).

## Out of scope
- Pricing, plans and payment.
- Comparison with named competitors.
- Opening self-service registration to the public, or changing the auth flow.
- Emails to people on the waitlist: confirmations, campaigns or invitations.
- An admin product for managing the waitlist beyond what the Owner needs to see entries.
- Blog, documentation, testimonials, custom domains and analytics. Analytics is listed so it gets an explicit decision later.
- English copy.

## Open questions
- **Features that aren't built yet:** the Owner chose to present the full MVP as available. Client selection (F-11), final delivery (F-12), add-ons (F-13), invoices (F-14) and WhatsApp sharing (F-15) are still `TODO`. Should the page go public only once those ship, or go live earlier with copy that doesn't mention timing? (C-001: the page should not promise what users can't do.)
- **SPEC GAP: registration versus waitlist.** `/register` is public today and the MVP scope includes Owner self-registration. With a waitlist as the main call to action, does `/register` stay reachable for anyone who knows the URL, get hidden from the page, or close until invitation? Closing it would change `docs/product/scope.md`, which is the Owner's decision.
- **Waitlist fields:** email only, WhatsApp number only, or both? Also optional fields such as name, studio or brand name, city, and photography type.
- **Consent and privacy:** does the form need a consent line or a privacy note, and how long are entries kept?
- **Duplicates:** what happens when someone joins twice with the same contact? Assumption (low risk, reversible): the visitor sees the same success message, no second entry is stored, and the page doesn't reveal whether the contact was already on the list.
- **Owner view:** where does the Owner see entries? Options are a simple protected page, an export, or reading them straight from the database. Assumption (low risk, reversible): MVP needs only a read-only view or export, with no editing.
- **Sign-in link:** assumption (low risk, reversible): a quiet *Masuk* link in the header for returning Owners. Signed-in Owners who open `/` see the landing page and are not redirected.
- **Brand assets:** is there a logo, screenshots or illustration? Without them, the page uses the wordmark and design-system visuals, and screenshots come from the Pencil frames of built features.
