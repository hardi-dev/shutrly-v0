import type { BreadcrumbItem } from "@/ui/patterns/page-header/page-header.types";

import type { OwnerNavTranslator } from "../owner-nav/owner-nav.types";
import { isOwnerSection, sectionCrumb } from "../owner-trail/owner-trail";

export interface PageNotFoundTrailInput {
  readonly pathname: string;
  readonly workspaceId: string;
  readonly workspaceName: string;
  readonly t: OwnerNavTranslator;
}

/**
 * The breadcrumb of a missing page under `/w/{workspaceId}`: the workspace, then the section when the
 * path names a known one. Built from the verified workspace and the URL's section segment only, never
 * from the missing record, so the trail can't name it (F-24 AC-SFX-014, C-101).
 * @param input - the pathname, the verified workspace and the owner-nav translator
 * @returns the crumbs
 */
export function pageNotFoundTrail(input: PageNotFoundTrailInput): readonly BreadcrumbItem[] {
  const workspaceCrumb = { label: input.workspaceName, href: `/w/${input.workspaceId}` };
  const section = input.pathname.split("/").filter(Boolean).at(2);
  if (section === undefined || !isOwnerSection(section)) return [workspaceCrumb];
  return [workspaceCrumb, sectionCrumb(input.workspaceId, section, input.t)];
}
