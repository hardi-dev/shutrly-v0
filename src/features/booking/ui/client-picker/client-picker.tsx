"use client";

import { useState } from "react";

import type { ClientOption } from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { CreatedClient } from "@/features/booking/application/use-cases/client-results/client-results.types";
import { formatWhatsappNumber } from "@/features/booking/domain/whatsapp-number/whatsapp-number";
import { Combobox } from "@/ui/patterns/combobox/combobox";

import { ClientDialog } from "../client-dialog/client-dialog";
import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { useClientSearch } from "../use-client-search/use-client-search";
import type { ClientPickerProps } from "./client-picker.types";
import { useClientCreation } from "./use-client-creation";

function describeClient(client: ClientOption) {
  return {
    label: client.name,
    description: client.whatsappNumber
      ? PROJECT_COPY.clientNote(formatWhatsappNumber(client.whatsappNumber), client.projectCount)
      : PROJECT_COPY.clientNoNumber,
  };
}

function groupLabelFor(count: number, query: string): string {
  return count === 0 && query.trim() !== ""
    ? PROJECT_COPY.clientNoMatchLabel(query.trim())
    : PROJECT_COPY.clientGroupLabel(count);
}

/** Picks one active client with a searchable combobox; typing searches the server (AC-PRJ-006). */
export function ClientPicker(props: Readonly<ClientPickerProps>) {
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
  const helper = props.selectedClient?.whatsappNumber
    ? formatWhatsappNumber(props.selectedClient.whatsappNumber)
    : undefined;
  return (
    <>
      <Combobox
        label={PROJECT_COPY.clientLabel}
        placeholder={PROJECT_COPY.clientPlaceholder}
        items={search.items}
        selectedId={props.selectedClient?.id ?? null}
        inputValue={text}
        onInputChange={setText}
        onSelect={handleSelect}
        renderItem={describeClient}
        groupLabel={groupLabelFor(search.items.length, text)}
        description={helper}
        errorMessage={props.errorMessage}
        isLoading={search.isLoading}
        createLabel={props.createAction ? PROJECT_COPY.clientCreateLabel(text.trim()) : undefined}
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
  return (
    <ClientDialog
      isOpen={creation.query !== null}
      workspaceId={workspaceId}
      onOpenChange={creation.handleOpenChange}
      onSubmit={creation.submit}
      mode="add"
      initialName={creation.query ?? ""}
      description={PROJECT_COPY.clientDialogDescription}
      onCreated={creation.onCreated}
    />
  );
}
