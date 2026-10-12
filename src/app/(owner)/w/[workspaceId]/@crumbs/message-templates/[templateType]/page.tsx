import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { messageTemplateSubPages } from "@/features/communications/ui/template-sub-pages/template-sub-pages";
import { ownerTrail, sectionCrumb } from "@/features/workspace/ui/owner-trail/owner-trail";
import { PageHeaderTrail } from "@/ui/patterns/page-header/page-header";

import {
  MESSAGE_TEMPLATE_SUB_PAGES_COPY_NAMESPACE,
  OWNER_NAV_COPY_NAMESPACE,
  PAGE_HEADER_COPY_NAMESPACE,
} from "./page.copy";

export default async function TemplateCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; templateType: string }> }>) {
  const { workspaceId, templateType } = await params;
  const verified = await verifyOwnerWorkspace(workspaceId);
  const path = `/w/${workspaceId}/message-templates/${templateType}`;
  const templateT = await getTranslations(MESSAGE_TEMPLATE_SUB_PAGES_COPY_NAMESPACE);
  const page = messageTemplateSubPages(templateT, workspaceId).find(
    (subPage) => subPage.path === path,
  );
  if (!page) notFound();
  const t = await getTranslations(OWNER_NAV_COPY_NAMESPACE);
  const crumbT = await getTranslations(PAGE_HEADER_COPY_NAMESPACE);
  const items = ownerTrail({
    workspaceId,
    workspaceName: verified.workspace.name,
    ancestors: [sectionCrumb(workspaceId, "message-templates", t)],
    current: page.title,
  });
  return <PageHeaderTrail items={items} label={crumbT("breadcrumb")} />;
}
