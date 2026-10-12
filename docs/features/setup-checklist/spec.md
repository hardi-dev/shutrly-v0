# Feature: Setup checklist (F-25)

Status: SPECIFIED (2026-10-12) · Intent: [intent.md](intent.md) (ACCEPTED 2026-10-12) · Journeys: J-01 (*Dashboard*), J-02, J-03 · Builds on [F-24 `setup-flow-fixes`](../setup-flow-fixes/spec.md) (DONE)

## Goal
A new Owner sees on the dashboard what to set up before the first project and in what order, starting with the one blocker (a service). Each step leads to the screen that does it and shows as done once the data exists. The checklist is gone once the workspace has a project.

## User Story
As an Owner who has just created a workspace, I want the dashboard to tell me what I need before my first project, so I don't fill in settings that aren't needed and then find *New project* disabled.

## Preconditions
- The Owner is signed in and opens a workspace they own (BR-WS-003). The dashboard is `/w/{workspaceId}` (ADR-015).
- The checklist is shown only while the workspace has **no project** in any status (`DRAFT` … `COMPLETED`, `CANCELLED`). A deleted `DRAFT` no longer exists (BR-PRJ-010), so a workspace whose only projects were deleted drafts shows the checklist again.

## Inputs
None. The checklist has no stored state and no write of its own. It is derived on every dashboard load from workspace-scoped reads (BR-WS-002/003):

| Fact | Read |
|---|---|
| Has a project | at least one project in the workspace |
| Step 1 done | at least one **active** service (BR-CAT-008) — the same test *New project* uses to offer a service; the category's state doesn't matter |
| Step 2 done | at least one active service has a service item whose definition has `selectionRequired = true` (BR-CAT-002, BR-CAT-007, BR-SEL-001) |
| Step 4 done | the workspace's brand name is not empty (BR-WS-004) |
| Active services count | 0, 1 or more — decides step 2's link |

## Steps

| # | Step | Marker | Done when | Action | Locked |
|---|---|---|---|---|---|
| 1 | Add a service (its category can be created in the same dialog) | Required | step 1 fact | Opens *Services* with the *Add service* dialog open | never |
| 2 | Add package items the client picks from | Recommended | step 2 fact | Exactly one active service → that service's page; otherwise → *Services* | until step 1 is done |
| 3 | Create the first project (client and session are entered in *New project*) | — | never shown as done: once a project exists the checklist is gone | Opens *New project* | until step 1 is done |
| 4 | Set the brand name (clients see it; until then they see the workspace name) | Optional | step 4 fact | Opens *Settings* | never |

