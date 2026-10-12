# Acceptance Criteria — Landing page (F-19)

> Localization amendment (Owner request 2026-10-10): The public landing page is bilingual in English and Bahasa Indonesia, uses the same language-switch behavior as the workspace, and has no cross-language fallback. This supersedes the English-only wording below. See [localization policy](../../product/localization.md) and [bilingual copy deck §19](../bilingual-copy-revamp/copy-deck.md#19-public-landing-page--).

Assumption references (A-n) point to [spec.md](spec.md#assumptions-low-risk-reversible--confirm-or-change-anytime). No `BR-*` covers this feature, so each criterion lists the constitution principles, ADRs and assumptions it covers. Since [ADR-022](../../architecture/decisions/ADR-022-waitlist-in-resend-contacts.md), "the waitlist" means the environment's Resend waitlist audience; tests use a fake `WaitlistStore`.

## Page

## AC-LND-001 — The landing page explains Shutrly
Covers: C-001, C-002, C-106

**Given** an anonymous visitor
**When** they open `/`
**Then** the page loads with no redirect and no sign-in. It shows, in English, what spec › *Page content* lists: the hero with the rotating headline, the description and the waitlist form, the product mockup and the footer. The page shows no price, names no competitor, and doesn't claim direct WhatsApp sending, photo upload or storage in Shutrly, client accounts, a payment gateway or providers other than Google Drive.

## AC-LND-002 — Phone and desktop
Covers: C-008

**Given** the landing page
**When** it is viewed at phone width (375 px) and at desktop width (1440 px)
**Then** it matches the approved Pencil frames for that device. Nothing scrolls sideways, and the waitlist form is usable without zooming.

## AC-LND-003 — Accessible page and form
Covers: C-008

**Given** the landing page
**When** a visitor uses only the keyboard, and an automated accessibility check (axe) runs on the page in each form state
**Then** every link and control can be reached in a logical order with a visible focus ring. The email field has a label, and the error and success messages are announced. The bot field (A-4) is never focused or announced. Axe reports no violations.

## AC-LND-004 — Search and share metadata
Covers: A-6

**Given** the landing page on production
**When** a crawler or a chat app reads it
**Then** it finds an English title, a description and a share preview with the designed image. `robots.txt` lets `/` be indexed and disallows everything else.

## Waitlist

## AC-LND-005 — Join the waitlist
Covers: C-006, C-007

**Given** a visitor on the landing page and an empty waitlist
**When** they type ` Rina@Example.com ` and submit
**Then** the button shows a submitting state and can't be pressed again. The form is then replaced by the success message. The waitlist holds one contact, `rina@example.com`, with the time it joined.

## AC-LND-006 — Invalid email
Covers: C-006, C-007

**Given** a visitor on the landing page
**When** they submit an empty field, then `rina@`, then an address longer than 254 characters
**Then** each time an inline error under the field says what to fix, the typed value stays, focus moves to the field, and nothing is stored.

## AC-LND-007 — Joining twice
Covers: C-006, A-1

**Given** `rina@example.com` is already on the waitlist
**When** a visitor submits `RINA@example.com`
**Then** they see the same success message as a first sign-up, the waitlist still holds exactly one contact for that email, and its join time is unchanged. The response doesn't differ in a way that reveals the email was already there.

## AC-LND-008 — Too many attempts
Covers: C-006, A-2, ADR-022

**Given** 5 submissions from one IP address in the last 3 minutes
**When** a sixth arrives from that address
**Then** the visitor is asked to try again in a moment, and nothing is stored.

## AC-LND-009 — Bot field filled
Covers: C-006, A-4

**Given** a submission with the hidden bot field filled
**When** it reaches the server
**Then** the response is the normal success message, and nothing is stored.

## AC-LND-010 — Server failure
Covers: C-007

**Given** Resend is unreachable or answers with an error
**When** a visitor submits a valid email
**Then** a message under the form says it didn't work and to try again, the email stays in the field, and nothing is stored. Submitting again once Resend is back stores exactly one contact.

## AC-LND-011 — Privacy note
Covers: C-006

**Given** the landing page
**When** a visitor looks at the waitlist form
**Then** a note under the submit button says the email is used only to tell them about the launch, is kept with our email provider and not shared otherwise, and can be removed on request through the contact shown. There is no consent checkbox.

## AC-LND-012 — The email stays private
Covers: C-006

**Given** a visitor submits an email, successfully or not
**When** the server handles the request
**Then** the email doesn't appear in server logs or error reports, the response contains no email or entry data, and the response is not cacheable (`Cache-Control: private, no-store`).

## Production gate

## AC-LND-013 — Production serves only the landing page
Covers: ADR-021, C-010, A-5

**Given** a production build with `APP_STAGE=production`
**When** a visitor requests `/login`, `/register`, `/w/<any id>`, `/onboarding/workspace`, `/api/health`, `/api/auth/get-session` or any unknown path, signed in or not
**Then** each answers 404 with the not-found page in English, and there's no redirect. `/`, its static assets and the waitlist submission work as in AC-LND-001 and AC-LND-005.

## AC-LND-014 — Staging and development serve everything
Covers: ADR-021

**Given** a build with `APP_STAGE` other than `production` (staging, development)
**When** a visitor requests `/login`, or a signed-in Owner opens `/`
**Then** `/login` works as before, and `/` shows the landing page with no redirect.

## Owner tasks in Resend

These are done in the Resend dashboard (ADR-022), not by Shutrly code. They are checked by hand once before ship.

## AC-LND-015 — List and export entries
Covers: intent (Owner view), ADR-022

**Given** a waitlist with 3 contacts
**When** the Owner opens the environment's waitlist audience in Resend
**Then** they can see and export every contact (email, joined at) as a file a spreadsheet opens.

## AC-LND-016 — Remove one entry on request
Covers: C-006, intent (privacy), ADR-022

**Given** `rina@example.com` is on the waitlist
**When** the Owner deletes that contact in Resend
**Then** it no longer appears in the audience, and a later sign-up with the same email adds it again as new.

## AC-LND-017 — Delete entries after 12 months
Covers: C-006, A-3, ADR-022

**Given** contacts that joined 13 months ago and 11 months ago
**When** the Owner does the retention clean-up in Resend
**Then** only the 13-month-old contact is deleted.

## AC-LND-018 — Missing Resend configuration
Covers: C-007, ADR-022

**Given** no waitlist API key or audience ID for the environment, or an invalid one
**When** a visitor submits a valid email
**Then** they see the server-failure message from AC-LND-010, nothing is stored, and the server logs the configuration error without the email.
