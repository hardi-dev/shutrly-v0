"use client";

import { useState } from "react";

import { DateField } from "@/ui/patterns/date-field/date-field";
import { RadioGroup } from "@/ui/primitives/radio/radio-group";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { galleryErrorText } from "../gallery-error-text/gallery-error-text";
import type { ExpiryFieldsProps } from "./expiry-fields.types";

const DEFAULT_DAYS = 30;
const OPTIONS = [
  { value: "NONE", label: GALLERY_COPY.expiryOptionNone },
  { value: "DATE", label: GALLERY_COPY.expiryOptionDate },
  { value: "DAYS", label: GALLERY_COPY.expiryOptionDays },
];
const noop = () => undefined;

/** The expiry radio group of *Buat galeri* and *Kedaluwarsa galeri*: none, a date or a number of days (BR-GAL-005, A-4). */
export function ExpiryFields(props: Readonly<ExpiryFieldsProps>) {
  const { value, onChange } = props;
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
        label={GALLERY_COPY.expiryLabel}
        options={OPTIONS}
        value={value.type}
        onChange={handleType}
      />
      {value.type === "DATE" ? (
        <DateField
          label={GALLERY_COPY.expiryDateLabel}
          value={value.date === "" ? null : value.date}
          onChange={handleDate}
          display="weekday"
          description={GALLERY_COPY.expiryDateHelper}
          errorMessage={galleryErrorText(props.dateError)}
        />
      ) : null}
      {value.type === "DAYS" ? (
        <TextField
          label={GALLERY_COPY.expiryDaysLabel}
          name="expiryDays"
          type="text"
          value={daysText}
          onChange={handleDays}
          onBlur={noop}
          description={props.daysHelper}
          errorMessage={galleryErrorText(props.daysError)}
        />
      ) : null}
    </div>
  );
}
