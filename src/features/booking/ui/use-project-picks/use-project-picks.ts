"use client";
/* eslint-disable max-lines-per-function -- one hook owns the picks and everything they prefill */

import { useMemo, useRef, useState } from "react";

import type {
  ClientOption,
  ServiceOptionGroup,
  ServiceSnapshotSource,
} from "@/features/booking/application/ports/project-repository/project-repository.port";
import { formatIdrNumber } from "@/features/booking/domain/idr-amount/idr-amount";
import { nextProjectTitle } from "@/features/booking/domain/project-record/project-record";

import { isPackageEdited, reducePackageDraft } from "../use-create-project-form/package-draft";
import type { DraftItem } from "../use-create-project-form/package-draft.types";
import type {
  CreateForm,
  ProjectPicks,
} from "../use-create-project-form/use-create-project-form.types";
import { usePackageDraft } from "./use-package-draft";

/** Holds the picked client and service and fills the title, price, items and booking values from them (AC-PRJ-007). @param form - the create form @param serviceGroups - the active services @returns the picks and their handlers */
export function useProjectPicks(
  form: CreateForm,
  serviceGroups: readonly ServiceOptionGroup[],
): ProjectPicks {
  const [client, setClient] = useState<ClientOption | null>(null);
  const lastDefault = useRef<string | null>(null);
  const { items, applyItems, dispatchPackage } = usePackageDraft(form);
  const [pendingServiceId, setPendingServiceId] = useState<string | null>(null);
  const services = useMemo(() => serviceGroups.flatMap((group) => group.services), [serviceGroups]);
  const serviceId = form.watch("serviceId");
  const service = services.find((candidate) => candidate.id === serviceId) ?? null;

  const refreshTitle = (
    nextService: ServiceSnapshotSource | null,
    nextClient: ClientOption | null,
  ) => {
    const currentTitle = form.getValues("title");
    const next = nextProjectTitle({
      currentTitle,
      lastDefault: lastDefault.current,
      serviceName: nextService?.name ?? null,
      clientName: nextClient?.name ?? null,
    });
    lastDefault.current = next.lastDefault;
    if (next.title !== currentTitle) form.setValue("title", next.title);
  };
  const selectClient = (option: ClientOption) => {
    setClient(option);
    form.setValue("clientId", option.id);
    form.clearErrors("clientId");
    refreshTitle(service, option);
  };
  const applyService = (id: string) => {
    const next = services.find((candidate) => candidate.id === id);
    if (!next) return;
    form.setValue("serviceId", id);
    form.setValue("agreedPrice", formatIdrNumber(next.basePrice));
    applyItems(reducePackageDraft(items, { type: "RESET", serviceItems: toDraftItems(next) }));
    form.setValue("fieldValues", {});
    form.clearErrors(["serviceId", "agreedPrice", "fieldValues"]);
    refreshTitle(next, client);
  };
  const selectService = (id: string) => {
    if (service && id !== service.id && isPackageEdited(items, toDraftItems(service))) {
      setPendingServiceId(id);
      return;
    }
    applyService(id);
  };
  const confirmServiceChange = () => {
    if (pendingServiceId !== null) applyService(pendingServiceId);
    setPendingServiceId(null);
  };
  const cancelServiceChange = () => {
    setPendingServiceId(null);
  };
  const pendingService = services.find((candidate) => candidate.id === pendingServiceId) ?? null;
  const changeTitle = (title: string) => {
    form.setValue("title", title);
  };
  return {
    client,
    service,
    selectClient,
    selectService,
    changeTitle,
    items,
    dispatchPackage,
    pendingService,
    confirmServiceChange,
    cancelServiceChange,
  };
}

function toDraftItems(service: ServiceSnapshotSource): readonly DraftItem[] {
  return service.items.map((item) => ({
    definitionId: item.definitionId,
    name: item.definitionName,
    unit: item.unit,
    valueType: item.valueType,
    selectionRequired: item.selectionRequired,
    pickMode: item.pickMode,
    allowsPickNotes: item.allowsPickNotes,
    value: item.value,
  }));
}
/* eslint-enable max-lines-per-function -- one hook owns the picks and everything they prefill */
