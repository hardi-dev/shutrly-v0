"use client";

import { useState } from "react";

import type { PickMode } from "@/features/booking/domain/item-definition-type/item-definition-type.types";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Alert } from "@/ui/patterns/alert/alert";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { OptionCardGroup } from "@/ui/patterns/option-card/option-card-group";
import type { OptionCardOption } from "@/ui/patterns/option-card/option-card-group.types";
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
  DefinitionSelectionFieldsProps,
  DefinitionTypeFieldsProps,
  ItemDefinitionDialogProps,
  ItemDefinitionFieldsProps,
  ItemDefinitionSubmitArgs,
  ItemDefinitionValueState,
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
const PICK_MODE_OPTIONS: readonly OptionCardOption[] = [
  {
    value: "COUNT",
    title: CATALOG_COPY.pickModes.COUNT,
    description: CATALOG_COPY.pickModeDescriptions.COUNT,
    icon: "images",
  },
  {
    value: "QUANTITY",
    title: CATALOG_COPY.pickModes.QUANTITY,
    description: CATALOG_COPY.pickModeDescriptions.QUANTITY,
    icon: "layers",
  },
];
const LOCKED_PICK_MODE_OPTIONS: readonly OptionCardOption[] = PICK_MODE_OPTIONS.map((option) => ({
  ...option,
  isDisabled: true,
}));
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
  return (
    <ResponsiveItemDefinitionDialog
      {...props}
      onOpenChange={form.handleOpenChange}
      title={title}
      content={content}
      save={save}
    />
  );
}

function useItemDefinitionForm(props: Readonly<ItemDefinitionDialogProps>) {
  const { workspaceId, definition, onOpenChange, action, updateAction } = props;
  const state = useItemDefinitionValues(definition);
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const handleOpenChange = createOpenChangeHandler(
    state.reset,
    () => {
      setError(undefined);
    },
    onOpenChange,
  );
  async function submit(): Promise<void> {
    await submitItemDefinition({
      workspaceId,
      definition,
      name: state.name,
      valueType: state.valueType,
      unit: state.unit,
      selectionRequired: state.selectionRequired,
      pickMode: state.pickMode,
      allowsPickNotes: state.allowsPickNotes,
      updateAction,
      action,
      onOpenChange: handleOpenChange,
      setError,
      setPending,
    });
  }
  return {
    ...state,
    locked: Boolean(definition?.usageCount),
    error,
    pending,
    submit,
    handleOpenChange,
  };
}

function useItemDefinitionValues(
  definition: ItemDefinitionDialogProps["definition"],
): ItemDefinitionValueState {
  const initialName = definition?.name ?? "";
  const initialValueType = definition?.valueType ?? "NUMBER";
  const initialUnit = definition?.unit ?? "";
  const initialSelectionRequired = definition?.selectionRequired ?? false;
  const initialPickMode = definition?.pickMode ?? "COUNT";
  const initialPickNotes = definition?.allowsPickNotes ?? false;
  const [name, setName] = useState(initialName);
  const [valueType, setValueType] = useState<"NUMBER" | "RANGE">(initialValueType);
  const [unit, setUnit] = useState(initialUnit);
  const [selectionRequired, setSelectionRequired] = useState(initialSelectionRequired);
  const [pickMode, setPickMode] = useState<PickMode>(initialPickMode);
  const [allowsPickNotes, setAllowsPickNotes] = useState(initialPickNotes);
  function reset(): void {
    setName(initialName);
    setValueType(initialValueType);
    setUnit(initialUnit);
    setSelectionRequired(initialSelectionRequired);
    setPickMode(initialPickMode);
    setAllowsPickNotes(initialPickNotes);
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
    pickMode,
    setPickMode,
    allowsPickNotes,
    setAllowsPickNotes,
    reset,
  };
}

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

async function submitItemDefinition(args: ItemDefinitionSubmitArgs): Promise<void> {
  const {
    workspaceId,
    definition,
    name,
    valueType,
    unit,
    selectionRequired,
    pickMode,
    allowsPickNotes,
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
      pickMode: selectionRequired ? pickMode : null,
      allowsPickNotes: selectionRequired && allowsPickNotes,
    };
    const result =
      definition && updateAction
        ? await updateAction(workspaceId, definition.id, values)
        : await action(workspaceId, values);
    if (result?.ok === false) {
      setError(
        result.fieldErrors.name ??
          result.fieldErrors.valueType ??
          result.fieldErrors.pickMode ??
          result.fieldErrors.allowsPickNotes,
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
  unit,
  setUnit,
  error,
  ...typeFields
}: Readonly<ItemDefinitionFieldsProps>) {
  return (
    <div className="flex flex-col gap-(--space-4)">
      <TextField
        label={CATALOG_COPY.nameItem}
        name="name"
        onBlur={noop}
        placeholder={CATALOG_COPY.nameItemPlaceholder}
        value={name}
        onChange={setName}
        errorMessage={error === "NAME_TAKEN" ? CATALOG_COPY.errors.NAME_TAKEN : undefined}
      />
      <TextField
        label={CATALOG_COPY.unit}
        name="unit"
        onBlur={noop}
        placeholder={CATALOG_COPY.unitPlaceholder}
        value={unit}
        onChange={setUnit}
        isOptional
        description={CATALOG_COPY.unitHelp}
      />
      <DefinitionTypeFields {...typeFields} />
      <CatalogFieldError errorKey={error} />
    </div>
  );
}

function DefinitionTypeFields({
  valueType,
  setValueType,
  ...selection
}: Readonly<DefinitionTypeFieldsProps>) {
  function changeValueType(id: string): void {
    setValueType(id === "RANGE" ? "RANGE" : "NUMBER");
  }
  return (
    <>
      <Select
        label={CATALOG_COPY.valueType}
        value={valueType}
        isDisabled={selection.locked || selection.selectionRequired}
        description={selection.locked ? CATALOG_COPY.lockedDefinitionDescription : undefined}
        options={VALUE_OPTIONS}
        onChange={changeValueType}
      />
      <DefinitionSelectionFields {...selection} />
    </>
  );
}

function DefinitionSelectionFields({
  selectionRequired,
  setSelectionRequired,
  pickMode,
  setPickMode,
  allowsPickNotes,
  setAllowsPickNotes,
  locked,
}: Readonly<DefinitionSelectionFieldsProps>) {
  function changePickMode(value: string): void {
    setPickMode(value === "QUANTITY" ? "QUANTITY" : "COUNT");
  }
  return (
    <>
      <Switch
        label={CATALOG_COPY.selectionSwitch}
        isSelected={selectionRequired}
        isDisabled={locked}
        onChange={setSelectionRequired}
      />
      {selectionRequired ? (
        <>
          <OptionCardGroup
            label={CATALOG_COPY.pickMode}
            isLabelVisible
            options={locked ? LOCKED_PICK_MODE_OPTIONS : PICK_MODE_OPTIONS}
            value={pickMode}
            onChange={changePickMode}
          />
          {locked ? (
            <Alert
              tone="info"
              title={CATALOG_COPY.pickLockedTitle}
              body={CATALOG_COPY.pickLockedBody}
            />
          ) : null}
          <Switch
            label={CATALOG_COPY.pickNotesSwitch}
            description={CATALOG_COPY.pickNotesHelp}
            isSelected={allowsPickNotes}
            isDisabled={locked}
            onChange={setAllowsPickNotes}
          />
        </>
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
