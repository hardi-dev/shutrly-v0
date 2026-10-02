"use client";

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Select } from "@/ui/patterns/select/select";
import type { SelectOption } from "@/ui/patterns/select/select.types";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { Switch } from "@/ui/primitives/switch/switch";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { CatalogFieldError } from "../catalog-field-error/catalog-field-error";
import { showCatalogSaveFailure } from "../catalog-save-feedback/catalog-save-feedback";
import type {
  ItemDefinitionDialogProps,
  ItemDefinitionFieldsProps,
  ItemDefinitionSubmitArgs,
  ResponsiveItemDefinitionDialogProps,
} from "./item-definition-dialog.types";

const VALUE_OPTIONS: readonly SelectOption[] = [
  {
    id: "NUMBER",
    label: CATALOG_COPY.valueTypes.NUMBER,
    description: CATALOG_COPY.valueTypeDescriptions.NUMBER,
    icon: "hash",
  },
  {
    id: "RANGE",
    label: CATALOG_COPY.valueTypes.RANGE,
    description: CATALOG_COPY.valueTypeDescriptions.RANGE,
    icon: "move-horizontal",
  },
];
const SELECTION_OPTIONS: readonly SelectOption[] = [
  {
    id: "EDIT",
    label: CATALOG_COPY.selectionTypes.EDIT,
    description: CATALOG_COPY.selectionTypeDescriptions.EDIT,
    icon: "image",
  },
  {
    id: "PRINT",
    label: CATALOG_COPY.selectionTypes.PRINT,
    description: CATALOG_COPY.selectionTypeDescriptions.PRINT,
    icon: "printer",
  },
];
function noop(): void {}

export function ItemDefinitionDialog(props: Readonly<ItemDefinitionDialogProps>) {
  const form = useItemDefinitionForm(props);
  const content = <ItemDefinitionFields {...form} />;
  function handleSubmit(): void {
    void form.submit();
  }
  const save = (
    <Button onPress={handleSubmit} isPending={form.pending}>
      {CATALOG_COPY.save}
    </Button>
  );
  const title = props.definition
    ? CATALOG_COPY.definitionDialogEditTitle
    : CATALOG_COPY.definitionDialogAddTitle;
  return <ResponsiveItemDefinitionDialog {...props} title={title} content={content} save={save} />;
}

function useItemDefinitionForm(props: Readonly<ItemDefinitionDialogProps>) {
  const { workspaceId, definition, onOpenChange, action, updateAction } = props;
  const [name, setName] = useState(definition?.name ?? "");
  const [valueType, setValueType] = useState<"NUMBER" | "RANGE">(definition?.valueType ?? "NUMBER");
  const [unit, setUnit] = useState(definition?.unit ?? "");
  const [selectionRequired, setSelectionRequired] = useState(
    definition?.selectionRequired ?? false,
  );
  const [selectionType, setSelectionType] = useState<"EDIT" | "PRINT" | null>(
    definition?.selectionType ?? null,
  );
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  async function submit(): Promise<void> {
    await submitItemDefinition({
      workspaceId,
      definition,
      name,
      valueType,
      unit,
      selectionRequired,
      selectionType,
      updateAction,
      action,
      onOpenChange,
      setError,
      setPending,
    });
  }
  return {
    name,
    setName,
    valueType,
    setValueType,
    unit,
    setUnit,
    selectionRequired,
    setSelectionRequired,
    selectionType,
    setSelectionType,
    locked: Boolean(definition?.usageCount),
    error,
    pending,
    submit,
  };
}

async function submitItemDefinition(args: ItemDefinitionSubmitArgs): Promise<void> {
  const {
    workspaceId,
    definition,
    name,
    valueType,
    unit,
    selectionRequired,
    selectionType,
    updateAction,
    action,
    onOpenChange,
    setError,
    setPending,
  } = args;
  setPending(true);
  setError(undefined);
  try {
    const values = {
      name,
      valueType,
      unit,
      selectionRequired,
      selectionType: selectionRequired ? selectionType : null,
    };
    const result =
      definition && updateAction
        ? await updateAction(workspaceId, definition.id, values)
        : await action(workspaceId, values);
    if (result?.ok === false) {
      setError(
        result.fieldErrors.name ?? result.fieldErrors.valueType ?? result.fieldErrors.selectionType,
      );
      return;
    }
    onOpenChange(false);
    showToast({ tone: "success", title: CATALOG_COPY.savedToast });
  } catch {
    showCatalogSaveFailure({ setError, retry: () => void submitItemDefinition(args) });
  } finally {
    setPending(false);
  }
}

