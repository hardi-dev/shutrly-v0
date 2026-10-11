"use client";

import { useTranslations } from "next-intl";

import { formatIdr } from "@/features/booking/domain/idr-amount/idr-amount";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { Select } from "@/ui/patterns/select/select";

import { SERVICE_PICKER_COPY_NAMESPACE } from "./service-picker.copy";
import type { ServicePickerProps } from "./service-picker.types";

/** Picks one active service, grouped by category, with its base price as the helper (AC-PRJ-006). */
export function ServicePicker(props: Readonly<ServicePickerProps>) {
  const t = useTranslations(SERVICE_PICKER_COPY_NAMESPACE);
  const locale = useFormattingLocale();
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
      label={t("serviceLabel")}
      placeholder={options.length === 0 ? t("noServiceTitle") : t("servicePlaceholder")}
      options={options}
      value={props.value}
      onChange={props.onChange}
      description={
        selected
          ? t("serviceHelper", {
              category: selected.categoryName,
              amount: formatIdr(selected.basePrice, locale),
            })
          : undefined
      }
      errorMessage={props.errorMessage}
      isDisabled={props.isDisabled || options.length === 0}
    />
  );
}
