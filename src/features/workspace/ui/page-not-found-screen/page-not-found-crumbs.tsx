"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

import { useOwnerNavTranslations } from "../owner-nav/owner-nav";
import { useOwnerWorkspace } from "../owner-workspace-context/owner-workspace-context";
import { PAGE_HEADER_COPY_NAMESPACE } from "./page-not-found-screen.copy";
import { pageNotFoundTrail } from "./page-not-found-trail";

/**
 * The breadcrumb of the page-not-found state (F-24 AC-SFX-014). Not-found files get no props, so it
 * reads the path with `usePathname()` and the verified workspace from the Owner shell.
 * @returns the trail, or nothing outside the Owner shell
 */
export function PageNotFoundCrumbs() {
  const pathname = usePathname();
  const workspace = useOwnerWorkspace();
  const navT = useOwnerNavTranslations();
  const crumbT = useTranslations(PAGE_HEADER_COPY_NAMESPACE);
  if (workspace === null) return null;
  const items = pageNotFoundTrail({
    pathname,
    workspaceId: workspace.workspaceId,
    workspaceName: workspace.workspaceName,
    t: navT,
  });
  return <PageHeaderTrail items={items} label={crumbT("breadcrumb")} />;
}
