"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";

import { PackageItemsCard } from "../package-items-card/package-items-card";
import { projectFieldErrorText } from "../project-field-error/project-field-error";
import { ProjectFieldsCard } from "../project-fields-card/project-fields-card";
import { SessionsCard } from "../sessions-card/sessions-card";
import { useCreateProjectForm } from "../use-create-project-form/use-create-project-form";
import { ClientServiceCard } from "./client-service-card";
import { CreateProjectActions } from "./create-project-actions";
import type { CreateProjectScreenProps } from "./create-project-screen.types";
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
  const fieldErrors = Object.fromEntries(
    (service?.fields ?? []).flatMap((field) => {
      const key = errors.fieldValues?.[field.key]?.message;
      return key
        ? [[field.key, projectFieldErrorText(`fieldValues.${field.key}`, key, field.name)]]
        : [];
    }),
  );
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-4) pb-(--space-6) md:gap-(--component-panel-app-content-gap)">
      <ClientServiceCard state={state} props={props} />
      {service ? (
        <PackageItemsCard serviceName={service.name} items={service.items} isMobile={isMobile} />
      ) : null}
      <ProjectDetailCard state={state} />
      <SessionsCard
        sessions={values.sessions}
        isMobile={isMobile}
        errorMessage={
          sessionsKey === undefined ? undefined : projectFieldErrorText("sessions", sessionsKey)
        }
        onAdd={state.addSession}
        onUpdate={state.updateSession}
        onRemove={state.removeSession}
      />
      {service ? (
        <ProjectFieldsCard
          serviceName={service.name}
          fields={service.fields}
          values={values.fieldValues}
          errors={fieldErrors}
          onChange={state.changeFieldValue}
        />
      ) : null}
      <CreateProjectActions state={state} />
    </main>
  );
}
