import { isOwnerSection } from "@/features/workspace/ui/owner-trail/owner-trail";

import type { PageNotFoundBackTarget } from "./page-not-found-screen.types";

/**
 * The way back from a missing page under `/w/{workspaceId}`: its parent section when the path has
 * one below a known section, otherwise the dashboard. Built from the pathname only, never from a
 * loaded record (F-24 D-5, C-101).
 * @param pathname - the current pathname
 * @returns the back target
 */
export function pageNotFoundBackTarget(pathname: string): PageNotFoundBackTarget {
  const segments = pathname.split("/").filter(Boolean);
  const workspaceId = segments.at(1);
  if (segments.at(0) !== "w" || workspaceId === undefined) {
    return { kind: "dashboard", href: "/workspace" };
  }
  const section = segments.at(2);
  const dashboard = { kind: "dashboard", href: `/w/${workspaceId}` } as const;
  if (section === undefined || segments.length < 4 || !isOwnerSection(section)) return dashboard;
  return { kind: "section", section, href: `/w/${workspaceId}/${section}` };
}
