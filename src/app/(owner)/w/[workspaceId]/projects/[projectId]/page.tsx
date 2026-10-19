import { getTranslations } from "next-intl/server";

import {
  approveAddOnAction,
  cancelAddOnAction,
  createAddOnAction,
  deleteDraftAddOnAction,
} from "@/app/actions/booking/add-ons";
import {
  PROJECT_EDIT_ACTIONS,
  PROJECT_MENU_ACTIONS,
} from "@/app/actions/booking/project-menu-actions";
import {
  addSessionAssignmentAction,
  removeSessionAssignmentAction,
} from "@/app/actions/booking/session-team";
import { TEAM_QUICK_ADD_ACTIONS } from "@/app/actions/booking/team-quick-add-actions";
import { completeProjectAction, markDeliveredAction } from "@/app/actions/gallery/delivery";
import { loadAddOnCard } from "@/composition/booking/add-on-flow/add-on-flow";
import {
  loadProjectDefinitions,
  loadProjectDetail,
} from "@/composition/booking/project-flow/project-flow";
import { loadAssignableMembers, loadTeamRoles } from "@/composition/booking/team-flow/team-flow";
import { loadDeliveryCard } from "@/composition/gallery/delivery-flow/delivery-flow";
import { loadGalleryCard } from "@/composition/gallery/gallery-flow/gallery-flow";
import { isGalleryShareable } from "@/composition/gallery/gallery-share-flow/gallery-share-eligibility";
import { loadSelectionCard } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
import { getRequestFormattingLocale } from "@/composition/locale/request-formatting-locale/request-formatting-locale";
import type { ProjectDetailView } from "@/features/booking/application/use-cases/get-project-detail/get-project-detail.types";
import type { AddOnCardView } from "@/features/booking/application/use-cases/list-add-ons/list-add-ons.types";
import { AddOnCard } from "@/features/booking/ui/add-on-card/add-on-card";
import type { ProjectTranslate } from "@/features/booking/ui/project-copy/project-copy.types";
import { ProjectDetailScreen } from "@/features/booking/ui/project-detail-screen/project-detail-screen";
import { TeamQuickAddProvider } from "@/features/booking/ui/team-quick-add/team-quick-add";
import type { GalleryCardView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";
import type { SelectionCardView } from "@/features/gallery/application/use-cases/owner-selection-views/owner-selection-views.types";
import { FinishProjectButton } from "@/features/gallery/ui/finish-project-button/finish-project-button";
import { GalleryCard } from "@/features/gallery/ui/gallery-card/gallery-card";
import { MarkDeliveredButton } from "@/features/gallery/ui/mark-delivered-button/mark-delivered-button";
import { ToastOnMount } from "@/ui/patterns/toast/toast";

import { PROJECT_DETAIL_PAGE_COPY_NAMESPACE } from "./page.copy";
import { deliveredMetaOf } from "./project-heading";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ workspaceId: string; projectId: string }>;
  searchParams: Promise<{ state?: string }>;
}>) {
  const locale = await getRequestFormattingLocale();
  const [{ workspaceId, projectId }, { state }] = await Promise.all([params, searchParams]);
  const { project, definitions, assignableMembers, roles, gallery, delivery, cards, t } =
    await loadPage(workspaceId, projectId);
  const toast = resolveToast(t, state, project.title);
  const deliveredMeta = await deliveredMetaOf(delivery, locale);
  return (
    <>
      <TeamQuickAddProvider value={{ workspaceId, roles, ...TEAM_QUICK_ADD_ACTIONS }}>
        <ProjectDetailScreen
          workspaceId={workspaceId}
          project={project}
          menuActions={PROJECT_MENU_ACTIONS}
          editActions={PROJECT_EDIT_ACTIONS}
          definitions={definitions}
          {...cards}
          headerAction={headerActionSlot(workspaceId, projectId, project, delivery)}
          headerMeta={deliveredMeta ?? undefined}
          canShareGallery={isGalleryShareable(gallery)}
          hasFinishedFiles={delivery.editedCount + delivery.printCount > 0}
          assignableMembers={assignableMembers}
          addAssignmentAction={addSessionAssignmentAction}
          removeAssignmentAction={removeSessionAssignmentAction}
        />
      </TeamQuickAddProvider>
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
  const [project, definitions, assignableMembers, roles, gallery, selection, addOn, delivery] =
    await Promise.all([
      loadProjectDetail(workspaceId, projectId),
      loadProjectDefinitions(workspaceId),
      loadAssignableMembers(workspaceId),
      loadTeamRoles(workspaceId),
      loadGalleryCard(workspaceId, projectId),
      loadSelectionCard(workspaceId, projectId),
      loadAddOnCard(workspaceId, projectId),
      loadDeliveryCard(workspaceId, projectId),
    ]);
  const cards = {
    galleryCard: galleryCardSlot(workspaceId, { gallery, selection, delivery }),
    addOnCard: addOnCardSlot(workspaceId, projectId, addOn),
  };
  const t = await getTranslations(PROJECT_DETAIL_PAGE_COPY_NAMESPACE);
  return { project, definitions, assignableMembers, roles, gallery, delivery, cards, t };
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

// The Galeri card summarises the picks and final delivery, which live on the gallery page (A-34).
function galleryCardSlot(
  workspaceId: string,
  views: { gallery: GalleryCardView; selection: SelectionCardView; delivery: DeliveryCardView },
) {
  return (
    <GalleryCard
      workspaceId={workspaceId}
      card={views.gallery}
      selection={views.selection}
      delivery={views.delivery}
    />
  );
}

const DELIVERY_ACTIONS = { markDeliveredAction };
const FINISH_ACTIONS = { completeAction: completeProjectAction };

// A DELIVERED project's header offers *Tandai selesai* (BR-PRJ-004); POST_PROCESSING offers *Tandai terkirim*.
function headerActionSlot(
  workspaceId: string,
  projectId: string,
  project: ProjectDetailView,
  delivery: DeliveryCardView,
) {
  if (project.status === "DELIVERED") {
    return (
      <FinishProjectButton
        workspaceId={workspaceId}
        projectId={projectId}
        title={project.title}
        actions={FINISH_ACTIONS}
      />
    );
  }
  return markDeliveredSlot(workspaceId, projectId, delivery, project.nextStep);
}

// *Tandai terkirim* is the header's step on POST_PROCESSING (F-27 AC-GFL-017); the project detail hides its step button and shows this one.
function markDeliveredSlot(
  workspaceId: string,
  projectId: string,
  card: DeliveryCardView,
  nextStep: ProjectDetailView["nextStep"],
) {
  if (nextStep !== "MARK_DELIVERED") return null;
  return (
    <MarkDeliveredButton
      workspaceId={workspaceId}
      projectId={projectId}
      card={card}
      actions={DELIVERY_ACTIONS}
    />
  );
}

function resolveToast(t: ProjectTranslate, state: string | undefined, title: string) {
  if (state === "created") {
    return { title: t("toastCreatedTitle"), body: t("toastCreatedBody", { title }) };
  }
  if (state === "draft-saved") {
    return { title: t("toastDraftSavedTitle"), body: t("toastDraftSavedBody", { title }) };
  }
  return null;
}
