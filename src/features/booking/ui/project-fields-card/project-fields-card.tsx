"use client";

import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { BookingFieldInput } from "../booking-field-input/booking-field-input";
import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { BookingFieldRowProps, ProjectFieldsCardProps } from "./project-fields-card.types";

/** The booking fields snapshotted from the service; the card is hidden when the service has none (Owner 2026-10-02). */
export function ProjectFieldsCard(props: Readonly<ProjectFieldsCardProps>) {
  if (props.fields.length === 0) return null;
  return (
    <SectionCard
      title={PROJECT_COPY.fieldsTitle}
      description={PROJECT_COPY.fieldsDescription(props.serviceName)}
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
