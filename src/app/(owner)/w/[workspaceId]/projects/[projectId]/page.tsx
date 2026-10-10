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
import { completeProjectAction, publishFinalDeliveryAction } from "@/app/actions/gallery/delivery";
import {
  checkNewGalleryFolderAction,
  createGalleryAction,
  proposeGalleryPasswordAction,
} from "@/app/actions/gallery/galleries";
import { loadAddOnCard } from "@/composition/booking/add-on-flow/add-on-flow";
import {
  loadProjectDefinitions,
  loadProjectDetail,
} from "@/composition/booking/project-flow/project-flow";
import { loadAssignableMembers, loadTeamRoles } from "@/composition/booking/team-flow/team-flow";
import { loadDeliveryCard } from "@/composition/gallery/delivery-flow/delivery-flow";
import { loadGalleryCard } from "@/composition/gallery/gallery-flow/gallery-flow";
import { loadSelectionCard } from "@/composition/gallery/selection-owner-flow/selection-owner-flow";
import { getRequestFormattingLocale } from "@/composition/locale/request-formatting-locale/request-formatting-locale";
import type { ProjectDetailView } from "@/features/booking/application/use-cases/get-project-detail/get-project-detail.types";
import type { AddOnCardView } from "@/features/booking/application/use-cases/list-add-ons/list-add-ons.types";
import { AddOnCard } from "@/features/booking/ui/add-on-card/add-on-card";
import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";
import { ProjectDetailScreen } from "@/features/booking/ui/project-detail-screen/project-detail-screen";
import {
  projectMetaLine,
  projectMetaText,
} from "@/features/booking/ui/project-session-summary/project-session-summary";
import { projectStatusChip } from "@/features/booking/ui/project-status-chip/project-status-props";
import { TeamQuickAddProvider } from "@/features/booking/ui/team-quick-add/team-quick-add";
import type { GalleryCardView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";
import type { SelectionCardView } from "@/features/gallery/application/use-cases/owner-selection-views/owner-selection-views.types";
import { CompleteProjectButton } from "@/features/gallery/ui/complete-project-button/complete-project-button";
import { deliveredHeaderMeta } from "@/features/gallery/ui/delivery-text/delivery-text";
import { GalleryCard } from "@/features/gallery/ui/gallery-card/gallery-card";
import { PageHeadingOverride } from "@/features/workspace/ui/page-heading-override/page-heading-override";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import { ToastOnMount } from "@/ui/patterns/toast/toast";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ workspaceId: string; projectId: string }>;
  searchParams: Promise<{ state?: string }>;
}>) {
  const locale = await getRequestFormattingLocale();
  const [{ workspaceId, projectId }, { state }] = await Promise.all([params, searchParams]);
  const { project, definitions, assignableMembers, roles, delivery, cards } = await loadPage(
    workspaceId,
    projectId,
  );
  const toast = resolveToast(state, project.title);
  const deliveredMeta = deliveredHeaderMeta(delivery, locale);
  return (
    <>
      <PageHeadingOverride
        title={project.title}
        status={projectStatusChip(project.status)}
        meta={headerMetaText(project, deliveredMeta, locale)}
        parent={{ label: PROJECT_COPY.parentLabel, href: `/w/${workspaceId}/projects` }}
        hidesBottomNav
      />
      <TeamQuickAddProvider value={{ workspaceId, roles, ...TEAM_QUICK_ADD_ACTIONS }}>
        <ProjectDetailScreen
          workspaceId={workspaceId}
          project={project}
          menuActions={PROJECT_MENU_ACTIONS}
          editActions={PROJECT_EDIT_ACTIONS}
          definitions={definitions}
          {...cards}
          headerAction={completeSlot(workspaceId, projectId, delivery)}
          headerMeta={deliveredMeta ?? undefined}
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
  return { project, definitions, assignableMembers, roles, delivery, cards };
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
      createAction={createGalleryAction}
      proposeAction={proposeGalleryPasswordAction}
      checkFolderAction={checkNewGalleryFolderAction}
    />
  );
}

// A delivered project names when final delivery was published instead of its session (owner-7 `r71J5`).
function headerMetaText(
  project: ProjectDetailView,
  deliveredMeta: string | null,
  locale: FormattingLocale,
) {
  if (deliveredMeta === null) {
    return projectMetaText(project.client.name, project.shownSession, locale);
  }
  return projectMetaLine(project.client.name, deliveredMeta);
}

const DELIVERY_ACTIONS = {
  publishAction: publishFinalDeliveryAction,
  completeAction: completeProjectAction,
};

// *Tandai selesai* is the header's main action on a DELIVERED project (A-34, AC-DEL-007).
function completeSlot(workspaceId: string, projectId: string, card: DeliveryCardView) {
  if (!card.canComplete) return null;
  return (
    <CompleteProjectButton
      workspaceId={workspaceId}
      projectId={projectId}
      card={card}
      actions={DELIVERY_ACTIONS}
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
