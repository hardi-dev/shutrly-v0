import { getTranslations } from "next-intl/server";

import { OwnerPageHeading } from "@/features/workspace/ui/owner-page-heading/owner-page-heading";

import { COMPACT_BAR_COPY_NAMESPACE } from "./page.copy";
import { PICKS_PAGE_GALLERY_NAMESPACE, PICKS_PAGE_SELECTION_NAMESPACE } from "./page.copy";

export default async function PicksHeading({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string }> }>) {
  const { workspaceId, projectId } = await params;
  const selT = await getTranslations(PICKS_PAGE_SELECTION_NAMESPACE);
  const galT = await getTranslations(PICKS_PAGE_GALLERY_NAMESPACE);
  const backT = await getTranslations(COMPACT_BAR_COPY_NAMESPACE);
  return (
    <OwnerPageHeading
      title={selT("cardTitle")}
      meta={selT("pageMeta")}
      parent={{ label: galT("pageTitle"), href: `/w/${workspaceId}/projects/${projectId}/gallery` }}
      backLabel={backT("back")}
    />
  );
}
