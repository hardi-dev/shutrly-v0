import { getTranslations } from "next-intl/server";

import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { staticOwnerTrail } from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

import { OWNER_NAV_COPY_NAMESPACE, PAGE_HEADER_COPY_NAMESPACE } from "./page.copy";

export default async function StaticCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; segments: string[] }> }>) {
  const { workspaceId, segments } = await params;
  const verified = await verifyOwnerWorkspace(workspaceId);
  const t = await getTranslations(OWNER_NAV_COPY_NAMESPACE);
  const crumbT = await getTranslations(PAGE_HEADER_COPY_NAMESPACE);
  const items = staticOwnerTrail(segments, workspaceId, verified.workspace.name, t);
  return items ? <PageHeaderTrail items={items} label={crumbT("breadcrumb")} /> : null;
}
