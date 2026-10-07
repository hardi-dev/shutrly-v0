# Intent: Landing page

Author: Owner (hardi-dev)
Source: IDEA
Status: DRAFT

## Problem
Shutrly has no public face. Anyone who opens the root URL sees the F-00 placeholder ("Fondasi siap. Fitur berikutnya: F-01 Auth."), which says nothing about the product. A photographer who hears about Shutrly can't learn what it does, why it differs from the tools they use now (Google Drive, WhatsApp, spreadsheets, Fastpik), or how to show interest. The Owner has no way to collect interested photographers before opening Shutrly to other studios (`docs/product/pricing-and-costs.md` › open questions).

## Proposed outcome
A visitor to the root URL quickly understands what Shutrly is and who it is for: an Indonesian photographer or small studio. The page makes two points. First, Shutrly runs the whole studio in one place per brand: services, clients, projects, team, galleries, invoices and WhatsApp messages. Second, its private Google Drive galleries let clients choose photos within clear limits and receive final files. An interested photographer can join a waitlist with their email in a few seconds, and the Owner can see who joined.

During the development phase the landing page is the only thing production serves. Every other route (sign-in, registration, the Owner app and client links) stays hidden there until the Owner opens it (Owner, 2026-10-07). Staging and local development keep every route.

## Affected users and systems
- Visitor: a prospective Owner (photographer or studio), not signed in, often on a phone.
- Owner: sees the waitlist entries. Where and how is an open question.
- Root route `/`: replaces the F-00 placeholder. It is already a public route.
- Every other route on production: hidden during the development phase, but still available on staging and in local development.
- Something that stores waitlist entries. Which store is a planning decision, not part of this intent.

## Constraints
- The copy is in Indonesian (id-ID), as assumed under GAP-05, and follows the approved design system (Studio Lime tokens, `docs/design-system/token-usage.md`).
- The page describes features in product terms that match the product overview and scope (C-001, C-002). It must not claim anything the MVP scope excludes, such as direct WhatsApp sending (C-106) or file uploads to Shutrly.
- The waitlist collects personal data from people who are not signed in. Input is validated, the endpoint is protected against abuse, and the data stays server-side (C-006).
- The waitlist form and the page handle their loading, validation, error and success states (C-007) and are accessible (C-008).
- Hosting cost stays within the free-tier budget (ADR-018). The page is mostly static, and the waitlist must not add a paid dependency.
- The waitlist asks for an email address only (Owner, 2026-10-07).
- Hiding the other routes on production is temporary and doesn't change the MVP scope. Registration is still in scope (`docs/product/scope.md`); it just isn't served on production yet.
- No pricing on the page while `docs/product/pricing-and-costs.md` is still a draft (Owner, 2026-10-07).

## Out of scope
- Pricing, plans and payment.
- Comparison with named competitors.
- Opening registration or the Owner app on production, or changing the auth flow. When to open them is a later Owner decision.
- Waitlist fields other than email.
- Emails to people on the waitlist: confirmations, campaigns or invitations.
- An admin product for managing the waitlist beyond what the Owner needs to see entries.
- Blog, documentation, testimonials, custom domains and analytics. Analytics is listed so it gets an explicit decision later.
- English copy.

## Open questions
Answered by the Owner on 2026-10-07:
- **Features that aren't built yet:** the page presents the full MVP as available. It can go live now, because production serves only the landing page during development and visitors can't reach the app anyway.
- **Registration versus waitlist** (was a SPEC GAP): every route except the landing page is hidden on production during development, `/register` included. This is a release gate, not a scope change.
- **Waitlist fields:** email only.
- **Consent and privacy:** the usual terms (Owner asked for a standard choice). The form has no checkbox. A short note under the button says that joining means Shutrly may email the person about the launch, and only that: the email isn't shared or used for anything else, and the person can ask to be removed at any time. Entries are kept until the waitlist is closed or the person asks to be removed. Entries never invited are deleted no later than 12 months after they joined. This follows the usual purpose, consent and deletion-on-request rules of Indonesia's data protection law (UU PDP, UU 27/2022), without legal review.
- **Owner view:** a database query or an export script is enough for now, with no page in the app.
- **Brand assets:** the logo, illustrations and screenshots are designed in the design phase (`/sdv:design-feature`).

Still open (carry into the spec):
- **Removal requests:** which contact address does the privacy note give for removal requests? A dedicated address may be needed (Resend sends from the platform domain, ADR-011).
- **Duplicates:** assumption (low risk, reversible): joining twice with the same email shows the same success message, stores no second entry, and doesn't reveal that the email was already on the list.
- **Sign-in link:** assumption (low risk, reversible): no *Masuk* link while production hides sign-in. Staging may show one later.
