"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";

import { ProjectSessionSummaryLine } from "../project-session-summary/project-session-summary-line";
import { ProjectStatusChip } from "../project-status-chip/project-status-chip";
import { useProjectActions } from "../use-project-actions/use-project-actions";
import { ProjectCancelledAlert } from "./project-cancelled-alert";
import {
  ProjectFieldsReadCard,
  ProjectInfoCard,
  ProjectPackageCard,
  ProjectScheduleCard,
} from "./project-detail-cards";
import type { ProjectDetailScreenProps } from "./project-detail-screen.types";
import { ProjectStepButton } from "./project-step-button";

/** The project detail page (S3): header block on phones, one read-only card per area and the status step. */
export function ProjectDetailScreen({
  workspaceId,
  project,
  advanceAction,
}: Readonly<ProjectDetailScreenProps>) {
  const isMobile = useMobileViewport();
  const actions = useProjectActions({ workspaceId, projectId: project.id, advanceAction });
  const step = project.nextStep;
  const button =
    step === null ? null : (
      <ProjectStepButton
        step={step}
        size={isMobile ? "lg" : "md"}
        className="max-md:w-full"
        isPending={actions.pendingStep === step}
        isDisabled={actions.pendingStep !== null && actions.pendingStep !== step}
        onAdvance={actions.advance}
      />
    );
  return (
    <>
      {!isMobile && button ? <PageActions>{button}</PageActions> : null}
      <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-4) pb-(--space-6) md:gap-(--component-panel-app-content-gap)">
        {isMobile ? (
          <header className="flex flex-col items-start gap-(--space-2)">
            <ProjectStatusChip status={project.status} />
            <ProjectSessionSummaryLine shown={project.shownSession} />
          </header>
        ) : null}
        {project.cancellation ? (
          <ProjectCancelledAlert cancellation={project.cancellation} />
        ) : null}
        <ProjectInfoCard project={project} isMobile={isMobile} />
        <ProjectPackageCard project={project} isMobile={isMobile} />
        <ProjectScheduleCard project={project} isMobile={isMobile} />
        <ProjectFieldsReadCard project={project} isMobile={isMobile} />
        {isMobile && button ? (
          <div className="sticky bottom-0 z-10 border-t border-(--color-semantic-border-default) bg-(--color-semantic-surface-panel) p-(--space-4) max-md:-mx-(--space-4) max-md:-mb-(--space-5)">
            {button}
          </div>
        ) : null}
      </main>
    </>
  );
}
