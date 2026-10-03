"use client";

import { formatIdr } from "@/features/booking/domain/idr-amount/idr-amount";
import { Select } from "@/ui/patterns/select/select";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { ServicePickerProps } from "./service-picker.types";

/** Picks one active service, grouped by category, with its base price as the helper (AC-PRJ-006). */
export function ServicePicker(props: Readonly<ServicePickerProps>) {
  const options = props.serviceGroups.flatMap((group) =>
    group.services.map((service) => ({
      id: service.id,
      label: service.name,
      section: group.categoryName,
    })),
  );
  const selected = props.serviceGroups
    .flatMap((group) => group.services)
    .find((service) => service.id === props.value);
  return (
    <Select
      label={PROJECT_COPY.serviceLabel}
      placeholder={PROJECT_COPY.servicePlaceholder}
      options={options}
      value={props.value}
      onChange={props.onChange}
      description={
        selected
          ? PROJECT_COPY.serviceHelper(selected.categoryName, formatIdr(selected.basePrice))
          : undefined
      }
      errorMessage={props.errorMessage}
      isDisabled={props.isDisabled}
    />
  );
}
