"use client";
/* eslint-disable max-lines-per-function -- the screen composes every form card in one place */

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";

import { ChangeServiceDialog } from "../change-service-dialog/change-service-dialog";
import { projectFieldErrorText } from "../project-field-error/project-field-error";
import { ProjectFieldsCard } from "../project-fields-card/project-fields-card";
import { SessionsCard } from "../sessions-card/sessions-card";
import { useCreateProjectForm } from "../use-create-project-form/use-create-project-form";
import type { CreateProjectState } from "../use-create-project-form/use-create-project-form.types";
import { ClientServiceCard } from "./client-service-card";
import { CreateProjectActions } from "./create-project-actions";
import type { CreateProjectScreenProps } from "./create-project-screen.types";
import { PackageEditing } from "./package-editing";
import { ProjectDetailCard } from "./project-detail-card";

/** The Proyek baru form: one client, one service, an editable package snapshot, sessions and booking values (S2). */
export function CreateProjectScreen(props: Readonly<CreateProjectScreenProps>) {
  const isMobile = useMobileViewport();
  const state = useCreateProjectForm({
    workspaceId: props.workspaceId,
    serviceGroups: props.serviceGroups,
    createAction: props.createAction,
  });
  const { form, service } = state;
  const values = form.watch();
  const { errors } = form.formState;
  const sessionsKey = errors.sessions?.message;
  const fieldErrors = fieldErrorTexts(service, errors);
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-4) pb-(--space-6) md:gap-(--component-panel-app-content-gap)">
      <ClientServiceCard state={state} props={props} />
      {service && props.hasActiveService ? (
        <PackageEditing
          state={state}
          serviceName={service.name}
          definitions={props.definitions}
          isMobile={isMobile}
        />
      ) : null}
      <ProjectDetailCard state={state} />
      <SessionsCard
        sessions={values.sessions}
        isMobile={isMobile}
        members={props.assignableMembers}
        errorMessage={sessionsErrorText(sessionsKey, errors.sessions)}
        onAdd={state.addSession}
        onUpdate={state.updateSession}
        onRemove={state.removeSession}
      />
      {service && props.hasActiveService ? (
        <ProjectFieldsCard
          serviceName={service.name}
          fields={service.fields}
          values={values.fieldValues}
          errors={fieldErrors}
          onChange={state.changeFieldValue}
        />
      ) : null}
      <ChangeServiceDialog
        serviceName={state.pendingService?.name ?? null}
        onConfirm={state.confirmServiceChange}
        onCancel={state.cancelServiceChange}
      />
      <CreateProjectActions state={state} isDisabled={!props.hasActiveService} />
    </main>
  );
}

/** The card's one message: the missing-session error, else the first session whose team the server refused. */
function sessionsErrorText(
  key: string | undefined,
  errors: CreateProjectState["form"]["formState"]["errors"]["sessions"],
): string | undefined {
  if (key !== undefined) return projectFieldErrorText("sessions", key);
  const team = errors?.find?.((entry) => entry?.team)?.team;
  const teamKey = team && "message" in team ? team.message : undefined;
  return teamKey === undefined ? undefined : projectFieldErrorText("team", teamKey);
}

function fieldErrorTexts(
  service: CreateProjectState["service"],
  errors: CreateProjectState["form"]["formState"]["errors"],
): Record<string, string> {
  return Object.fromEntries(
    (service?.fields ?? []).flatMap((field) => {
      const key = errors.fieldValues?.[field.key]?.message;
      return key
        ? [[field.key, projectFieldErrorText(`fieldValues.${field.key}`, key, field.name)]]
        : [];
    }),
  );
}
/* eslint-enable max-lines-per-function -- the screen composes every form card in one place */
