import type { BreadcrumbItem } from "@/ui/patterns/page-header/page-header.types";

import type { OwnerNavTranslator } from "../owner-nav/owner-nav.types";
import type { OwnerSection, OwnerTrailInput } from "./owner-trail.types";

type OwnerNavKey = Parameters<OwnerNavTranslator>[0];

const SECTION_KEYS: Readonly<Record<OwnerSection, OwnerNavKey>> = {
  projects: "projects",
  clients: "clients",
  team: "team",
  services: "services",
  "message-templates": "messageTemplates",
  "photo-sources": "photoSources",
  settings: "settings",
  invoices: "invoices",
  search: "search",
  notifications: "notifications",
};

const SUB_PAGE_KEYS = new Map<string, OwnerNavKey>([
  ["projects/completed", "projectTabCompleted"],
  ["projects/cancelled", "projectTabCancelled"],
  ["projects/new", "create"],
  ["clients/archived", "clientTabArchived"],
  ["team/archived", "teamTabArchived"],
  ["team/roles", "teamTabRoles"],
  ["services/categories", "serviceTabCategories"],
  ["services/items", "serviceTabItems"],
]);

/** Builds an Owner breadcrumb: the workspace root, the ancestors, then the current page as plain text (F-23 R-1, R-2, R-5). @param input - workspace, ancestors and the current label @returns the crumbs */
export function ownerTrail(input: OwnerTrailInput): readonly BreadcrumbItem[] {
  return [
    { label: input.workspaceName, href: `/w/${input.workspaceId}` },
    ...input.ancestors,
    { label: input.current },
  ];
}

/** The Dashboard is the Owner root, so its trail is the single crumb *Dasbor* (F-23 R-2). @param t - the owner-nav translate function @returns the crumbs */
export function dashboardTrail(t: OwnerNavTranslator): readonly BreadcrumbItem[] {
  return [{ label: t("dashboard") }];
}

/** A linked crumb for a workspace section, e.g. *Proyek*. @param workspaceId - the verified route workspace @param section - the section segment @param t - the owner-nav translate function @returns the crumb */
export function sectionCrumb(
  workspaceId: string,
  section: OwnerSection,
  t: OwnerNavTranslator,
): BreadcrumbItem {
  return { label: sectionLabel(section, t), href: `/w/${workspaceId}/${section}` };
}

/** The translated name of a workspace section, e.g. *Proyek* (F-24 page-not-found back link). @param section - the section segment @param t - the owner-nav translate function @returns the name */
export function sectionLabel(section: OwnerSection, t: OwnerNavTranslator): string {
  return t(SECTION_KEYS[section]);
}

/** A linked crumb for a project's detail page. @param workspaceId - the route workspace @param projectId - the project id @param title - the project title @returns the crumb */
export function projectCrumb(
  workspaceId: string,
  projectId: string,
  title: string,
): BreadcrumbItem {
  return { label: title, href: `/w/${workspaceId}/projects/${projectId}` };
}

/** True for a path segment that names a workspace section (F-24 page-not-found back link). @param value - a path segment @returns whether it is an Owner section */
export function isOwnerSection(value: string): value is OwnerSection {
  return Object.hasOwn(SECTION_KEYS, value);
}

/** The trail of a route whose labels are fixed: a section, a section tab, or *Proyek baru* (F-23 R-4). @param segments - the path below `/w/[id]` @param workspaceId - the verified route workspace @param workspaceName - its name @param t - the owner-nav translate function @returns the crumbs, or null for an unknown path */
export function staticOwnerTrail(
  segments: readonly string[],
  workspaceId: string,
  workspaceName: string,
  t: OwnerNavTranslator,
): readonly BreadcrumbItem[] | null {
  if (segments.length === 0 || segments.length > 2) return null;
  const section = segments.at(0);
  const sub = segments.at(1);
  if (section === undefined || !isOwnerSection(section)) return null;
  if (sub === undefined) {
    const current = t(SECTION_KEYS[section]);
    return ownerTrail({ workspaceId, workspaceName, ancestors: [], current });
  }
  const subKey = SUB_PAGE_KEYS.get(`${section}/${sub}`);
  if (subKey === undefined) return null;
  const ancestors = [sectionCrumb(workspaceId, section, t)];
  return ownerTrail({ workspaceId, workspaceName, ancestors, current: t(subKey) });
}
