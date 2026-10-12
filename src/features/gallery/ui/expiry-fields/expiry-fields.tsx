"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { DateField } from "@/ui/patterns/date-field/date-field";
import { RadioGroup } from "@/ui/primitives/radio/radio-group";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { galleryErrorText } from "../gallery-error-text/gallery-error-text";
import { EXPIRY_FIELDS_COPY_NAMESPACE } from "./expiry-fields.copy";
import type { ExpiryFieldsProps, ExpiryTranslate } from "./expiry-fields.types";

const DEFAULT_DAYS = 30;
function expiryOptions(t: ExpiryTranslate) {
  return [
    { value: "NONE", label: t("expiryOptionNone") },
    { value: "DATE", label: t("expiryOptionDate") },
    { value: "DAYS", label: t("expiryOptionDays") },
  ];
}
const noop = () => undefined;

/** The expiry radio group of *Buat galeri* and *Kedaluwarsa galeri*: none, a date or a number of days (BR-GAL-005, A-4). */
export function ExpiryFields({ value, onChange, ...props }: Readonly<ExpiryFieldsProps>) {
  const t = useTranslations(EXPIRY_FIELDS_COPY_NAMESPACE);
  const [daysText, setDaysText] = useState(value.type === "DAYS" ? String(value.days) : "");
  const handleType = (type: string) => {
    if (type === "DATE") onChange({ type: "DATE", date: "" });
    else if (type === "DAYS") {
      setDaysText(String(DEFAULT_DAYS));
      onChange({ type: "DAYS", days: DEFAULT_DAYS });
    } else onChange({ type: "NONE" });
  };
  const handleDate = (date: string | null) => {
    onChange({ type: "DATE", date: date ?? "" });
  };
  const handleDays = (text: string) => {
    setDaysText(text);
    onChange({ type: "DAYS", days: text.trim() === "" ? Number.NaN : Number(text) });
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
        <TextField
          label={t("expiryDaysLabel")}
          name="expiryDays"
          type="text"
          value={daysText}
          onChange={handleDays}
          onBlur={noop}
          description={props.daysHelper}
          errorMessage={galleryErrorText(t, props.daysError)}
        />
      ) : null}
    </div>
  );
}
