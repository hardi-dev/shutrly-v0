"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { Alert } from "@/ui/patterns/alert/alert";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { ClientPicker } from "../client-picker/client-picker";
import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { projectFieldErrorText } from "../project-field-error/project-field-error";
import { ServicePicker } from "../service-picker/service-picker";
import type { CreateProjectCardProps } from "./create-project-screen.types";

/** The Klien & layanan card: the client combobox and the service select. */
export function ClientServiceCard({ state, props }: Readonly<CreateProjectCardProps>) {
  const { errors } = state.form.formState;
  const serviceError = errorText("serviceId", errors.serviceId?.message);
  const serviceRef = useRef<HTMLDivElement>(null);
  // An inactive-service failure from the server moves focus to Layanan (AC-PRJ-012).
  useEffect(() => {
    if (serviceError) serviceRef.current?.querySelector("button")?.focus();
  }, [serviceError]);
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
      <div ref={serviceRef}>
        <ServicePicker
          serviceGroups={props.serviceGroups}
          value={state.service?.id ?? null}
          onChange={state.selectService}
          errorMessage={serviceError}
        />
      </div>
      {props.hasActiveService ? null : <NoServiceAlert workspaceId={props.workspaceId} />}
    </SectionCard>
  );
}

function NoServiceAlert({ workspaceId }: Readonly<{ workspaceId: string }>) {
  const router = useRouter();
  const handleAction = () => {
    router.push(`/w/${workspaceId}/services`);
  };
  return (
    <Alert
      tone="info"
      title={PROJECT_COPY.noServiceTitle}
      body={PROJECT_COPY.noServiceBody}
      action={{ label: PROJECT_COPY.noServiceAction, onAction: handleAction }}
    />
  );
}

function errorText(path: string, key: string | undefined): string | undefined {
  return key === undefined ? undefined : projectFieldErrorText(path, key);
}
