"use client";

import { useState } from "react";

import type { ItemDefinitionRecord } from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Select } from "@/ui/patterns/select/select";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { CatalogFieldError } from "../catalog-field-error/catalog-field-error";
import type {
  ResponsiveItemDialogProps,
  ServiceItemDialogProps,
  ServiceItemFieldsProps,
  ServiceItemSubmitArgs,
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
      {CATALOG_COPY.add}
    </Button>
  );
  return <ResponsiveItemDialog {...props} content={content} save={save} />;
}

function useServiceItemForm({
  workspaceId,
  serviceId,
  items,
  definitions,
  onOpenChange,
  action,
}: Readonly<ServiceItemDialogProps>) {
  const [definitionId, setDefinitionId] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  async function submit(): Promise<void> {
    await submitServiceItem({
      workspaceId,
      serviceId,
      definitionId,
      definitions,
      value,
      minimum,
      maximum,
      action,
      onOpenChange,
      setError,
      setPending,
    });
  }
  const used = new Set(items.map((item) => item.definitionId));
  return {
    definitionId,
    setDefinitionId,
    value,
    setValue,
    minimum,
    setMinimum,
    maximum,
    setMaximum,
    error,
    pending,
    submit,
    used,
  };
}

async function submitServiceItem({
  workspaceId,
  serviceId,
  definitionId,
  definitions,
  value,
  minimum,
  maximum,
  action,
  onOpenChange,
  setError,
  setPending,
}: ServiceItemSubmitArgs): Promise<void> {
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
    const result = await action(workspaceId, serviceId, { definitionId, value: packageValue });
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
  } catch {
    setError("SAVE_FAILED");
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
          value={minimum}
          onChange={setMinimum}
        />
        <TextField
          label={CATALOG_COPY.maximum}
          name="maximum"
          onBlur={noop}
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
}: Readonly<ResponsiveItemDialogProps>) {
  const mobile = useMobileViewport();
  if (mobile)
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={CATALOG_COPY.addItemTitle}
        description={CATALOG_COPY.addItemDescription}
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
      title={CATALOG_COPY.addItemTitle}
      description={CATALOG_COPY.addItemDescription}
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
