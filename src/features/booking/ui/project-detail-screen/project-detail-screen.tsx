"use client";
/* eslint-disable max-lines-per-function -- responsive detail body wires the step, menu and cards */

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { formatShortDate } from "@/features/booking/domain/session/session";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { CompactBarActions } from "@/ui/patterns/compact-bar/compact-bar-actions";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { ProjectMenuHost } from "../project-menu-host/project-menu-host";
import type {
  ProjectMenuApi,
  ProjectMenuTarget,
} from "../project-menu-host/project-menu-host.types";
import { ProjectSessionSummaryLine } from "../project-session-summary/project-session-summary-line";
import { ProjectStatusChip } from "../project-status-chip/project-status-chip";
import { projectStatusChip } from "../project-status-chip/project-status-props";
import { SessionTeamHost } from "../session-team-host/session-team-host";
import { useProjectActions } from "../use-project-actions/use-project-actions";
import { DetailEditing } from "./detail-editing";
import { ProjectCancelledAlert } from "./project-cancelled-alert";
import {
  ProjectFieldsReadCard,
  ProjectInfoCard,
  ProjectPackageCard,
  ProjectScheduleCard,
} from "./project-detail-cards";
import type {
  DetailEditHandlers,
  ProjectDetailScreenProps,
  SessionTeamHandlers,
} from "./project-detail-screen.types";
import { ProjectStepButton } from "./project-step-button";

/** The project detail page (S3): header block on phones, one read-only card per area and the status step. */
export function ProjectDetailScreen(props: Readonly<ProjectDetailScreenProps>) {
  const router = useRouter();
  const handleDeleted = () => {
    router.push(`/w/${props.workspaceId}/projects`);
  };
  const [addSessionRequest, setAddSessionRequest] = useState(0);
  const handleSessionRequired = () => {
    setAddSessionRequest((count) => count + 1);
  };
  const renderBody = (api: ProjectMenuApi) => (
    <DetailEditing
      workspaceId={props.workspaceId}
      project={props.project}
      actions={props.editActions}
      definitions={props.definitions}
      addSessionRequest={addSessionRequest}
    >
      {(edit) => (
        <SessionTeamHost
          workspaceId={props.workspaceId}
          project={props.project}
          assignableMembers={props.assignableMembers}
          addAssignmentAction={props.addAssignmentAction}
        >
          {(team) => (
            <DetailBody
              {...props}
              api={api}
              edit={edit}
              team={team}
              onSessionRequired={handleSessionRequired}
            />
          )}
        </SessionTeamHost>
      )}
    </DetailEditing>
  );
  return (
    <ProjectMenuHost
      workspaceId={props.workspaceId}
      actions={props.menuActions}
      variant="detail"
      onDeleted={handleDeleted}
      onSessionRequired={handleSessionRequired}
    >
      {renderBody}
    </ProjectMenuHost>
  );
}

function menuTargetOf(project: ProjectDetailScreenProps["project"]): ProjectMenuTarget {
  const when =
    project.shownSession === null
      ? PROJECT_COPY.metaNoSchedule
      : formatShortDate(project.shownSession.session.date);
  return {
    id: project.id,
    title: project.title,
    status: project.status,
    clientId: project.client.id,
    clientName: project.client.name,
    whatsappNumber: project.client.whatsappNumber,
    meta: PROJECT_COPY.menuSheetMeta(
      project.client.name,
      when,
      projectStatusChip(project.status).label,
    ),
    info: {
      projectId: project.id,
      title: project.title,
      notes: project.notes,
      agreedPrice: project.agreedPrice,
      basePrice: project.service.basePrice,
      canEditDeal: project.canEditDeal,
    },
  };
}

function DetailBody({
  workspaceId,
  project,
  menuActions,
  api,
  edit,
  team,
  onSessionRequired,
}: Readonly<
  ProjectDetailScreenProps & {
    api: ProjectMenuApi;
    edit: DetailEditHandlers;
    team: SessionTeamHandlers;
    onSessionRequired: () => void;
  }
>) {
  const isMobile = useMobileViewport();
  const actions = useProjectActions({
    workspaceId,
    projectId: project.id,
    advanceAction: menuActions.advanceAction,
    onSessionRequired,
  });
  const target = menuTargetOf(project);
  const menu = api.menuFor(target);
  const handleEditInfo = () => {
    api.openInfo(target);
  };
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
      {isMobile ? (
        <CompactBarActions>{menu}</CompactBarActions>
      ) : (
        <PageActions>
          {button}
          {menu}
        </PageActions>
      )}
      <DetailCards
        project={project}
        isMobile={isMobile}
        onEditInfo={handleEditInfo}
        button={button}
        edit={edit}
        team={team}
      />
    </>
  );
}

function DetailCards({
  project,
  isMobile,
  onEditInfo,
  button,
  edit,
  team,
}: Readonly<{
  project: ProjectDetailScreenProps["project"];
  isMobile: boolean;
  onEditInfo: () => void;
  button: ReactNode;
  edit: DetailEditHandlers;
  team: SessionTeamHandlers;
}>) {
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-4) pb-(--space-6) md:gap-(--component-panel-app-content-gap)">
      {isMobile ? (
        <header className="flex flex-col items-start gap-(--space-2)">
          <ProjectStatusChip status={project.status} />
          <ProjectSessionSummaryLine shown={project.shownSession} />
        </header>
      ) : null}
      {project.cancellation ? <ProjectCancelledAlert cancellation={project.cancellation} /> : null}
      <ProjectInfoCard project={project} isMobile={isMobile} onEdit={onEditInfo} />
      <ProjectPackageCard project={project} isMobile={isMobile} edit={edit} />
      <ProjectScheduleCard project={project} isMobile={isMobile} edit={edit} team={team} />
      <ProjectFieldsReadCard project={project} isMobile={isMobile} edit={edit} />
      {isMobile && button ? (
        <div className="sticky bottom-0 z-10 border-t border-(--color-semantic-border-default) bg-(--color-semantic-surface-panel) p-(--space-4) max-md:-mx-(--space-4) max-md:-mb-(--space-5)">
          {button}
        </div>
      ) : null}
    </main>
  );
}
/* eslint-enable max-lines-per-function -- responsive detail body wires the step, menu and cards */
