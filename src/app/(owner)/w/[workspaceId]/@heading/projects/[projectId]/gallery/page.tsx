import { getTranslations } from "next-intl/server";

import { loadGalleryPage } from "@/composition/gallery/gallery-flow/gallery-flow";
import { getRequestFormattingLocale } from "@/composition/locale/request-formatting-locale/request-formatting-locale";
import {
  galleryMetaText,
  galleryStatusChip,
} from "@/features/gallery/ui/gallery-text/gallery-text";
import { OwnerPageHeading } from "@/features/workspace/ui/owner-page-heading/owner-page-heading";

import { COMPACT_BAR_COPY_NAMESPACE } from "./page.copy";
import { GALLERY_PAGE_GALLERY_NAMESPACE } from "./page.copy";

export default async function GalleryHeading({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string }> }>) {
  const { workspaceId, projectId } = await params;
  const locale = await getRequestFormattingLocale();
  const page = await loadGalleryPage(workspaceId, projectId);
  const t = await getTranslations(GALLERY_PAGE_GALLERY_NAMESPACE);
  const backT = await getTranslations(COMPACT_BAR_COPY_NAMESPACE);
  return (
    <OwnerPageHeading
      title={t("pageTitle")}
      status={page.gallery.state === "OPEN" ? undefined : galleryStatusChip(t, page.gallery.state)}
      meta={galleryMetaText(t, page.gallery, page.project.title, locale)}
      parent={{ label: page.project.title, href: `/w/${workspaceId}/projects/${projectId}` }}
      backLabel={backT("back")}
    />
  );
}
