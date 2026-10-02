"use client";
/* eslint-disable max-lines-per-function, no-restricted-syntax -- responsive definition form */

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Select } from "@/ui/patterns/select/select";
import { Button } from "@/ui/primitives/button/button";
import { Switch } from "@/ui/primitives/switch/switch";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { CatalogFieldError } from "../catalog-field-error/catalog-field-error";
import type { ItemDefinitionDialogProps } from "./item-definition-dialog.types";

export function ItemDefinitionDialog({
  isOpen,
  workspaceId,
  definition,
  onOpenChange,
  action,
  updateAction,
}: Readonly<ItemDefinitionDialogProps>) {
  const mobile = useMobileViewport();
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
  const locked = Boolean(definition?.usageCount);

  async function submit(): Promise<void> {
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
          result.fieldErrors.name ??
            result.fieldErrors.valueType ??
            result.fieldErrors.selectionType,
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

  const content = (
    <div className="flex flex-col gap-(--space-4)">
      <TextField
        label={CATALOG_COPY.nameItem}
        name="name"
        onBlur={() => undefined}
        value={name}
        onChange={setName}
        errorMessage={error === "NAME_TAKEN" ? CATALOG_COPY.errors.NAME_TAKEN : undefined}
      />
      <Select
        label={CATALOG_COPY.valueType}
        value={valueType}
        isDisabled={locked || selectionRequired}
        options={[
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
            isDisabled: selectionRequired,
          },
        ]}
        onChange={(id) => {
          setValueType(id === "RANGE" ? "RANGE" : "NUMBER");
        }}
      />
      <TextField
        label={CATALOG_COPY.unit}
        name="unit"
        onBlur={() => undefined}
        value={unit}
        onChange={setUnit}
        isOptional
        description={CATALOG_COPY.unitHelp}
      />
      <Switch
        label={CATALOG_COPY.selectionSwitch}
        isSelected={selectionRequired}
        isDisabled={locked}
        onChange={(selected) => {
          setSelectionRequired(selected);
          if (!selected) setSelectionType(null);
        }}
      />
      {selectionRequired ? (
        <Select
          label={CATALOG_COPY.selectionType}
          value={selectionType}
          isDisabled={locked}
          options={[
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
          ]}
          onChange={(id) => {
            setSelectionType(id === "PRINT" ? "PRINT" : "EDIT");
          }}
        />
      ) : null}
      <CatalogFieldError errorKey={error} />
    </div>
  );
  const save = (
    <Button onPress={() => void submit()} isPending={pending}>
      {CATALOG_COPY.save}
    </Button>
  );
  const title = definition
    ? CATALOG_COPY.definitionDialogEditTitle
    : CATALOG_COPY.definitionDialogAddTitle;
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
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={title}
      description={CATALOG_COPY.definitionDialogDescription}
      size="md"
      actions={
        <>
          <Button
            variant="secondary"
            onPress={() => {
              onOpenChange(false);
            }}
          >
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
/* eslint-enable max-lines-per-function, no-restricted-syntax -- end responsive definition form */
