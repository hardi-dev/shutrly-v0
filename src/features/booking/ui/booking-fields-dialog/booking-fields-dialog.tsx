"use client";
/* eslint-disable max-lines-per-function -- responsive dialog shell plus the field form share one submit flow */

import { useState } from "react";

import type { ProjectFieldRecord } from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { BookingValue } from "@/features/booking/domain/booking-field-value/booking-field-value.types";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";

import { BookingFieldInput } from "../booking-field-input/booking-field-input";
import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { SubmitErrors } from "../project-edit/project-edit.types";
import { projectFieldErrorText } from "../project-field-error/project-field-error";

/** Ubah field booking: the snapshotted fields by type; names and types never change (AC-PRJ-017). */
export function BookingFieldsDialog({
  isOpen,
  onOpenChange,
  fields,
  onSubmit,
}: Readonly<{
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  fields: readonly ProjectFieldRecord[];
  onSubmit: (values: Record<string, BookingValue>) => Promise<SubmitErrors>;
}>) {
  const isMobile = useMobileViewport();
  const [values, setValues] = useState<Record<string, BookingValue>>(() =>
    Object.fromEntries(fields.map((field) => [field.key, field.value])),
  );
  const [errors, setErrors] = useState<Readonly<Record<string, string>>>({});
  const [isPending, setIsPending] = useState(false);
  const submit = async () => {
    setIsPending(true);
    try {
      const result = await onSubmit(values);
      if (result === null) onOpenChange(false);
      else {
        setErrors(
          Object.fromEntries(
            Object.entries(result).map(([path, key]) => {
              const field = fields.find((candidate) => path === `fieldValues.${candidate.key}`);
              return [path, projectFieldErrorText(path, key, field?.name)];
            }),
          ),
        );
      }
    } finally {
      setIsPending(false);
    }
  };
  const changeValue = (key: string, next: BookingValue) => {
    setValues((current) => ({ ...current, [key]: next }));
  };
  const handleSave = () => {
    void submit();
  };
  const handleCancel = () => {
    onOpenChange(false);
  };
  const save = (
    <Button
      isPending={isPending}
      onPress={handleSave}
      size={isMobile ? "lg" : "md"}
      className="max-md:w-full"
    >
      {PROJECT_COPY.itemSave}
    </Button>
  );
  const body = (
    <div className="flex flex-col gap-(--space-4)">
      {fields.map((field) => (
        <FieldRow
          key={field.key}
          field={field}
          value={values[field.key] ?? null}
          errorMessage={errors[`fieldValues.${field.key}`]}
          onChange={changeValue}
        />
      ))}
    </div>
  );
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={PROJECT_COPY.fieldsDialogTitle}
        description={PROJECT_COPY.fieldsDialogDescription}
        variant="form"
        actions={save}
      >
        {body}
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={PROJECT_COPY.fieldsDialogTitle}
      description={PROJECT_COPY.fieldsDialogDescription}
      size="md"
      actions={
        <>
          <Button variant="secondary" onPress={handleCancel}>
            {PROJECT_COPY.itemCancel}
          </Button>
          {save}
        </>
      }
    >
      {body}
    </Modal>
  );
}
function FieldRow({
  field,
  value,
  errorMessage,
  onChange,
}: Readonly<{
  field: ProjectFieldRecord;
  value: BookingValue;
  errorMessage: string | undefined;
  onChange: (key: string, value: BookingValue) => void;
}>) {
  const handleChange = (next: BookingValue) => {
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
/* eslint-enable max-lines-per-function -- responsive dialog shell plus the field form share one submit flow */
