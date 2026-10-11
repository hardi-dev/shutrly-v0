"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import type { ItemDefinitionRecord } from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Select } from "@/ui/patterns/select/select";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CatalogFieldError } from "../catalog-field-error/catalog-field-error";
import { showCatalogSaveFailure } from "../catalog-save-feedback/catalog-save-feedback";
import { useLocaleReformat } from "../locale-reformat/use-locale-reformat";
import { SERVICE_ITEM_DIALOG_COPY_NAMESPACE } from "./service-item-dialog.copy";
import type {
  ResponsiveItemDialogProps,
  ServiceItemDialogProps,
  ServiceItemFieldsProps,
  ServiceItemSubmitArgs,
  ServiceItemValueState,
} from "./service-item-dialog.types";

function noop(): void {}

export function ServiceItemDialog(props: Readonly<ServiceItemDialogProps>) {
  const t = useTranslations(SERVICE_ITEM_DIALOG_COPY_NAMESPACE);
  const form = useServiceItemForm(props);
  const content = <ServiceItemFields {...form} definitions={props.definitions} />;
  function handleSubmit(): void {
    void form.submit();
  }
  const save = (
    <Button onPress={handleSubmit} isPending={form.pending}>
      {props.item ? t("save") : t("add")}
    </Button>
  );
  return (
    <ResponsiveItemDialog
      {...props}
      onOpenChange={form.handleOpenChange}
      content={content}
      save={save}
      title={props.item ? t("editItemValue") : t("addItemTitle")}
      description={t("addItemDescription")}
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
  const t = useTranslations(SERVICE_ITEM_DIALOG_COPY_NAMESPACE);
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
      t,
    });
  }
  const used = usedDefinitionIds(items, item);
  return { ...state, error, pending, submit, handleOpenChange, used, isEditing: Boolean(item) };
}

/** Definitions already used by the service's other items. */
function usedDefinitionIds(
  items: ServiceItemDialogProps["items"],
  item: ServiceItemDialogProps["item"],
): Set<string> {
  return new Set(items.filter((entry) => entry.id !== item?.id).map((entry) => entry.definitionId));
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
    t,
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
    showToast({ tone: "success", title: t("savedToast") });
  } catch {
    showCatalogSaveFailure({ setError, retry: () => void submitServiceItem(args), t });
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
  const t = useTranslations(SERVICE_ITEM_DIALOG_COPY_NAMESPACE);
  const definition = definitions.find((item) => item.id === definitionId);
  const options = definitions
    .filter((item) => item.isActive && !used.has(item.id))
    .map((item) => ({ id: item.id, label: item.name, description: item.unit ?? undefined }));
  return (
    <div className="flex flex-col gap-(--space-4)">
      <Select
        label={t("itemPicker")}
        value={definitionId}
        options={options}
        isDisabled={isEditing}
        onChange={setDefinitionId}
        placeholder={t("itemPicker")}
        errorMessage={error === "DUPLICATE_DEFINITION" ? t("errorDuplicateDefinition") : undefined}
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
  const t = useTranslations(SERVICE_ITEM_DIALOG_COPY_NAMESPACE);
  useLocaleReformat({ value, setValue, kind: "quantity" });
  if (definition?.valueType === "RANGE")
    return (
      <RangeValueFields
        minimum={minimum}
        setMinimum={setMinimum}
        maximum={maximum}
        setMaximum={setMaximum}
      />
    );
  return (
    <TextField
      label={t("value")}
      name="value"
      onBlur={noop}
      placeholder={t("valuePlaceholder")}
      value={value}
      onChange={setValue}
      description={definition?.unit ?? undefined}
    />
  );
}

function RangeValueFields({
  minimum,
  setMinimum,
  maximum,
  setMaximum,
}: Readonly<{
  readonly minimum: string;
  readonly setMinimum: (value: string) => void;
  readonly maximum: string;
  readonly setMaximum: (value: string) => void;
}>) {
  const t = useTranslations(SERVICE_ITEM_DIALOG_COPY_NAMESPACE);
  useLocaleReformat({ value: minimum, setValue: setMinimum, kind: "quantity" });
  useLocaleReformat({ value: maximum, setValue: setMaximum, kind: "quantity" });
  return (
    <div className="grid grid-cols-2 gap-(--space-3)">
      <TextField
        label={t("minimum")}
        name="minimum"
        onBlur={noop}
        placeholder={t("minimumPlaceholder")}
        value={minimum}
        onChange={setMinimum}
      />
      <TextField
        label={t("maximum")}
        name="maximum"
        onBlur={noop}
        placeholder={t("maximumPlaceholder")}
        value={maximum}
        onChange={setMaximum}
      />
    </div>
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
  const t = useTranslations(SERVICE_ITEM_DIALOG_COPY_NAMESPACE);
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
