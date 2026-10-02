"use client";

import { useState } from "react";

import type { ItemDefinitionRecord } from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Select } from "@/ui/patterns/select/select";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { CatalogFieldError } from "../catalog-field-error/catalog-field-error";
import { showCatalogSaveFailure } from "../catalog-save-feedback/catalog-save-feedback";
import type {
  ResponsiveItemDialogProps,
  ServiceItemDialogProps,
  ServiceItemFieldsProps,
  ServiceItemSubmitArgs,
  ServiceItemValueState,
} from "./service-item-dialog.types";

function noop(): void {}

export function ServiceItemDialog(props: Readonly<ServiceItemDialogProps>) {
  const form = useServiceItemForm(props);
  const content = <ServiceItemFields {...form} definitions={props.definitions} />;
  function handleSubmit(): void {
    void form.submit();
  }
  const save = (
    <Button onPress={handleSubmit} isPending={form.pending}>
      {props.item ? CATALOG_COPY.save : CATALOG_COPY.add}
    </Button>
  );
  return (
    <ResponsiveItemDialog
      {...props}
      onOpenChange={form.handleOpenChange}
      content={content}
      save={save}
      title={props.item ? CATALOG_COPY.editItemValue : CATALOG_COPY.addItemTitle}
      description={CATALOG_COPY.addItemDescription}
    />
  );
}

function useServiceItemForm({
  workspaceId,
  serviceId,
  items,
  definitions,
  item,
  onOpenChange,
  action,
  updateAction,
}: Readonly<ServiceItemDialogProps>) {
  const state = useServiceItemValues(item);
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  function handleOpenChange(isOpen: boolean): void {
    if (!isOpen) {
      state.reset();
      setError(undefined);
    }
    onOpenChange(isOpen);
  }
  async function submit(): Promise<void> {
    await submitServiceItem({
      workspaceId,
      serviceId,
      definitionId: state.definitionId,
      item,
      definitions,
      value: state.value,
      minimum: state.minimum,
      maximum: state.maximum,
      action,
      updateAction,
      onOpenChange: handleOpenChange,
      setError,
      setPending,
    });
  }
  const used = new Set(
    items.filter((entry) => entry.id !== item?.id).map((entry) => entry.definitionId),
  );
  return {
    ...state,
    error,
    pending,
    submit,
    handleOpenChange,
    used,
    isEditing: Boolean(item),
  };
}

function useServiceItemValues(item: ServiceItemDialogProps["item"]): ServiceItemValueState {
  const initialDefinitionId = item?.definitionId ?? null;
  const initialValue = item?.value.type === "NUMBER" ? item.value.value : "";
  const initialMinimum = item?.value.type === "RANGE" ? item.value.min : "";
  const initialMaximum = item?.value.type === "RANGE" ? item.value.max : "";
  const [definitionId, setDefinitionId] = useState<string | null>(initialDefinitionId);
  const [value, setValue] = useState(initialValue);
  const [minimum, setMinimum] = useState(initialMinimum);
  const [maximum, setMaximum] = useState(initialMaximum);
  function reset(): void {
    setDefinitionId(initialDefinitionId);
    setValue(initialValue);
    setMinimum(initialMinimum);
    setMaximum(initialMaximum);
  }
  return {
    definitionId,
    setDefinitionId,
    reset,
    value,
    setValue,
    minimum,
    setMinimum,
    maximum,
    setMaximum,
  };
}

async function submitServiceItem(args: ServiceItemSubmitArgs): Promise<void> {
  const {
    workspaceId,
    serviceId,
    definitionId,
    item,
    definitions,
    value,
    minimum,
    maximum,
    action,
    updateAction,
    onOpenChange,
    setError,
    setPending,
  } = args;
  const definition = definitions.find((item) => item.id === definitionId);
  if (!definitionId || !definition) {
    setError("NOT_FOUND");
    return;
  }
  setPending(true);
  setError(undefined);
  try {
    const packageValue =
      definition.valueType === "RANGE"
        ? { type: "RANGE", min: minimum, max: maximum }
        : { type: "NUMBER", value };
    const result =
      item && updateAction
        ? await updateAction(workspaceId, serviceId, item.id, { value: packageValue })
        : await action(workspaceId, serviceId, { definitionId, value: packageValue });
    if (result?.ok === false) {
      setError(
        result.fieldErrors.definitionId ??
          result.fieldErrors.value ??
          result.fieldErrors.min ??
          result.fieldErrors.max,
      );
      return;
    }
    onOpenChange(false);
    showToast({ tone: "success", title: CATALOG_COPY.savedToast });
  } catch {
    showCatalogSaveFailure({ setError, retry: () => void submitServiceItem(args) });
  } finally {
    setPending(false);
  }
}

function ServiceItemFields({
  definitions,
  definitionId,
  setDefinitionId,
  value,
  setValue,
  minimum,
  setMinimum,
  maximum,
  setMaximum,
  error,
  used,
  isEditing,
}: Readonly<ServiceItemFieldsProps>) {
  const definition = definitions.find((item) => item.id === definitionId);
  const options = definitions
    .filter((item) => item.isActive && !used.has(item.id))
    .map((item) => ({ id: item.id, label: item.name, description: item.unit ?? undefined }));
  return (
    <div className="flex flex-col gap-(--space-4)">
      <Select
        label={CATALOG_COPY.itemPicker}
        value={definitionId}
        options={options}
        isDisabled={isEditing}
        onChange={setDefinitionId}
        placeholder={CATALOG_COPY.itemPicker}
        errorMessage={
          error === "DUPLICATE_DEFINITION" ? CATALOG_COPY.errors.DUPLICATE_DEFINITION : undefined
        }
      />
      <PackageValueFields
        definition={definition}
        value={value}
        setValue={setValue}
        minimum={minimum}
        setMinimum={setMinimum}
        maximum={maximum}
        setMaximum={setMaximum}
      />
      <CatalogFieldError errorKey={error} />
    </div>
  );
}

function PackageValueFields({
  definition,
  value,
  setValue,
  minimum,
  setMinimum,
  maximum,
  setMaximum,
}: Readonly<{
  readonly definition?: ItemDefinitionRecord;
  readonly value: string;
  readonly setValue: (value: string) => void;
  readonly minimum: string;
  readonly setMinimum: (value: string) => void;
  readonly maximum: string;
  readonly setMaximum: (value: string) => void;
}>) {
  if (definition?.valueType === "RANGE")
    return (
      <div className="grid grid-cols-2 gap-(--space-3)">
        <TextField
          label={CATALOG_COPY.minimum}
          name="minimum"
          onBlur={noop}
          placeholder={CATALOG_COPY.minimumPlaceholder}
          value={minimum}
          onChange={setMinimum}
        />
        <TextField
          label={CATALOG_COPY.maximum}
          name="maximum"
          onBlur={noop}
          placeholder={CATALOG_COPY.maximumPlaceholder}
          value={maximum}
          onChange={setMaximum}
        />
      </div>
    );
  return (
    <TextField
      label={CATALOG_COPY.value}
      name="value"
      onBlur={noop}
      placeholder={CATALOG_COPY.valuePlaceholder}
      value={value}
      onChange={setValue}
      description={definition?.unit ?? undefined}
    />
  );
}

function ResponsiveItemDialog({
  isOpen,
  onOpenChange,
  content,
  save,
  title,
  description,
}: Readonly<ResponsiveItemDialogProps>) {
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
