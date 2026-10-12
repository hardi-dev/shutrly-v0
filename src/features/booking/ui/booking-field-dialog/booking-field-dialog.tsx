"use client";

import { useTranslations } from "next-intl";
import { type SyntheticEvent, useId, useState } from "react";

import type { FieldType } from "@/features/booking/domain/booking-field/booking-field.types";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Select } from "@/ui/patterns/select/select";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { Switch } from "@/ui/primitives/switch/switch";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CATALOG_FIELD_TYPE_MESSAGE_KEY } from "../catalog-copy/catalog-copy.copy";
import type { CatalogTranslate } from "../catalog-copy/catalog-copy.types";
import { CatalogFieldError } from "../catalog-field-error/catalog-field-error";
import { showCatalogSaveFailure } from "../catalog-save-feedback/catalog-save-feedback";
import { OptionListEditor } from "../option-list-editor/option-list-editor";
import { BOOKING_FIELD_DIALOG_COPY_NAMESPACE } from "./booking-field-dialog.copy";
import type {
  BookingFieldDialogProps,
  BookingFieldFieldsProps,
  BookingFieldSubmitArgs,
  BookingFieldValueState,
  ResponsiveFieldDialogProps,
} from "./booking-field-dialog.types";

const FIELD_TYPES: readonly FieldType[] = [
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "DATE",
  "BOOLEAN",
  "SELECT",
];

function fieldTypeOptions(
  t: CatalogTranslate,
): readonly { readonly id: FieldType; readonly label: string }[] {
  return FIELD_TYPES.map((id) => ({ id, label: t(CATALOG_FIELD_TYPE_MESSAGE_KEY[id]) }));
}

function noop(): void {}

function createOpenChangeHandler(
  reset: () => void,
  clearErrors: () => void,
  onOpenChange: (isOpen: boolean) => void,
): (isOpen: boolean) => void {
  return function handleOpenChange(isOpen: boolean): void {
    if (!isOpen) {
      reset();
      clearErrors();
    }
    onOpenChange(isOpen);
  };
}

export function BookingFieldDialog(props: Readonly<BookingFieldDialogProps>) {
  const t = useTranslations(BOOKING_FIELD_DIALOG_COPY_NAMESPACE);
  const formId = useId();
  const form = useBookingFieldForm(props);
  const content = <BookingFieldFields {...form} formId={formId} onFormSubmit={onFormSubmit} />;
  function onFormSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!form.pending) void form.submit();
  }
  const save = (
    <Button type="submit" form={formId} isPending={form.pending}>
      {props.field ? t("save") : t("add")}
    </Button>
  );
  return (
    <ResponsiveFieldDialog
      {...props}
      onOpenChange={form.handleOpenChange}
      content={content}
      save={save}
      title={props.field ? t("editField") : t("addFieldTitle")}
      description={t("fieldDialogDescription")}
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
  const t = useTranslations(BOOKING_FIELD_DIALOG_COPY_NAMESPACE);
  const state = useBookingFieldValues(field);
  const [error, setError] = useState<string | undefined>();
  const [optionErrors, setOptionErrors] = useState<Readonly<Record<number, string>>>({});
  const [pending, setPending] = useState(false);
  const handleOpenChange = createOpenChangeHandler(
    state.reset,
    () => {
      setError(undefined);
      setOptionErrors({});
    },
    onOpenChange,
  );
  async function submit(): Promise<void> {
    await submitBookingField({
      workspaceId,
      serviceId,
      field,
      action,
      updateAction,
      state,
      onOpenChange: handleOpenChange,
      setError,
      setOptionErrors,
      setPending,
      t,
    });
  }
  return {
    ...state,
    error,
    optionErrors,
    pending,
    submit,
    handleOpenChange,
  };
}

async function submitBookingField(args: BookingFieldSubmitArgs): Promise<void> {
  const {
    workspaceId,
    serviceId,
    field,
    action,
    updateAction,
    state,
    onOpenChange,
    setError,
    setOptionErrors,
    setPending,
    t,
  } = args;
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
    showToast({ tone: "success", title: t("savedToast") });
  } catch {
    showCatalogSaveFailure({ setError, retry: () => void submitBookingField(args), t });
  } finally {
    setPending(false);
  }
}

function useBookingFieldValues(field: BookingFieldDialogProps["field"]): BookingFieldValueState {
  const initialName = field?.name ?? "";
  const initialFieldType = field?.fieldType ?? "TEXT";
  const initialRequired = field?.isRequired ?? false;
  const initialOptions = field?.options ?? [];
  const [name, setName] = useState(initialName);
  const [fieldType, setFieldType] = useState<FieldType>(initialFieldType);
  const [required, setRequired] = useState(initialRequired);
  const [options, setOptions] = useState<readonly string[]>(initialOptions);
  function reset(): void {
    setName(initialName);
    setFieldType(initialFieldType);
    setRequired(initialRequired);
    setOptions(initialOptions);
  }
  return {
    name,
    setName,
    reset,
    fieldType,
    setFieldType,
    required,
    setRequired,
    options,
    setOptions,
  };
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
  formId,
  onFormSubmit,
}: Readonly<BookingFieldFieldsProps>) {
  const t = useTranslations(BOOKING_FIELD_DIALOG_COPY_NAMESPACE);
  const typeOptions = fieldTypeOptions(t);
  function changeType(id: string): void {
    const selected = typeOptions.find((item) => item.id === id);
    if (selected) setFieldType(selected.id);
    if (id !== "SELECT") setOptions([]);
  }
  return (
    <form id={formId} noValidate onSubmit={onFormSubmit} className="flex flex-col gap-(--space-4)">
      <TextField
        label={t("fieldName")}
        name="name"
        onBlur={noop}
        placeholder={t("fieldNamePlaceholder")}
        value={name}
        onChange={setName}
      />
      <Select
        label={t("fieldType")}
        value={fieldType}
        options={typeOptions}
        onChange={changeType}
      />
      {fieldType === "SELECT" ? (
        <OptionListEditor options={options} errors={optionErrors} onChange={setOptions} />
      ) : null}
      <Switch label={t("requiredSwitch")} isSelected={required} onChange={setRequired} />
      <CatalogFieldError errorKey={error} />
    </form>
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
  const t = useTranslations(BOOKING_FIELD_DIALOG_COPY_NAMESPACE);
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
            {t("cancel")}
          </Button>
          {save}
        </>
      }
    >
      {content}
    </Modal>
  );
}
