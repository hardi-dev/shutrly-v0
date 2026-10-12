# Intent: Setup checklist before the first project

Author: Owner (hardi-dev), from an agent walkthrough on 2026-10-12
Source: FEEDBACK
Status: DRAFT

## Problem
A new workspace opens on an empty dashboard whose only call to action is *Set up branding* (Settings: brand name, contact details, invoice prefix). None of that is needed to create a project. What actually blocks the first project is a **service**, which needs a **category**. Neither is seeded (BR-CAT-011), and nothing on the dashboard says so. A new Owner who follows the dashboard fills in Settings, opens *New project*, and hits "No active services yet" with *Create project* disabled.

Evidence (walkthrough on `localhost:3000`, workspace *Explore Studio*, 2026-10-12):
- Fresh workspace: dashboard shows "Set up this workspace's brand details" only; *New project* shows *No active services yet* and the create button is disabled.
- After a category and a service were created, *New project* listed *Wedding Basic* and was usable.
- Some setup is already done when the workspace is created: four package items (BR-CAT-011), three team roles (BR-TEAM-005), the *Google Drive* source (BR-SRC-005), five message templates (BR-MSG-005), workspace name, invoice prefix and IDR (BR-WS-004/005). The Owner can't tell what's done and what's left.
- The feature map calls the dashboard "a placeholder"; no feature owns replacing it.

## What must be set up, by urgency
Observed in the walkthrough and checked against the rules. This order is the input for the checklist; the spec decides which steps it shows.

| # | Setup | Urgency | Why | State in a new workspace |
|---|---|---|---|---|
| 1 | **Service**, in a **category** (*Services*; *Add service* can create the category inline) | **Blocker**: no project without one (BR-PRJ-008) | The project copies the service as its deal (BR-PRJ-001) | None (BR-CAT-011) |
| 2 | **Package items on that service** that clients pick from (e.g. *Edited photos 50*) | **High**: the core product promise | Selection limits come only from selection items (BR-SEL-001); a service without them gives the client nothing to pick | 4 package items to choose from, none on any service |
| 3 | **Client** | **Required per project**, but can be added inside *New project* | A project belongs to an active client (BR-PRJ-008) | None |
| 4 | **Session** (date, optional time and place) | **Required to book**, entered in *New project* | `BOOKED` needs one session (BR-PRJ-004, BR-TEAM-003); a draft doesn't | n/a (per project) |
| 5 | **Brand name** (Settings) | **Before the first client message** | Clients see `brandName`; it falls back to the workspace name (BR-WS-004) | Falls back to the workspace name |
| 6 | **Message templates** wording | **Before the first gallery share** | Defaults work but are generic and English-only (BR-MSG-005; Indonesian is F-22) | 5 seeded |
| 7 | **Google Drive folder** per project (guide on *Photo sources*) | **Before the first gallery**, after the shoot | A gallery needs an accessible folder to publish (BR-GAL-004) | Source *Google Drive* seeded and active |
| 8 | **Team members** | **Optional** | Only to record who works which session (BR-TEAM-006) | 3 roles, no members |
| 9 | **Contact details, invoice prefix** (Settings) | **Later**: only when invoices exist (F-14 not built) | Used on invoices (BR-WS-004/005) | Prefix suggested from the name |

## Proposed outcome
- A new Owner sees, on opening the workspace, what to set up before the first project and in what order, starting with the blocker.
- Each step leads straight to the screen that does it, and shows as done once the data exists. It's never ticked by hand.
- The Owner can create the first project as soon as the blocker is done, without first filling in optional settings.
- Once the workspace is in use, the checklist is out of the way.

## Affected users and systems
- New Owner, first session after creating a workspace (J-01 → J-03).
- Dashboard (F-02 `workspace`, today a placeholder) and possibly *New project* (F-07 `projects`).
- Read-only use of catalog (F-05), clients (F-06), team (F-08), templates (F-03), sources (F-04), settings (F-02) data.

## Constraints
- Must not create catalog data for the Owner: BR-CAT-011 says no categories or services are seeded.
- Workspace-scoped reads only (BR-WS-002, BR-WS-003).
- Copy in EN and ID (BR-L10N-001/002), following F-22's copy rules.
- Depends on [F-24 `setup-flow-fixes`](../setup-flow-fixes/intent.md): the checklist sends Owners through the screens with those defects, so F-24 ships first (Owner, 2026-10-12).
- Runs within the free-tier runtime budget (ADR-018): no heavy dashboard queries.

## Out of scope
- A full dashboard with project, schedule or invoice summaries.
- A guided wizard that creates data on the Owner's behalf, or sample/demo data.
- Billing setup (F-14) beyond noting it's for later.
- The *Kirim konfirmasi booking* template (feature map, planned and unscheduled).

## Open questions
- When does the checklist disappear: after the first project, after every step is done, or when the Owner dismisses it? Can it be brought back?
- Which steps does it show? Only 1–3 (needed to book), or also 5–8 as "before your first gallery"?
- Does the dashboard keep *Set up branding* as its own card, or does that become a checklist step?
- Should *New project* show the same guidance when a step is missing (today it shows only *No active services yet*)?
- Is "done" for step 2 "the service has a selection item", or just "has any package item"?
