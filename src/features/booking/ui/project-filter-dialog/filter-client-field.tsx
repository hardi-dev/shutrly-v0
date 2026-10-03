"use client";

import { useState } from "react";

import type { FilterClientOption } from "@/features/booking/application/ports/project-repository/project-repository.port";
import { Combobox } from "@/ui/patterns/combobox/combobox";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { SearchFilterClientsCall } from "./project-filter-dialog.types";
import { useFilterClientSearch } from "./use-filter-client-search";

const describe = (client: FilterClientOption) => ({
  label: client.isArchived ? PROJECT_COPY.filterArchivedClient(client.name) : client.name,
});

/** The Klien field of the filter: one client, archived ones included. */
export function FilterClientField({
  workspaceId,
  clientId,
  initialClient,
  searchAction,
  onChange,
}: Readonly<{
  workspaceId: string;
  clientId: string | null;
  initialClient: FilterClientOption | null;
  searchAction: SearchFilterClientsCall;
  onChange: (clientId: string | null) => void;
}>) {
  const [text, setText] = useState(initialClient?.name ?? "");
  const items = useFilterClientSearch(workspaceId, text, searchAction);
  const handleInput = (next: string) => {
    setText(next);
    if (next === "") onChange(null);
  };
  const handleSelect = (id: string) => {
    const found = items.find((item) => item.id === id);
    if (!found) return;
    setText(found.name);
    onChange(found.id);
  };
  return (
    <Combobox
      label={PROJECT_COPY.filterClient}
      placeholder={PROJECT_COPY.filterClientPlaceholder}
      items={items}
      selectedId={clientId}
      inputValue={text}
      onInputChange={handleInput}
      onSelect={handleSelect}
      renderItem={describe}
      groupLabel={PROJECT_COPY.filterClientGroup(items.length)}
    />
  );
}
