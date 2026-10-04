import { loadGalleryPage } from "@/composition/gallery/gallery-flow/gallery-flow";
import { GALLERY_COPY } from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";
import { GalleryPageScreen } from "@/features/gallery/ui/gallery-page-screen/gallery-page-screen";
import {
  galleryMetaText,
  galleryStatusChip,
} from "@/features/gallery/ui/gallery-text/gallery-text";
import { PageHeadingOverride } from "@/features/workspace/ui/page-heading-override/page-heading-override";

export default async function GalleryPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; projectId: string }> }>) {
  const { workspaceId, projectId } = await params;
  const page = await loadGalleryPage(workspaceId, projectId);
  return (
    <>
      <PageHeadingOverride
        title={GALLERY_COPY.pageTitle}
        status={galleryStatusChip(page.gallery.status)}
        meta={galleryMetaText(page.gallery, page.project.title)}
        parent={{ label: page.project.title, href: `/w/${workspaceId}/projects/${projectId}` }}
        hidesBottomNav
      />
      <GalleryPageScreen workspaceId={workspaceId} page={page} />
    </>
  );
}
