# Acceptance Criteria — Setup checklist (F-25)

IDs are stable and never reused. Assumption references (A-n) point to [spec.md](spec.md#assumptions-low-risk-reversible). Wording in *italics* is a placeholder for the approved copy-deck rows (§4.3a); tests read copy from the catalogue, not literals. Layout follows the approved Pencil frames (`/sdv:design-feature`).

## Visibility

## AC-SETUP-001 — New workspace shows the checklist
Covers: BR-CAT-011, BR-WS-003

**Given** an Owner who has just created the workspace *Explore Studio* (no categories, services, clients or projects; the four seeded package items, five templates and the *Google Drive* source exist)
**When** the dashboard opens
**Then**:
- the shell header stays *Dashboard* / *Your workspace: Explore Studio.*, and the content area shows only the checklist (no in-content greeting) with four steps in order: add a service, add package items, create the first project, set the brand name *(reworded by the Owner 2026-10-12, verification DV-1: the exports' header title was a frame artifact)*;
- step 1 is marked *Required*, step 2 *Recommended*, step 4 *Optional*;
- no step is done; step 1 is current and shows the only button, *Add service*; steps 2 and 3 are locked (no button, no link); step 4 is an open row link with no button;
- the *Set up branding* empty state is not shown;
- no category, service or other record was created by opening the dashboard.

## AC-SETUP-002 — Any project hides the checklist
Covers: BR-PRJ-004, BR-PRJ-008

**Given** a workspace with exactly one project, in turn `DRAFT`, `BOOKED`, `COMPLETED` and `CANCELLED`
**When** the Owner opens the dashboard
**Then** no checklist is shown, and the dashboard shows the existing placeholder with *Set up branding*, unchanged.

## AC-SETUP-003 — Deleting the only draft brings it back
Covers: BR-PRJ-010

**Given** a workspace whose only project is a `DRAFT`, with one active service
**When** the Owner deletes the draft and opens the dashboard
**Then** the checklist is shown again, with step 1 done.

## AC-SETUP-004 — Workspace isolation
Covers: BR-WS-002, BR-WS-003, C-101

**Given** an Owner with workspace A (no services, no projects) and workspace B (an active service with *Foto edit*, a brand name, no projects)
**When** they open A's dashboard, then B's
**Then** A shows steps 1, 2 and 4 not done; B shows steps 1, 2 and 4 done. Nothing from one workspace changes the other's checklist.

## Step 1 — service

## AC-SETUP-005 — Step 1 opens Add service
Covers: BR-PRJ-008 (A-4)

**Given** the dashboard of AC-SETUP-001
**When** the Owner chooses step 1's action
**Then** *Services* opens with the *Add service* dialog already open; closing the dialog leaves them on *Services*; saving a service opens its page (F-05 AC-CAT-010).

## AC-SETUP-006 — An active service completes step 1 and unlocks steps 2–3
Covers: BR-CAT-008, BR-PRJ-008

**Given** a workspace with no project
**When** it has one active service *Wedding Basic* (category *Wedding*) and the Owner opens the dashboard
**Then** step 1 shows done with no button; step 2 is current and shows the only button, *Add package items*; step 3 is an open row link.

## AC-SETUP-007 — Archived services don't count
Covers: BR-CAT-008

**Given** a workspace with no project whose only service is archived
**When** the Owner opens the dashboard
**Then** step 1 is not done and steps 2 and 3 are locked. After unarchiving the service, step 1 shows done.

## Step 2 — package items the client picks from

## AC-SETUP-008 — Only a selection item completes step 2
Covers: BR-CAT-002, BR-CAT-007, BR-SEL-001

**Given** a workspace with no project and one active service
**When** the service has only *Durasi pemotretan* and *Jumlah orang*, and the Owner opens the dashboard
**Then** step 2 is not done.
**When** *Foto edit* (selection item) is added to the service and the dashboard is opened again
**Then** step 2 shows done.

## AC-SETUP-009 — A selection item on an archived service doesn't count
Covers: BR-CAT-008

**Given** a workspace with no project, an archived service with *Foto edit*, and an active service with no selection item
**When** the Owner opens the dashboard
**Then** step 2 is not done.

## AC-SETUP-010 — Step 2 link with one service
Covers: BR-CAT-005

**Given** a workspace with no project and exactly one active service *Wedding Basic*
**When** the Owner chooses step 2's action
**Then** the page of *Wedding Basic* opens.

## AC-SETUP-011 — Step 2 link with several services
**Given** a workspace with no project and two active services
**When** the Owner chooses step 2's action
**Then** *Services* opens (no dialog open).

## Step 3 — first project

## AC-SETUP-012 — Step 3 opens New project, whatever step 2's state
Covers: BR-PRJ-008, BR-SEL-001

**Given** a workspace with no project and one active service without a selection item
**When** the Owner chooses the step 3 row (an open row link while step 2 is current)
**Then** *New project* opens with the service available, and creating a project there succeeds (F-07). On the next dashboard load the checklist is gone.

## AC-SETUP-013 — Locked steps can't be used
Covers: C-008

**Given** the dashboard of AC-SETUP-001
**When** the Owner tabs through the checklist or clicks steps 2 and 3
**Then** steps 2 and 3 navigate nowhere, aren't focusable links, and show the *add a service first* hint; a screen reader announces them as unavailable.

## Step 4 — brand name

## AC-SETUP-014 — Step 4 follows the brand name
Covers: BR-WS-004 (A-3)

**Given** a workspace with no project and an empty brand name
**When** the Owner opens the dashboard
**Then** step 4 is not done, is an open row link even though step 1 isn't done, and its description names the workspace name clients see until then.
**When** they choose the step 4 row, save the brand name *Explore Photo* in *Settings*, and return to the dashboard
**Then** step 4 shows done. Clearing the brand name makes it not done again.

## Re-derivation

## AC-SETUP-015 — Removing data reverts steps
Covers: BR-CAT-008 (A-2)

**Given** a workspace with no project, steps 1, 2 and 4 done, and one active service
**When** the Owner archives that service and reopens the dashboard
**Then** steps 1 and 2 are not done and steps 2 and 3 are locked; step 4 stays done.

## New project

## AC-SETUP-016 — No-service alert explains and links to Add service
Covers: BR-PRJ-008, BR-CAT-011

**Given** a workspace with no active service
**When** the Owner opens *New project*
**Then** the info alert keeps the title *No active services yet*; its body says a project starts from a service and a service sits in a category that can be created in the same step; its action opens *Services* with *Add service* open; *Create project* stays disabled as today.

## Language and accessibility

## AC-SETUP-017 — Complete EN and ID
Covers: BR-L10N-001, BR-L10N-002

**Given** the dashboard of AC-SETUP-001, and *New project* of AC-SETUP-016
**When** the Owner views them in English, then in Indonesian
**Then** every checklist string, marker, hint, progress text, accessible name and the alert are in the active language only, taken from the approved copy-deck rows; the workspace name is shown as written.

## AC-SETUP-018 — Done and locked are not conveyed by colour alone
Covers: C-008

**Given** a checklist with one step done, two locked and one not done
**When** it is read by a screen reader or viewed in greyscale
**Then** each step's state (done, locked, not done) is available as text or an accessible name.

## Performance

## AC-SETUP-019 — Cheap dashboard reads
Covers: ADR-018

**Given** a workspace with no project
**When** the dashboard loads
**Then** the checklist facts come from existence/count reads in one database round trip, without loading services with their items or any row lists.

## One button per state

## AC-SETUP-020 — Only the current step has a button
Covers: design 2026-10-12 ([design.md](design.md))

**Given** a workspace with no project, in turn: nothing done; step 1 done; steps 1, 2 and 4 done
**When** the Owner opens the dashboard
**Then** exactly one button is shown on the checklist, on the first step in order 1 → 2 → 3 → 4 that is neither done nor locked (*Add service*, then *Add package items*, then *New project*); it is a primary button;
- every other step that is neither done nor locked is a single row link with a chevron that opens its target;
- done steps show the success icon and a *Done* marker, with no button and no link;
- on a phone the button sits under the step's description, sized to its label.

