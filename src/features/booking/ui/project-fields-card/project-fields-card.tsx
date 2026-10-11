"use client";

import { useTranslations } from "next-intl";

import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { BookingFieldInput } from "../booking-field-input/booking-field-input";
import { PROJECT_FIELDS_CARD_COPY_NAMESPACE } from "./project-fields-card.copy";
import type { BookingFieldRowProps, ProjectFieldsCardProps } from "./project-fields-card.types";

/** The booking fields snapshotted from the service; the card is hidden when the service has none (Owner 2026-10-02). */
export function ProjectFieldsCard(props: Readonly<ProjectFieldsCardProps>) {
  const t = useTranslations(PROJECT_FIELDS_CARD_COPY_NAMESPACE);
  if (props.fields.length === 0) return null;
  return (
    <SectionCard
      title={t("fieldsTitle")}
      description={t("fieldsDescription", { serviceName: props.serviceName })}
    >
      {props.fields.map((field) => (
        <BookingFieldRow
          key={field.key}
          field={field}
          value={props.values[field.key] ?? null}
          errorMessage={props.errors[field.key]}
          onChange={props.onChange}
        />
      ))}
    </SectionCard>
  );
}

function BookingFieldRow({ field, value, errorMessage, onChange }: Readonly<BookingFieldRowProps>) {
  const handleChange = (next: BookingFieldRowProps["value"]) => {
    onChange(field.key, next);
  };
  return (
    <BookingFieldInput
      field={field}
      value={value}
      onChange={handleChange}
      errorMessage={errorMessage}
    />
  );
}