function ItemDefinitionFields({
  name,
  setName,
  valueType,
  setValueType,
  unit,
  setUnit,
  selectionRequired,
  setSelectionRequired,
  selectionType,
  setSelectionType,
  locked,
  error,
}: Readonly<ItemDefinitionFieldsProps>) {
  return (
    <div className="flex flex-col gap-(--space-4)">
      <TextField
        label={CATALOG_COPY.nameItem}
        name="name"
        onBlur={noop}
        value={name}
        onChange={setName}
        errorMessage={error === "NAME_TAKEN" ? CATALOG_COPY.errors.NAME_TAKEN : undefined}
      />
      <TextField
        label={CATALOG_COPY.unit}
        name="unit"
        onBlur={noop}
        value={unit}
        onChange={setUnit}
        isOptional
        description={CATALOG_COPY.unitHelp}
      />
      <DefinitionTypeFields
        valueType={valueType}
        setValueType={setValueType}
        selectionRequired={selectionRequired}
        setSelectionRequired={setSelectionRequired}
        selectionType={selectionType}
        setSelectionType={setSelectionType}
        locked={locked}
      />
      <CatalogFieldError errorKey={error} />
    </div>
  );
}

function DefinitionTypeFields({
  valueType,
  setValueType,
  selectionRequired,
  setSelectionRequired,
  selectionType,
  setSelectionType,
  locked,
}: Readonly<
  Pick<
    ItemDefinitionFieldsProps,
    | "valueType"
    | "setValueType"
    | "selectionRequired"
    | "setSelectionRequired"
    | "selectionType"
    | "setSelectionType"
    | "locked"
  >
>) {
  function changeValueType(id: string): void {
    setValueType(id === "RANGE" ? "RANGE" : "NUMBER");
  }
  return (
    <>
      <Select
        label={CATALOG_COPY.valueType}
        value={valueType}
        isDisabled={locked || selectionRequired}
        description={locked ? CATALOG_COPY.lockedDefinitionDescription : undefined}
        options={VALUE_OPTIONS}
        onChange={changeValueType}
      />
      <DefinitionSelectionFields
        selectionRequired={selectionRequired}
        setSelectionRequired={setSelectionRequired}
        selectionType={selectionType}
        setSelectionType={setSelectionType}
        locked={locked}
      />
    </>
  );
}

function DefinitionSelectionFields({
  selectionRequired,
  setSelectionRequired,
  selectionType,
  setSelectionType,
  locked,
}: Readonly<
  Pick<
    ItemDefinitionFieldsProps,
    "selectionRequired" | "setSelectionRequired" | "selectionType" | "setSelectionType" | "locked"
  >
>) {
  function changeSelectionType(id: string): void {
    setSelectionType(id === "PRINT" ? "PRINT" : "EDIT");
  }
  function changeSelection(selected: boolean): void {
    setSelectionRequired(selected);
    if (!selected) setSelectionType("EDIT");
  }
  return (
    <>
      <Switch
        label={CATALOG_COPY.selectionSwitch}
        isSelected={selectionRequired}
        isDisabled={locked}
        onChange={changeSelection}
      />
      {selectionRequired ? (
        <Select
          label={CATALOG_COPY.selectionType}
          value={selectionType}
          isDisabled={locked}
          options={SELECTION_OPTIONS}
          onChange={changeSelectionType}
        />
      ) : null}
    </>
  );
}

function ResponsiveItemDefinitionDialog({
  isOpen,
  onOpenChange,
  title,
  content,
  save,
}: Readonly<ResponsiveItemDefinitionDialogProps>) {
  const mobile = useMobileViewport();
  if (mobile)
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={title}
        description={CATALOG_COPY.definitionDialogDescription}
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
      description={CATALOG_COPY.definitionDialogDescription}
      size="md"
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
