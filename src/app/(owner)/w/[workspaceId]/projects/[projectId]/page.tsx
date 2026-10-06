import {
  approveAddOnAction,
  cancelAddOnAction,
  createAddOnAction,
  deleteDraftAddOnAction,
} from "@/app/actions/booking/add-ons";
import { rotateClientLinkAction } from "@/app/actions/booking/client-link";
import {
  PROJECT_EDIT_ACTIONS,
  PROJECT_MENU_ACTIONS,
} from "@/app/actions/booking/project-menu-actions";
import {
  addSessionAssignmentAction,
  removeSessionAssignmentAction,
} from "@/app/actions/booking/session-team";
import { completeProjectAction, publishFinalDeliveryAction } from "@/app/actions/gallery/delivery";
import {
  createGalleryAction,
  proposeGalleryPasswordAction,
  rotateGalleryPasswordAction,
} from "@/app/actions/gallery/galleries";
import { loadAddOnCard } from "@/composition/booking/add-on-flow/add-on-flow";
import {
  loadProjectDefinitions,
  loadProjectDetail,
} from "@/composition/booking/project-flow/project-flow";
import { loadAssignableMembers } from "@/composition/booking/team-flow/team-flow";
import { loadAccessCard } from "@/composition/gallery/access-card-flow/access-card-flow";
import { loadDeliveryCard } from "@/composition/gallery/delivery-flow/delivery-flow";
import { loadGalleryCard } from "@/composition/gallery/gallery-flow/gallery-flow";
import { loadSelectionCard } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
import type { AddOnCardView } from "@/features/booking/application/use-cases/list-add-ons/list-add-ons.types";
import { AddOnCard } from "@/features/booking/ui/add-on-card/add-on-card";
import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";
import { ProjectDetailScreen } from "@/features/booking/ui/project-detail-screen/project-detail-screen";
import { projectMetaText } from "@/features/booking/ui/project-session-summary/project-session-summary";
import { projectStatusChip } from "@/features/booking/ui/project-status-chip/project-status-props";
import type { GalleryCardView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import type { AccessCardView } from "@/features/gallery/application/use-cases/get-access-card/get-access-card.types";
import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";
import type { SelectionCardView } from "@/features/gallery/application/use-cases/owner-selection-views/owner-selection-views.types";
import { DeliveryCard } from "@/features/gallery/ui/delivery-card/delivery-card";
import { GalleryCard } from "@/features/gallery/ui/gallery-card/gallery-card";
import { ProjectAccessCard } from "@/features/gallery/ui/project-access-card/project-access-card";
import { SelectionCard } from "@/features/gallery/ui/selection-card/selection-card";
import { PageHeadingOverride } from "@/features/workspace/ui/page-heading-override/page-heading-override";
import { ToastOnMount } from "@/ui/patterns/toast/toast";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ workspaceId: string; projectId: string }>;
  searchParams: Promise<{ state?: string }>;
}>) {
  const { workspaceId, projectId } = await params;
  const { state } = await searchParams;
  const { project, definitions, assignableMembers, cards } = await loadPage(workspaceId, projectId);
  const toast = resolveToast(state, project.title);
  return (
    <>
      <PageHeadingOverride
        title={project.title}
        status={projectStatusChip(project.status)}
        meta={projectMetaText(project.client.name, project.shownSession)}
        parent={{ label: PROJECT_COPY.parentLabel, href: `/w/${workspaceId}/projects` }}
        hidesBottomNav
      />
      <ProjectDetailScreen
        workspaceId={workspaceId}
        project={project}
        menuActions={PROJECT_MENU_ACTIONS}
        editActions={PROJECT_EDIT_ACTIONS}
        definitions={definitions}
        {...cards}
        assignableMembers={assignableMembers}
        addAssignmentAction={addSessionAssignmentAction}
        removeAssignmentAction={removeSessionAssignmentAction}
      />
      {toast ? (
        <ToastOnMount
          tone="success"
          title={toast.title}
          body={toast.body}
          dedupeKey={`project-${state ?? ""}:${projectId}`}
        />
      ) : null}
    </>
  );
}

async function loadPage(workspaceId: string, projectId: string) {
  const [project, definitions, assignableMembers, gallery, selection, addOn, delivery, access] =
    await Promise.all([
      loadProjectDetail(workspaceId, projectId),
      loadProjectDefinitions(workspaceId),
      loadAssignableMembers(workspaceId),
      loadGalleryCard(workspaceId, projectId),
      loadSelectionCard(workspaceId, projectId),
      loadAddOnCard(workspaceId, projectId),
      loadDeliveryCard(workspaceId, projectId),
      loadAccessCard(workspaceId, projectId),
    ]);
  const cards = {
    galleryCard: galleryCardSlot(workspaceId, gallery),
    selectionCard: selectionCardSlot(workspaceId, projectId, selection),
    addOnCard: addOnCardSlot(workspaceId, projectId, addOn),
    deliveryCard: deliveryCardSlot(workspaceId, projectId, delivery),
    accessCard: accessCardSlot(workspaceId, access),
  };
  return { project, definitions, assignableMembers, cards };
}

function selectionCardSlot(workspaceId: string, projectId: string, card: SelectionCardView) {
  return <SelectionCard workspaceId={workspaceId} projectId={projectId} card={card} />;
}

const ADD_ON_ACTIONS = {
  createAction: createAddOnAction,
  approveAction: approveAddOnAction,
  cancelAction: cancelAddOnAction,
  deleteDraftAction: deleteDraftAddOnAction,
};

// Shown once the project can take add-ons, or while it still lists some (A-11).
function addOnCardSlot(workspaceId: string, projectId: string, card: AddOnCardView) {
  if (!card.canCreate && card.addOns.length === 0) return null;
  return (
    <AddOnCard
      workspaceId={workspaceId}
      projectId={projectId}
      card={card}
      actions={ADD_ON_ACTIONS}
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
      workspaceId={workspaceId}
      projectId={projectId}
      card={card}
      actions={DELIVERY_ACTIONS}
    />
  );
}

const ACCESS_ACTIONS = {
  rotateLinkAction: rotateClientLinkAction,
  proposeAction: proposeGalleryPasswordAction,
  rotatePasswordAction: rotateGalleryPasswordAction,
};

function accessCardSlot(workspaceId: string, card: AccessCardView | null) {
  if (!card) return null;
  return <ProjectAccessCard workspaceId={workspaceId} card={card} actions={ACCESS_ACTIONS} />;
}

function galleryCardSlot(workspaceId: string, card: GalleryCardView) {
  return (
    <GalleryCard
      workspaceId={workspaceId}
      card={card}
      createAction={createGalleryAction}
      proposeAction={proposeGalleryPasswordAction}
    />
  );
}

function resolveToast(state: string | undefined, title: string) {
  if (state === "created") {
    return { title: PROJECT_COPY.toastCreatedTitle, body: PROJECT_COPY.toastCreatedBody(title) };
  }
  if (state === "draft-saved") {
    return {
      title: PROJECT_COPY.toastDraftSavedTitle,
      body: PROJECT_COPY.toastDraftSavedBody(title),
    };
  }
  return null;
}
