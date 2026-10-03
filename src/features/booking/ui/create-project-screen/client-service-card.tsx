"use client";

import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { ClientPicker } from "../client-picker/client-picker";
import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { projectFieldErrorText } from "../project-field-error/project-field-error";
import { ServicePicker } from "../service-picker/service-picker";
import type { CreateProjectCardProps } from "./create-project-screen.types";

/** The Klien & layanan card: the client combobox and the service select. */
export function ClientServiceCard({ state, props }: Readonly<CreateProjectCardProps>) {
  const { errors } = state.form.formState;
  return (
    <SectionCard title={PROJECT_COPY.clientServiceTitle}>
      <ClientPicker
        workspaceId={props.workspaceId}
        selectedClient={state.client}
        onSelect={state.selectClient}
        searchAction={props.searchClientsAction}
        createAction={props.createClientAction}
        errorMessage={errorText("clientId", errors.clientId?.message)}
      />
      <ServicePicker
        serviceGroups={props.serviceGroups}
        value={state.service?.id ?? null}
        onChange={state.selectService}
        errorMessage={errorText("serviceId", errors.serviceId?.message)}
      />
    </SectionCard>
  );
}

function errorText(path: string, key: string | undefined): string | undefined {
  return key === undefined ? undefined : projectFieldErrorText(path, key);
}
