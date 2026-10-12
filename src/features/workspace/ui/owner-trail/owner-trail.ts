import type { BreadcrumbItem } from "@/ui/patterns/page-header/page-header.types";

import { OWNER_NAV_COPY } from "../owner-nav/owner-nav.copy";
import type { OwnerSection, OwnerTrailInput } from "./owner-trail.types";

const SECTION_LABELS = new Map<string, string>([
  ["projects", OWNER_NAV_COPY.projects],
  ["clients", OWNER_NAV_COPY.clients],
  ["team", OWNER_NAV_COPY.team],
  ["services", OWNER_NAV_COPY.services],
  ["message-templates", OWNER_NAV_COPY.messageTemplates],
  ["photo-sources", OWNER_NAV_COPY.photoSources],
  ["settings", OWNER_NAV_COPY.settings],
  ["invoices", OWNER_NAV_COPY.invoices],
  ["search", OWNER_NAV_COPY.search],
  ["notifications", OWNER_NAV_COPY.notifications],
]);

const SUB_PAGE_LABELS = new Map<string, string>([
  ["projects/completed", OWNER_NAV_COPY.projectTabs.completed],
  ["projects/cancelled", OWNER_NAV_COPY.projectTabs.cancelled],
  ["projects/new", OWNER_NAV_COPY.create],
  ["clients/archived", OWNER_NAV_COPY.clientTabs.archived],
  ["team/archived", OWNER_NAV_COPY.teamTabs.archived],
  ["team/roles", OWNER_NAV_COPY.teamTabs.roles],
  ["services/categories", OWNER_NAV_COPY.serviceTabs.categories],
  ["services/items", OWNER_NAV_COPY.serviceTabs.items],
]);

/** Builds an Owner breadcrumb: the workspace root, the ancestors, then the current page as plain text (F-22 R-1, R-2, R-5). @param input - workspace, ancestors and the current label @returns the crumbs */
export function ownerTrail(input: OwnerTrailInput): readonly BreadcrumbItem[] {
  return [
    { label: input.workspaceName, href: `/w/${input.workspaceId}` },
    ...input.ancestors,
    { label: input.current },
  ];
}

/** The Dashboard is the Owner root, so its trail is the single crumb *Dasbor* (F-22 R-2). @returns the crumbs */
export function dashboardTrail(): readonly BreadcrumbItem[] {
  return [{ label: OWNER_NAV_COPY.dashboard }];
}

/** A linked crumb for a workspace section, e.g. *Proyek*. @param workspaceId - the verified route workspace @param section - the section segment @returns the crumb */
export function sectionCrumb(workspaceId: string, section: OwnerSection): BreadcrumbItem {
  return { label: SECTION_LABELS.get(section) ?? section, href: `/w/${workspaceId}/${section}` };
}

/** A linked crumb for a project's detail page. @param workspaceId - the route workspace @param projectId - the project id @param title - the project title @returns the crumb */
export function projectCrumb(
  workspaceId: string,
  projectId: string,
  title: string,
): BreadcrumbItem {
  return { label: title, href: `/w/${workspaceId}/projects/${projectId}` };
}

function isOwnerSection(value: string): value is OwnerSection {
  return SECTION_LABELS.has(value);
}

/** The trail of a route whose labels are fixed: a section, a section tab, or *Proyek baru* (F-22 R-4). @param segments - the path below `/w/[id]` @param workspaceId - the verified route workspace @param workspaceName - its name @returns the crumbs, or null for an unknown path */
export function staticOwnerTrail(
  segments: readonly string[],
  workspaceId: string,
  workspaceName: string,
): readonly BreadcrumbItem[] | null {
  if (segments.length === 0 || segments.length > 2) return null;
  const section = segments.at(0);
  const sub = segments.at(1);
  if (section === undefined || !isOwnerSection(section)) return null;
  if (sub === undefined) {
    const current = SECTION_LABELS.get(section) ?? section;
    return ownerTrail({ workspaceId, workspaceName, ancestors: [], current });
  }
  const current = SUB_PAGE_LABELS.get(`${section}/${sub}`);
  if (current === undefined) return null;
  const ancestors = [sectionCrumb(workspaceId, section)];
  return ownerTrail({ workspaceId, workspaceName, ancestors, current });
}
