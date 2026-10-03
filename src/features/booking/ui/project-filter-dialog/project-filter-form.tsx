"use client";

import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";
import { DateField } from "@/ui/patterns/date-field/date-field";
import { MultiSelect } from "@/ui/patterns/multi-select/multi-select";
import { Checkbox } from "@/ui/primitives/checkbox/checkbox";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { projectStatusChip } from "../project-status-chip/project-status-props";
import { FilterClientField } from "./filter-client-field";
import type { FilterDraftApi, ProjectFilterDialogProps } from "./project-filter-dialog.types";

const FILTER_STATUSES: readonly ProjectStatus[] = [
  "DRAFT",
  "BOOKED",
  "SHOOTING",
  "POST_PROCESSING",
  "DELIVERED",
];

function isStatus(id: string): id is ProjectStatus {
  return FILTER_STATUSES.some((status) => status === id);
}

/** The filter fields: Status (Aktif only), Jadwal, Layanan and Klien (S1a). */
export function ProjectFilterForm({
  props,
  api,
}: Readonly<{ props: ProjectFilterDialogProps; api: FilterDraftApi }>) {
  const { draft, patch } = api;
  const handleStatuses = (ids: string[]) => {
    patch({ statuses: ids.filter(isStatus) });
  };
  const handleServices = (serviceIds: string[]) => {
    patch({ serviceIds });
  };
  const handleClient = (clientId: string | null) => {
    patch({ clientId });
  };
  return (
    <div className="flex flex-col gap-(--space-4)">
      {props.tab === "ACTIVE" ? (
        <MultiSelect
          label={PROJECT_COPY.filterStatus}
          placeholder={PROJECT_COPY.filterStatusPlaceholder}
          options={FILTER_STATUSES.map((status) => ({
            id: status,
            label: projectStatusChip(status).label,
          }))}
          selectedIds={draft.statuses}
          onChange={handleStatuses}
        />
      ) : null}
      <FilterScheduleFields draft={draft} toError={api.toError} patch={patch} />
      <MultiSelect
        label={PROJECT_COPY.filterService}
        placeholder={PROJECT_COPY.filterServicePlaceholder}
        options={props.services.map((service) => ({ id: service.id, label: service.name }))}
        selectedIds={draft.serviceIds}
        onChange={handleServices}
      />
      <FilterClientField
        workspaceId={props.workspaceId}
        clientId={draft.clientId}
        initialClient={props.initialClient}
        searchAction={props.searchClientsAction}
        onChange={handleClient}
      />
    </div>
  );
}

function FilterScheduleFields({
  draft,
  toError,
  patch,
}: Readonly<Pick<FilterDraftApi, "draft" | "toError" | "patch">>) {
  const handleFrom = (from: string | null) => {
    patch({ from });
  };
  const handleTo = (to: string | null) => {
    patch({ to });
  };
  const handleNoSchedule = (includeNoSchedule: boolean) => {
    patch({ includeNoSchedule });
  };
  return (
    <fieldset className="flex flex-col gap-(--space-3)">
      <legend className="mb-(--space-2) text-(length:--font-size-label) font-semibold text-(--component-input-label)">
        {PROJECT_COPY.filterSchedule}
      </legend>
      <div className="grid grid-cols-2 items-start gap-(--space-3)">
        <DateField
          label={PROJECT_COPY.filterFrom}
          value={draft.from}
          onChange={handleFrom}
          display="date"
          placeholder={PROJECT_COPY.filterDatePlaceholder}
        />
        <DateField
          label={PROJECT_COPY.filterTo}
          value={draft.to}
          onChange={handleTo}
          display="date"
          placeholder={PROJECT_COPY.filterDatePlaceholder}
          errorMessage={toError}
        />
      </div>
      <Checkbox
        label={PROJECT_COPY.filterNoSchedule}
        isSelected={draft.includeNoSchedule}
        onChange={handleNoSchedule}
      />
    </fieldset>
  );
}
