"use client";

import { useState } from "react";

import type { FieldType } from "@/features/booking/domain/booking-field/booking-field.types";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Select } from "@/ui/patterns/select/select";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { Switch } from "@/ui/primitives/switch/switch";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { CatalogFieldError } from "../catalog-field-error/catalog-field-error";
import { showCatalogSaveFailure } from "../catalog-save-feedback/catalog-save-feedback";
import { OptionListEditor } from "../option-list-editor/option-list-editor";
import type {
  BookingFieldDialogProps,
  BookingFieldFieldsProps,
  BookingFieldValueState,
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
      {props.field ? CATALOG_COPY.save : CATALOG_COPY.add}
    </Button>
  );
  return (
    <ResponsiveFieldDialog
      {...props}
      content={content}
      save={save}
      title={props.field ? CATALOG_COPY.editField : CATALOG_COPY.addFieldTitle}
      description={CATALOG_COPY.fieldDialogDescription}
    />
  );
}

function useBookingFieldForm({
  workspaceId,
  serviceId,
  field,
  onOpenChange,
  action,
  updateAction,
}: Readonly<BookingFieldDialogProps>) {
  const state = useBookingFieldValues(field);
  const [error, setError] = useState<string | undefined>();
  const [optionErrors, setOptionErrors] = useState<Readonly<Record<number, string>>>({});
  const [pending, setPending] = useState(false);
  async function submit(): Promise<void> {
    setPending(true);
    setError(undefined);
    setOptionErrors({});
    try {
      const values = {
        name: state.name,
        fieldType: state.fieldType,
        isRequired: state.required,
        options: state.fieldType === "SELECT" ? state.options : null,
      };
      const result =
        field && updateAction
          ? await updateAction(workspaceId, serviceId, field.id, values)
          : await action(workspaceId, serviceId, values);
      if (result?.ok === false) {
        setOptionErrors(parseOptionErrors(result.fieldErrors));
        setError(result.fieldErrors.name ?? result.fieldErrors.options);
        return;
      }
      onOpenChange(false);
      showToast({ tone: "success", title: CATALOG_COPY.savedToast });
    } catch {
      showCatalogSaveFailure({ setError, retry: () => void submit() });
    } finally {
      setPending(false);
    }
  }
  return {
    ...state,
    error,
    optionErrors,
    pending,
    submit,
  };
}

function useBookingFieldValues(field: BookingFieldDialogProps["field"]): BookingFieldValueState {
  const [name, setName] = useState(field?.name ?? "");
  const [fieldType, setFieldType] = useState<FieldType>(field?.fieldType ?? "TEXT");
  const [required, setRequired] = useState(field?.isRequired ?? false);
  const [options, setOptions] = useState<readonly string[]>(field?.options ?? []);
  return { name, setName, fieldType, setFieldType, required, setRequired, options, setOptions };
}

function parseOptionErrors(
  fieldErrors: Readonly<Partial<Record<string, string>>>,
): Readonly<Record<number, string>> {
  return Object.entries(fieldErrors).reduce<Record<number, string>>((errors, [key, value]) => {
    const match = /^options\.(\d+)$/.exec(key);
    if (match && value) errors[Number(match[1])] = value;
    return errors;
  }, {});
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
  optionErrors,
  error,
}: Readonly<BookingFieldFieldsProps>) {
  function changeType(id: string): void {
    const selected = FIELD_TYPE_OPTIONS.find((item) => item.id === id);
    if (selected) setFieldType(selected.id);
    if (id !== "SELECT") setOptions([]);
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
        <OptionListEditor options={options} errors={optionErrors} onChange={setOptions} />
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
  title,
  description,
}: Readonly<ResponsiveFieldDialogProps>) {
  const mobile = useMobileViewport();
  if (mobile)
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
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
      title={title}
      description={description}
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
