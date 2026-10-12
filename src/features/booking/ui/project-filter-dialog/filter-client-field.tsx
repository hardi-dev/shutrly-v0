"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import type { FilterClientOption } from "@/features/booking/application/ports/project-repository/project-repository.port";
import { Combobox } from "@/ui/patterns/combobox/combobox";

import type { ProjectTranslate } from "../project-copy/project-copy.types";
import { PROJECT_FILTER_DIALOG_COPY_NAMESPACE } from "./project-filter-dialog.copy";
import type { SearchFilterClientsCall } from "./project-filter-dialog.types";
import { useFilterClientSearch } from "./use-filter-client-search";

const describe = (t: ProjectTranslate, client: FilterClientOption) => ({
  label: client.isArchived ? t("filterArchivedClient", { name: client.name }) : client.name,
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
  const t = useTranslations(PROJECT_FILTER_DIALOG_COPY_NAMESPACE);
  const [text, setText] = useState(initialClient?.name ?? "");
  const describeItem = (client: FilterClientOption) => describe(t, client);
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
      label={t("filterClient")}
      placeholder={t("filterClientPlaceholder")}
      items={items}
      selectedId={clientId}
      inputValue={text}
      onInputChange={handleInput}
      onSelect={handleSelect}
      renderItem={describeItem}
      groupLabel={t("filterClientGroup", { count: items.length })}
    />
  );
}
