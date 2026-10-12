"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import type { ClientOption } from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { CreatedClient } from "@/features/booking/application/use-cases/client-results/client-results.types";
import { formatWhatsappNumber } from "@/features/booking/domain/whatsapp-number/whatsapp-number";
import { Combobox } from "@/ui/patterns/combobox/combobox";

import { ClientDialog } from "../client-dialog/client-dialog";
import type { ProjectTranslate } from "../project-copy/project-copy.types";
import { useClientSearch } from "../use-client-search/use-client-search";
import { CLIENT_PICKER_COPY_NAMESPACE } from "./client-picker.copy";
import type { ClientPickerProps } from "./client-picker.types";
import { useClientCreation } from "./use-client-creation";

function describeClient(t: ProjectTranslate, client: ClientOption) {
  return {
    label: client.name,
    description: client.whatsappNumber
      ? t("clientNote", {
          number: formatWhatsappNumber(client.whatsappNumber),
          count: client.projectCount,
        })
      : t("clientNoNumber"),
  };
}

function describeItemFor(t: ProjectTranslate) {
  return (client: ClientOption) => describeClient(t, client);
}

function createLabelFor(t: ProjectTranslate, text: string) {
  return t("clientCreateLabel", { query: text.trim() });
}

function helperOf(client: ClientOption | null): string | undefined {
  return client?.whatsappNumber ? formatWhatsappNumber(client.whatsappNumber) : undefined;
}

function groupLabelFor(t: ProjectTranslate, count: number, query: string): string {
  return count === 0 && query.trim() !== ""
    ? t("clientNoMatchLabel", { query: query.trim() })
    : t("clientGroupLabel", { count });
}

/** Picks one active client with a searchable combobox; typing searches the server (AC-PRJ-006). */
export function ClientPicker(props: Readonly<ClientPickerProps>) {
  const t = useTranslations(CLIENT_PICKER_COPY_NAMESPACE);
  const [text, setText] = useState(props.selectedClient?.name ?? "");
  const search = useClientSearch({
    workspaceId: props.workspaceId,
    query: text,
    searchAction: props.searchAction,
  });
  const handleCreated = (created: CreatedClient) => {
    setText(created.name);
    props.onSelect({
      id: created.id,
      name: created.name,
      whatsappNumber: created.whatsappNumber,
      projectCount: 0,
    });
  };
  const creation = useClientCreation(props, handleCreated);
  const handleSelect = (id: string) => {
    const client = search.items.find((item) => item.id === id);
    if (!client) return;
    setText(client.name);
    props.onSelect(client);
  };
  return (
    <>
      <Combobox
        label={t("clientLabel")}
        placeholder={t("clientPlaceholder")}
        items={search.items}
        selectedId={props.selectedClient?.id ?? null}
        inputValue={text}
        onInputChange={setText}
        onSelect={handleSelect}
        renderItem={describeItemFor(t)}
        groupLabel={groupLabelFor(t, search.items.length, text)}
        description={helperOf(props.selectedClient)}
        errorMessage={props.errorMessage}
        isLoading={search.isLoading}
        createLabel={props.createAction ? createLabelFor(t, text) : undefined}
        onCreate={props.createAction ? creation.open : undefined}
      />
      {props.createAction ? (
        <ClientCreationDialog workspaceId={props.workspaceId} creation={creation} />
      ) : null}
    </>
  );
}

function ClientCreationDialog({
  workspaceId,
  creation,
}: Readonly<{ workspaceId: string; creation: ReturnType<typeof useClientCreation> }>) {
  const t = useTranslations(CLIENT_PICKER_COPY_NAMESPACE);
  return (
    <ClientDialog
      isOpen={creation.query !== null}
      workspaceId={workspaceId}
      onOpenChange={creation.handleOpenChange}
      onSubmit={creation.submit}
      mode="add"
      initialName={creation.query ?? ""}
      description={t("clientDialogDescription")}
      onCreated={creation.onCreated}
    />
  );
}