**Step states (design 2026-10-12, [design.md](design.md)):**
- **Current** — the first step, in the order 1 → 2 → 3 → 4, that is neither done nor locked. Exactly one step is current. It shows its action as the **only button** on the checklist (primary).
- **Open** — not done, not locked, not current. The whole row is a link that opens the step's action target; no button.
- **Done** — shown done (success icon and a *Done* marker in place of the step's own marker); no button and no link.
- **Locked** — steps 2 and 3 until step 1 is done: lock icon and the locked hint in place of the description; no button and no link.

Step 3 is never done while the checklist shows, so step 4 is never current: it is an open row link until done. Every step has one short description line (copy-deck §4.3a).

Steps rows 5–9 of the intent's table are not shown (intent › Recommended answers 2): templates already work in EN and ID, the Drive folder is per project, team is optional, invoices aren't built.

## Main Flow — first project from a new workspace
1. The Owner creates a workspace and lands on the dashboard (J-01). It shows the greeting and the checklist in place of the *Set up branding* empty state. Step 1 is not done; steps 2 and 3 are locked; step 4 is not done.
2. The Owner chooses step 1's button (the current step). *Services* opens with *Add service* open. They save a service (with a new or existing category), and the new service's page opens (F-05), where package items are added.
3. They add *Foto edit* to it there. Back on the dashboard, steps 1 and 2 show as done and step 3 is current.
4. Had they returned before adding items, step 2 would be current and its button opens the same service page (one active service); step 3 would be an open row link.
5. The Owner chooses step 3's button and creates the project in *New project* (client and session inside it, F-07).
6. On the next dashboard load the workspace has a project: the checklist is gone and the dashboard shows today's placeholder, *Set up branding* included. *(Superseded by F-26 [dashboard-overview](../dashboard-overview/spec.md), Owner 2026-10-13: after the first project the dashboard shows the overview, without* Set up branding*.)*

## Alternative Flows
- **A1 — Skip step 2.** Once step 1 is done, step 3 is an open row link while step 2 is current; choosing the row opens *New project*. Creating the project hides the checklist with step 2 not done.
- **A2 — Step 4 first or any time.** Step 4 is never locked; it is an open row link that opens *Settings*, and saving a brand name in *Settings* marks it done.
- **A3 — Several services.** With two or more active services, step 2's action opens *Services*. Step 2 is done as soon as any one of them has a selection item.
- **A4 — Data removed before the first project.** Every state is re-derived: archiving or deleting the only active service makes step 1 not done and locks steps 2–3 again; removing the last selection item from active services makes step 2 not done; clearing the brand name makes step 4 not done.
- **A5 — Existing workspace with projects.** It never shows the checklist.
- **A6 — New project without a service (outside the dashboard).** *New project* keeps its info alert *No active services yet*, now explaining that a project starts from a service in a category, and its action opens *Services* with *Add service* open (same target as step 1). The rest of *New project* is unchanged (BR-PRJ-008).

## Error Cases
- **E1 — Checklist reads fail.** The dashboard follows the app's existing server-error handling for owner pages; the checklist never shows a guessed state (no step shown done or locked on missing data).
- **E2 — Workspace the Owner can't open.** Unchanged: the existing not-found / unavailable handling of `enterWorkspace` (BR-WS-003).

## UI States (C-007)
- **Default:** the shell header (*Dashboard*) and the checklist only (no in-content greeting; Owner 2026-10-12, DV-1) (title, short description, progress, four steps), the card centered in the content area (desktop, also vertically).
- **Step states:** current (one button), open (row link), done, locked — see *Steps*.
- **Phone:** the current step's button sits under its description, sized to its label and aligned with the text.
- **Loading:** the dashboard is server-rendered; no client loading state beyond the existing route loading UI.
- **After the first project:** today's placeholder (greeting, *Set up branding* empty state), unchanged. *(Superseded by F-26 [dashboard-overview](../dashboard-overview/spec.md), Owner 2026-10-13: after the first project the dashboard shows the overview, without* Set up branding*.)*
- Done and locked are conveyed by text or accessible name as well as visuals (C-008, WCAG 2.1 AA); locked and done steps are not focusable; an open row is one link whose accessible name is the step title.
- Layout and device variants: [design.md](design.md).

## Business Rules
- BR-CAT-011 — nothing is seeded or created for the Owner; the checklist only reads.
- BR-CAT-008 — only active services count.
- BR-CAT-002, BR-CAT-007, BR-SEL-001 — a selection item is a service item whose definition has `selectionRequired`; it is what gives the client something to pick, but a project may have none (step 2 is recommended, not required).
- BR-PRJ-008, BR-PRJ-001 — a project is created from an active service; client and session are entered in *New project*.
- BR-PRJ-010 — deleted drafts don't count as projects.
- BR-WS-002, BR-WS-003 — every read is scoped to the verified workspace.
- BR-WS-004 — brand name is optional and falls back to the workspace name.
- BR-L10N-001, BR-L10N-002 — all checklist copy and the changed alert exist in EN and ID; no mixed-language text.

## Constraints
- **ADR-018:** the dashboard adds only cheap existence/count reads (one round trip, no listing of services with their items). The existing *New project* service listing is not reused for this.
- **ADR-016 / architecture:** the checklist reads across features (projects, catalog, workspace); the reads are combined in `composition/`, read-only.
- **Copy:** new strings come from rows in [copy-deck.md](../bilingual-copy-revamp/copy-deck.md) §4.3a (includes the two §7.2 replacements), drafted with the Codex CLI and approved by the Owner on 2026-10-12.

## Assumptions (low-risk, reversible)
- ~~**A-1:** a done step keeps its action available.~~ Withdrawn by the design (2026-10-12): done steps have no button and no link.
- **A-2:** the checklist re-derives on each dashboard load; no live update while the dashboard stays open.
- **A-3:** step 4 counts any non-empty brand name, including one equal to the workspace name.
- **A-4:** the *Add service* deep link is a URL on *Services* that opens the dialog on load; closing the dialog leaves the Owner on *Services*. Its form is decided in the plan.

## Dependencies
- **F-24 `setup-flow-fixes` (DONE on `staging`, merged into this branch 2026-10-12).** The checklist sends Owners through the catalog screens it fixed: catalog dialogs submit on Enter (D3) and English catalog screens show English only (D6). D2 and D7 were withdrawn as not reproduced: saving *Add service* opens the new service's page, as F-05 specifies (F-05 step 4, AC-CAT-010). F-25 relies on that navigation to bridge step 1 to step 2.
- F-05 catalog (services, service items, definitions), F-07 projects (*New project*), F-02 workspace (dashboard, settings), F-22 copy deck.

## Out of Scope
- A full dashboard (project, schedule or invoice summaries) and any redesign of the dashboard after the first project.
- Creating data for the Owner: wizard, sample or demo data (BR-CAT-011).
- Dismissing, hiding or restoring the checklist by hand; storing any checklist state.
- Steps for templates, Drive folders, team, contact details, invoice prefix or billing (F-14).
- Guidance on *New project* beyond the no-service alert (no step-2 warning there).
- The F-24 defects.

## Open Questions / SPEC GAPS
Design changes (Owner, 2026-10-12, design wins on UX): one button per state on the current step, other open steps are row links, done steps show a success icon and *Done* with no action (A-1 withdrawn), one compact description per step. Recorded in *Steps*, AC-SETUP-001/006/012/014 and the new AC-SETUP-020.

None open. The intent's five questions are answered in [intent.md](intent.md) › Recommended answers; the three follow-ups (step order, step 1 target, step 2 target) were answered by the Owner on 2026-10-12 and are in *Steps* above.

## Flagged Concerns

| ID | Concern | Sources | Status / decision |
|---|---|---|---|
| FC-001 | The feature map describes F-25 as "replacing the placeholder dashboard's *Set up branding* prompt", but the accepted answer keeps that prompt after the first project. | feature-map F-25 row; intent › Recommended answers 3 | RESOLVED — Owner's accepted answer (2026-10-12) wins; feature-map row reworded to "replacing it while the workspace has no project". |
| FC-002 | BR-L10N-002 blocks release without both languages, and the copy deck rule says copy is never invented. The checklist and the reworded alert need new EN/ID rows. | BR-L10N-002; copy-deck › notes; HANDOFF › F-22 copy rules | RESOLVED — rows drafted with the Codex CLI, revised once, and approved by the Owner on 2026-10-12 (copy-deck §4.3a, EN description aligned to the ID). |
| FC-003 | ADR-018 forbids heavy dashboard queries, yet the existing "has an active service" check loads every service with its items. | ADR-018; `load-create-options` | RESOLVED — not a conflict: the spec requires dedicated existence reads (Constraints), so no decision needed. |

Checked with no concern: constitution C-001–C-012 and C-101 (read-only, workspace-scoped, no secrets), C-102 (no snapshot touched), BR-CAT-011 (no data created), ADR-015 (URL-scoped workspace), coding rules (no new dependency).
