"use client";

import { useState } from "react";

import type { ClientOption } from "@/features/booking/application/ports/project-repository/project-repository.port";
import { formatWhatsappNumber } from "@/features/booking/domain/whatsapp-number/whatsapp-number";
import { Combobox } from "@/ui/patterns/combobox/combobox";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { useClientSearch } from "../use-client-search/use-client-search";
import type { ClientPickerProps } from "./client-picker.types";

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
    />
  );
}
