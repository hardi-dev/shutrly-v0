import { loadProjectDetail } from "@/composition/booking/project-flow/project-flow";
import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";
import { PageHeadingOverride } from "@/features/workspace/ui/page-heading-override/page-heading-override";
import { ToastOnMount } from "@/ui/patterns/toast/toast";

// Placeholder until F-07 Slice 2 builds the real detail page: it shows only the heading and the toast.
export default async function ProjectDetailPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ workspaceId: string; projectId: string }>;
  searchParams: Promise<{ state?: string }>;
}>) {
  const { workspaceId, projectId } = await params;
  const { state } = await searchParams;
  const project = await loadProjectDetail(workspaceId, projectId);
  const toast = resolveToast(state, project.title);
  return (
    <>
      <PageHeadingOverride
        title={project.title}
        parent={{ label: PROJECT_COPY.parentLabel, href: `/w/${workspaceId}/projects` }}
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
