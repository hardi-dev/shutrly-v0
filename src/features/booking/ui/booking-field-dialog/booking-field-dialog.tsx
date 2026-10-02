"use client";

import { useState } from "react";

import type { FieldType } from "@/features/booking/domain/booking-field/booking-field.types";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Select } from "@/ui/patterns/select/select";
import { Button } from "@/ui/primitives/button/button";
import { Switch } from "@/ui/primitives/switch/switch";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { CatalogFieldError } from "../catalog-field-error/catalog-field-error";
import type {
  BookingFieldDialogProps,
  BookingFieldFieldsProps,
  ResponsiveFieldDialogProps,
} from "./booking-field-dialog.types";

const FIELD_TYPE_OPTIONS: readonly { readonly id: FieldType; readonly label: string }[] = [
  { id: "TEXT", label: "Teks" },
  { id: "TEXTAREA", label: "Teks panjang" },
  { id: "NUMBER", label: "Angka" },
  { id: "DATE", label: "Tanggal" },
  { id: "BOOLEAN", label: "Ya/Tidak" },
  { id: "SELECT", label: "Pilihan" },
];
function noop(): void {}

export function BookingFieldDialog(props: Readonly<BookingFieldDialogProps>) {
  const form = useBookingFieldForm(props);
  const content = <BookingFieldFields {...form} />;
  function handleSubmit(): void {
    void form.submit();
  }
  const save = (
    <Button onPress={handleSubmit} isPending={form.pending}>
      {CATALOG_COPY.add}
    </Button>
  );
  return <ResponsiveFieldDialog {...props} content={content} save={save} />;
}

function useBookingFieldForm({
  workspaceId,
  serviceId,
  onOpenChange,
  action,
}: Readonly<BookingFieldDialogProps>) {
  const [name, setName] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("TEXT");
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  async function submit(): Promise<void> {
    setPending(true);
    setError(undefined);
    try {
      const values = {
        name,
        fieldType,
        isRequired: required,
        options: fieldType === "SELECT" ? options.split(",").map((item) => item.trim()) : null,
      };
      const result = await action(workspaceId, serviceId, values);
      if (result?.ok === false) {
        setError(result.fieldErrors.name ?? result.fieldErrors.options);
        return;
      }
      onOpenChange(false);
    } catch {
      setError("SAVE_FAILED");
    } finally {
      setPending(false);
    }
  }
  return {
    name,
    setName,
    fieldType,
    setFieldType,
    required,
    setRequired,
    options,
    setOptions,
    error,
    pending,
    submit,
  };
}

function BookingFieldFields({
  name,
  setName,
  fieldType,
  setFieldType,
  required,
  setRequired,
  options,
  setOptions,
  error,
}: Readonly<BookingFieldFieldsProps>) {
  function changeType(id: string): void {
    const selected = FIELD_TYPE_OPTIONS.find((item) => item.id === id);
    if (selected) setFieldType(selected.id);
    if (id !== "SELECT") setOptions("");
  }
  return (
    <div className="flex flex-col gap-(--space-4)">
      <TextField
        label={CATALOG_COPY.fieldName}
        name="name"
        onBlur={noop}
        value={name}
        onChange={setName}
      />
      <Select
        label={CATALOG_COPY.fieldType}
        value={fieldType}
        options={FIELD_TYPE_OPTIONS}
        onChange={changeType}
      />
      {fieldType === "SELECT" ? (
        <TextField
          label={CATALOG_COPY.options}
          name="options"
          onBlur={noop}
          value={options}
          onChange={setOptions}
          description={CATALOG_COPY.addOption}
        />
      ) : null}
      <Switch label={CATALOG_COPY.requiredSwitch} isSelected={required} onChange={setRequired} />
      <CatalogFieldError errorKey={error} />
    </div>
  );
}

function ResponsiveFieldDialog({
  isOpen,
  onOpenChange,
  content,
  save,
}: Readonly<ResponsiveFieldDialogProps>) {
  const mobile = useMobileViewport();
  if (mobile)
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={CATALOG_COPY.addFieldTitle}
        description={CATALOG_COPY.fieldDialogDescription}
        variant="form"
        actions={save}
      >
        {content}
      </BottomSheet>
    );
  function close(): void {
    onOpenChange(false);
  }
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={CATALOG_COPY.addFieldTitle}
      description={CATALOG_COPY.fieldDialogDescription}
      size="sm"
      actions={
        <>
          <Button variant="secondary" onPress={close}>
            {CATALOG_COPY.cancel}
          </Button>
          {save}
        </>
      }
    >
      {content}
    </Modal>
  );
}
