import { rotateClientLinkAction } from "@/app/actions/booking/client-link";
import { completeProjectAction, publishFinalDeliveryAction } from "@/app/actions/gallery/delivery";
import {
  proposeGalleryPasswordAction,
  rotateGalleryPasswordAction,
} from "@/app/actions/gallery/galleries";
import { GALLERY_PAGE_ACTIONS } from "@/app/actions/gallery/gallery-page-actions";
import { loadAccessCard } from "@/composition/gallery/access-card-flow/access-card-flow";
import { loadDeliveryCard } from "@/composition/gallery/delivery-flow/delivery-flow";
import { loadGalleryPage } from "@/composition/gallery/gallery-flow/gallery-flow";
import { loadSelectionCard } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
import type { AccessCardView } from "@/features/gallery/application/use-cases/get-access-card/get-access-card.types";
import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";
import { DeliveryCard } from "@/features/gallery/ui/delivery-card/delivery-card";
import { GALLERY_COPY } from "@/features/gallery/ui/gallery-copy/gallery-copy.copy";
import { GalleryPageScreen } from "@/features/gallery/ui/gallery-page-screen/gallery-page-screen";
import {
  galleryMetaText,
  galleryStatusChip,
} from "@/features/gallery/ui/gallery-text/gallery-text";
import { ProjectAccessCard } from "@/features/gallery/ui/project-access-card/project-access-card";
import { SelectionCard } from "@/features/gallery/ui/selection-card/selection-card";
import { PageHeadingOverride } from "@/features/workspace/ui/page-heading-override/page-heading-override";

export default async function GalleryPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ workspaceId: string; projectId: string }>;
  searchParams: Promise<{ sync?: string }>;
}>) {
  const { workspaceId, projectId } = await params;
  const { sync } = await searchParams;
  const [page, access, selection, delivery] = await Promise.all([
    loadGalleryPage(workspaceId, projectId),
    loadAccessCard(workspaceId, projectId),
    loadSelectionCard(workspaceId, projectId),
    loadDeliveryCard(workspaceId, projectId),
  ]);
  return (
    <>
      <PageHeadingOverride
        title={GALLERY_COPY.pageTitle}
        status={galleryStatusChip(page.gallery.status)}
        meta={galleryMetaText(page.gallery, page.project.title)}
        parent={{ label: page.project.title, href: `/w/${workspaceId}/projects/${projectId}` }}
        hidesBottomNav
      />
      <GalleryPageScreen
        workspaceId={workspaceId}
        page={page}
        actions={GALLERY_PAGE_ACTIONS}
        initialSyncSourceId={sync}
        accessCard={accessCardSlot(workspaceId, access)}
        selectionCard={
          <SelectionCard
            key="selection"
            workspaceId={workspaceId}
            projectId={projectId}
            card={selection}
          />
        }
        deliveryCard={deliveryCardSlot(workspaceId, projectId, delivery)}
      />
    </>
  );
}

// Each slot carries a key: the screen renders them as siblings, and React 19 dev warns about
// unkeyed server-built elements there ("passed a child from GalleryPage").
const ACCESS_ACTIONS = {
  rotateLinkAction: rotateClientLinkAction,
  proposeAction: proposeGalleryPasswordAction,
  rotatePasswordAction: rotateGalleryPasswordAction,
};

function accessCardSlot(workspaceId: string, card: AccessCardView | null) {
  if (!card) return null;
  return (
    <ProjectAccessCard
      key="access"
      workspaceId={workspaceId}
      card={card}
      actions={ACCESS_ACTIONS}
    />
  );
}

const DELIVERY_ACTIONS = {
  publishAction: publishFinalDeliveryAction,
  completeAction: completeProjectAction,
};

function deliveryCardSlot(workspaceId: string, projectId: string, card: DeliveryCardView) {
  if (!card.isShown) return null;
  return (
    <DeliveryCard
      key="delivery"
      workspaceId={workspaceId}
      projectId={projectId}
      card={card}
      actions={DELIVERY_ACTIONS}
    />
  );
}
