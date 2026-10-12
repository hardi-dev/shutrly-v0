# Intent: Dashboard overview

Author: Owner (hardi-dev), 2026-10-12: "create new feature to fill the dashboard"
Source: IDEA
Status: DRAFT

## Problem
Once a workspace has its first project, the dashboard goes back to the F-02 placeholder: an empty-state card and the *Set up branding* prompt. F-25 replaced the placeholder only until the first project, and its intent left a full dashboard out of scope (the feature map says no feature owns it). So the page an Owner lands on every day shows nothing about their work.

What the Owner cannot see today without opening each list in turn:
- Which projects need them now: a booking waiting to be confirmed, a shoot coming up, a client selection waiting for review, edits still to deliver.
- What is coming up: sessions in the next days.
- What is about to expire: published galleries with an `expiresAt` close (BR-GAL-005).
- How the workspace is doing at a glance: how many projects sit in each status (BR-PRJ-004).

Evidence: the feature map calls the dashboard "a placeholder, not a verified project/invoice summary" and the product-copy gate forbids claiming a summary until it exists. The data is already stored by F-05 to F-10; nothing reads it for the dashboard.

## Proposed outcome
- An Owner who opens the workspace sees, on one screen, what needs their attention and what is coming next, then can open the project or list behind each item in one step.
- The numbers are read from stored data on each visit, never typed in, and only for this workspace.
- A workspace with projects but nothing urgent still shows something useful (status counts, a calm "nothing needs you" message), not an empty page.
- The first version uses only features that exist (projects, sessions, selection, galleries, delivery). It does not wait for invoices.

## Affected users and systems
- Owner, every visit after the first project (J-01, J-03 to J-06).
- Dashboard route and `dashboard-screen` (F-02 `workspace`); F-25's `loadDashboard` already decides between checklist and placeholder, so this replaces the placeholder branch.
- Read-only use of projects and sessions (F-07, F-08), selection (F-10), galleries (F-09) and delivery (F-10).

## Constraints
- Workspace-scoped reads only (BR-WS-002, BR-WS-003). A summary must never count another workspace's rows.
- Free-tier runtime budget (ADR-018): a few cheap queries per visit, no heavy aggregation; the F-25 reader (one statement, scalar subqueries) is the pattern.
- No new stored data in the first version if avoidable. A new table or column needs its own decision.
- Copy in EN and ID (BR-L10N-001/002); new text is drafted with Codex and approved by the Owner, with rows in the copy deck.
- Must not claim invoice, payment or revenue figures: F-14 is not built (product-copy gate).
- Read-only: the dashboard shows and links; it does not change a project's status (BR-PRJ-004, BR-PRJ-005).
- F-25's checklist stays as it is before the first project.

## Out of scope
- Invoice, payment, revenue or balance figures (wait for F-14).
- Charts, trends over time, exports, analytics, or per-team-member views.
- Notifications, emails or WhatsApp reminders (F-15).
- Editing anything from the dashboard.
- Client-facing screens.

## Open questions
- Which summaries go in the first version? Recommended: (1) *Needs you* (projects in `DRAFT`, selections waiting for review, deliveries to publish), (2) *Upcoming sessions* (next 7 days), (3) *Projects by status*, (4) *Galleries expiring soon*.
- Is "needs attention" defined by status only, or also by dates (e.g. a `BOOKED` project whose shoot date has passed)? This needs a rule if dates count.
- How far ahead is "upcoming" and "expiring soon" (7 days? 14?), and is it fixed or Owner-configurable? Recommended: fixed 7 days.
- Should the page wait for F-14 so invoices are included, or ship now and add a card later? Recommended: ship now.
- Does *Set up branding* stay as a card, or is it dropped now that F-25 handles setup?
- Does it need a stored "last viewed" or activity feed? Recommended: no, out of the first version.
- Date handling: sessions and expiry in which time zone (workspace or browser)? Check BR-WS and the sessions rules in discovery.
