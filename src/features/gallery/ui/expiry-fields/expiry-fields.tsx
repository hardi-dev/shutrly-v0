"use client";

import { useTranslations } from "next-intl";

import { GALLERY_EXPIRY_PRESETS } from "@/features/gallery/domain/gallery-expiry/gallery-expiry";
import { DateField } from "@/ui/patterns/date-field/date-field";
import { Select } from "@/ui/patterns/select/select";
import type { SelectOption } from "@/ui/patterns/select/select.types";
import { RadioGroup } from "@/ui/primitives/radio/radio-group";

import { galleryErrorText } from "../gallery-error-text/gallery-error-text";
import { EXPIRY_FIELDS_COPY_NAMESPACE } from "./expiry-fields.copy";
import type { ExpiryFieldsProps, ExpiryTranslate } from "./expiry-fields.types";

/** The preset chosen when the Owner switches to a number of days (design D1, AC-GFL-010). */
const DEFAULT_DAYS = 14;

function expiryOptions(t: ExpiryTranslate) {
  return [
    { value: "NONE", label: t("expiryOptionNone") },
    { value: "DATE", label: t("expiryOptionDate") },
    { value: "DAYS", label: t("expiryOptionDays") },
  ];
}

function durationOptions(t: ExpiryTranslate): SelectOption[] {
  return GALLERY_EXPIRY_PRESETS.map((days) => ({
    id: String(days),
    label: t("expiryPreset", { count: days }),
  }));
}

/** The expiry fields of *Kedaluwarsa galeri*: none, a date, or a duration picked from the presets (BR-GAL-005, A-1, A-4, AC-GFL-010, 011). @param props - the choice, its change handler, the field errors and the helper under the duration @returns the fields */
export function ExpiryFields({ value, onChange, ...props }: Readonly<ExpiryFieldsProps>) {
  const t = useTranslations(EXPIRY_FIELDS_COPY_NAMESPACE);
  const handleType = (type: string) => {
    if (type === "DATE") onChange({ type: "DATE", date: "" });
    else if (type === "DAYS") onChange({ type: "DAYS", days: DEFAULT_DAYS });
    else onChange({ type: "NONE" });
  };
  const handleDate = (date: string | null) => {
    onChange({ type: "DATE", date: date ?? "" });
  };
  const handleDuration = (id: string) => {
    onChange({ type: "DAYS", days: Number(id) });
  };
  return (
    <div className="flex flex-col gap-(--space-3)">
      <RadioGroup
        label={t("expiryLabel")}
        options={expiryOptions(t)}
        value={value.type}
        onChange={handleType}
      />
      {value.type === "DATE" ? (
        <DateField
          label={t("expiryDateLabel")}
          value={value.date === "" ? null : value.date}
          onChange={handleDate}
          display="weekday"
          description={t("expiryDateHelper")}
          errorMessage={galleryErrorText(t, props.dateError)}
        />
      ) : null}
      {value.type === "DAYS" ? (
        <Select
          label={t("expiryDurationLabel")}
          name="expiryDays"
          options={durationOptions(t)}
          value={String(value.days)}
          onChange={handleDuration}
          description={props.daysHelper}
          errorMessage={galleryErrorText(t, props.daysError)}
        />
      ) : null}
    </div>
  );
}
