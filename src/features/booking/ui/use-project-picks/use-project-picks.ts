"use client";

import { useMemo, useRef, useState } from "react";

import type {
  ClientOption,
  ServiceOptionGroup,
  ServiceSnapshotSource,
} from "@/features/booking/application/ports/project-repository/project-repository.port";
import { formatIdrNumber } from "@/features/booking/domain/idr-amount/idr-amount";
import { defaultProjectTitle } from "@/features/booking/domain/project-record/project-record";

import type {
  CreateForm,
  ProjectPicks,
} from "../use-create-project-form/use-create-project-form.types";

/** Holds the picked client and service and fills the title, price, items and booking values from them (AC-PRJ-007). @param form - the create form @param serviceGroups - the active services @returns the picks and their handlers */
export function useProjectPicks(
  form: CreateForm,
  serviceGroups: readonly ServiceOptionGroup[],
): ProjectPicks {
  const [client, setClient] = useState<ClientOption | null>(null);
  const isTitleEdited = useRef(false);
  const services = useMemo(() => serviceGroups.flatMap((group) => group.services), [serviceGroups]);
  const serviceId = form.watch("serviceId");
  const service = services.find((candidate) => candidate.id === serviceId) ?? null;

  const refreshTitle = (
    nextService: ServiceSnapshotSource | null,
    nextClient: ClientOption | null,
  ) => {
    if (isTitleEdited.current || !nextService || !nextClient) return;
    form.setValue("title", defaultProjectTitle(nextService.name, nextClient.name));
  };
  const selectClient = (option: ClientOption) => {
    setClient(option);
    form.setValue("clientId", option.id);
    form.clearErrors("clientId");
    refreshTitle(service, option);
  };
  const selectService = (id: string) => {
    const next = services.find((candidate) => candidate.id === id);
    if (!next) return;
    form.setValue("serviceId", id);
    form.setValue("agreedPrice", formatIdrNumber(next.basePrice));
    form.setValue(
      "items",
      next.items.map((item) => ({ definitionId: item.definitionId, value: item.value })),
    );
    form.setValue("fieldValues", {});
    form.clearErrors(["serviceId", "agreedPrice", "fieldValues"]);
    refreshTitle(next, client);
  };
  const changeTitle = (title: string) => {
    isTitleEdited.current = true;
    form.setValue("title", title);
  };
  return { client, service, selectClient, selectService, changeTitle };
}
