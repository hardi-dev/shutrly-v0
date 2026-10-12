"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { Alert } from "@/ui/patterns/alert/alert";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { ClientPicker } from "../client-picker/client-picker";
import type { ProjectTranslate } from "../project-copy/project-copy.types";
import { projectFieldErrorText } from "../project-field-error/project-field-error";
import { ServicePicker } from "../service-picker/service-picker";
import { CREATE_PROJECT_SCREEN_COPY_NAMESPACE } from "./create-project-screen.copy";
import type { CreateProjectCardProps } from "./create-project-screen.types";

/** The Klien & layanan card: the client combobox and the service select. */
export function ClientServiceCard({ state, props }: Readonly<CreateProjectCardProps>) {
  const t = useTranslations(CREATE_PROJECT_SCREEN_COPY_NAMESPACE);
  const { errors } = state.form.formState;
  const serviceError = errorText(t, "serviceId", errors.serviceId?.message);
  const serviceRef = useRef<HTMLDivElement>(null);
  // An inactive-service failure from the server moves focus to Layanan (AC-PRJ-012).
  useEffect(() => {
    if (serviceError) serviceRef.current?.querySelector("button")?.focus();
  }, [serviceError]);
  return (
    <SectionCard title={t("clientServiceTitle")}>
      <ClientPicker
        workspaceId={props.workspaceId}
        selectedClient={state.client}
        onSelect={state.selectClient}
        searchAction={props.searchClientsAction}
        createAction={props.createClientAction}
        errorMessage={errorText(t, "clientId", errors.clientId?.message)}
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
  const t = useTranslations(CREATE_PROJECT_SCREEN_COPY_NAMESPACE);
  const router = useRouter();
  const handleAction = () => {
    router.push(`/w/${workspaceId}/services`);
  };
  return (
    <Alert
      tone="info"
      title={t("noServiceTitle")}
      body={t("noServiceBody")}
      action={{ label: t("noServiceAction"), onAction: handleAction }}
    />
  );
}

function errorText(t: ProjectTranslate, path: string, key: string | undefined): string | undefined {
  return key === undefined ? undefined : projectFieldErrorText(t, path, key);
}
