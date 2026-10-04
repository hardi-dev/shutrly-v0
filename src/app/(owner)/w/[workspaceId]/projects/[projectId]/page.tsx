import {
  PROJECT_EDIT_ACTIONS,
  PROJECT_MENU_ACTIONS,
} from "@/app/actions/booking/project-menu-actions";
import { createGalleryAction, proposeGalleryPasswordAction } from "@/app/actions/gallery/galleries";
import {
  loadProjectDefinitions,
  loadProjectDetail,
} from "@/composition/booking/project-flow/project-flow";
import { loadGalleryCard } from "@/composition/gallery/gallery-flow/gallery-flow";
import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";
import { ProjectDetailScreen } from "@/features/booking/ui/project-detail-screen/project-detail-screen";
import { projectMetaText } from "@/features/booking/ui/project-session-summary/project-session-summary";
import { projectStatusChip } from "@/features/booking/ui/project-status-chip/project-status-props";
import { GalleryCard } from "@/features/gallery/ui/gallery-card/gallery-card";
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
  const [project, definitions, galleryCard] = await Promise.all([
    loadProjectDetail(workspaceId, projectId),
    loadProjectDefinitions(workspaceId),
    loadGalleryCard(workspaceId, projectId),
  ]);
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
        galleryCard={
          <GalleryCard
            workspaceId={workspaceId}
            card={galleryCard}
            createAction={createGalleryAction}
            proposeAction={proposeGalleryPasswordAction}
          />
        }
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
