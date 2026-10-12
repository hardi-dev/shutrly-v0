"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  itemDefinitionSubmission,
  localizeItemDefinition,
} from "@/features/booking/domain/default-item-definitions/default-item-definitions";
import type { PickMode } from "@/features/booking/domain/item-definition-type/item-definition-type.types";
import type { AppLocale } from "@/shared/locale/locale.types";
import { useAppLocale } from "@/ui/hooks/use-app-locale/use-app-locale";
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

import {
  CATALOG_PICK_MODE_DESCRIPTION_KEY,
  CATALOG_PICK_MODE_MESSAGE_KEY,
  CATALOG_VALUE_TYPE_DESCRIPTION_KEY,
  CATALOG_VALUE_TYPE_MESSAGE_KEY,
} from "../catalog-copy/catalog-copy.copy";
import type { CatalogTranslate } from "../catalog-copy/catalog-copy.types";
import { CatalogFieldError } from "../catalog-field-error/catalog-field-error";
import { showCatalogSaveFailure } from "../catalog-save-feedback/catalog-save-feedback";
import { ITEM_DEFINITION_DIALOG_COPY_NAMESPACE } from "./item-definition-dialog.copy";
import type {
  DefinitionSelectionFieldsProps,
  DefinitionTypeFieldsProps,
  ItemDefinitionDialogProps,
  ItemDefinitionFieldsProps,
  ItemDefinitionSubmitArgs,
  ItemDefinitionValueState,
  ResponsiveItemDefinitionDialogProps,
} from "./item-definition-dialog.types";

const VALUE_TYPES = ["NUMBER", "RANGE"] as const;
const PICK_MODES = ["COUNT", "QUANTITY"] as const;

function noop(): void {}

function valueTypeOptions(t: CatalogTranslate): readonly SelectOption[] {
  return VALUE_TYPES.map((id) => ({
    id,
    label: t(CATALOG_VALUE_TYPE_MESSAGE_KEY[id]),
    description: t(CATALOG_VALUE_TYPE_DESCRIPTION_KEY[id]),
    icon: id === "NUMBER" ? "hash" : "move-horizontal",
  }));
}

function pickModeOptions(t: CatalogTranslate, isLocked: boolean): readonly OptionCardOption[] {
  return PICK_MODES.map((value) => ({
    value,
    title: t(CATALOG_PICK_MODE_MESSAGE_KEY[value]),
    description: t(CATALOG_PICK_MODE_DESCRIPTION_KEY[value]),
    icon: value === "COUNT" ? "images" : "layers",
    ...(isLocked ? { isDisabled: true } : {}),
  }));
}

export function ItemDefinitionDialog(props: Readonly<ItemDefinitionDialogProps>) {
  const t = useTranslations(ITEM_DEFINITION_DIALOG_COPY_NAMESPACE);
  const form = useItemDefinitionForm(props);
  const content = <ItemDefinitionFields {...form} />;
  function handleSubmit(): void {
    void form.submit();
  }
  const save = (
    <Button onPress={handleSubmit} isPending={form.pending}>
      {t("save")}
    </Button>
  );
  const title = props.definition ? t("definitionDialogEditTitle") : t("definitionDialogAddTitle");
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
  const t = useTranslations(ITEM_DEFINITION_DIALOG_COPY_NAMESPACE);
  const locale = useAppLocale();
  const state = useItemDefinitionValues(definition, locale);
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
    const text = definition
      ? itemDefinitionSubmission(definition, locale, state)
      : { name: state.name, unit: state.unit };
    await submitItemDefinition({
      workspaceId,
      definition,
      name: text.name,
      unit: text.unit,
      valueType: state.valueType,
      selectionRequired: state.selectionRequired,
      pickMode: state.pickMode,
      allowsPickNotes: state.allowsPickNotes,
      updateAction,
      action,
      onOpenChange: handleOpenChange,
      setError,
      setPending,
      t,
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
  locale: AppLocale,
): ItemDefinitionValueState {
  // D-18: the fields show the label in the reader's language; an unchanged label is saved as stored.
  const shown = definition ? localizeItemDefinition(definition, locale) : undefined;
  const initialName = shown?.name ?? "";
  const initialValueType = definition?.valueType ?? "NUMBER";
  const initialUnit = shown?.unit ?? "";
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
    t,
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
    showToast({ tone: "success", title: t("savedToast") });
  } catch {
    showCatalogSaveFailure({ setError, retry: () => void submitItemDefinition(args), t });
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
  const t = useTranslations(ITEM_DEFINITION_DIALOG_COPY_NAMESPACE);
  return (
    <div className="flex flex-col gap-(--space-4)">
      <TextField
        label={t("nameItem")}
        name="name"
        onBlur={noop}
        placeholder={t("nameItemPlaceholder")}
        value={name}
        onChange={setName}
        errorMessage={error === "NAME_TAKEN" ? t("errorNameTaken") : undefined}
      />
      <TextField
        label={t("unit")}
        name="unit"
        onBlur={noop}
        placeholder={t("unitPlaceholder")}
        value={unit}
        onChange={setUnit}
        isOptional
        description={t("unitHelp")}
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
  const t = useTranslations(ITEM_DEFINITION_DIALOG_COPY_NAMESPACE);
  function changeValueType(id: string): void {
    setValueType(id === "RANGE" ? "RANGE" : "NUMBER");
  }
  return (
    <>
      <Select
        label={t("valueType")}
        value={valueType}
        isDisabled={selection.locked || selection.selectionRequired}
        description={selection.locked ? t("lockedDefinitionDescription") : undefined}
        options={valueTypeOptions(t)}
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
  const t = useTranslations(ITEM_DEFINITION_DIALOG_COPY_NAMESPACE);
  function changePickMode(value: string): void {
    setPickMode(value === "QUANTITY" ? "QUANTITY" : "COUNT");
  }
  return (
    <>
      <Switch
        label={t("selectionSwitch")}
        isSelected={selectionRequired}
        isDisabled={locked}
        onChange={setSelectionRequired}
      />
      {selectionRequired ? (
        <>
          <OptionCardGroup
            label={t("pickMode")}
            isLabelVisible
            options={pickModeOptions(t, locked)}
            value={pickMode}
            onChange={changePickMode}
          />
          {locked ? (
            <Alert tone="info" title={t("pickLockedTitle")} body={t("pickLockedBody")} />
          ) : null}
          <Switch
            label={t("pickNotesSwitch")}
            description={t("pickNotesHelp")}
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
  const t = useTranslations(ITEM_DEFINITION_DIALOG_COPY_NAMESPACE);
  if (mobile)
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={title}
        description={t("definitionDialogDescription")}
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
      description={t("definitionDialogDescription")}
      size="md"
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
