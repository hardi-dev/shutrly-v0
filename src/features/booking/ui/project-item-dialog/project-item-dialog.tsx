"use client";
/* eslint-disable max-lines-per-function -- the responsive shell and the value form share one submit flow */

import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  displayItemDefinition,
  localizeItemDefinition,
} from "@/features/booking/domain/default-item-definitions/default-item-definitions";
import type { PackageValue } from "@/features/booking/domain/package-value/package-value.types";
import { useAppLocale } from "@/ui/hooks/use-app-locale/use-app-locale";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Select } from "@/ui/patterns/select/select";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { useLocaleReformat } from "../locale-reformat/use-locale-reformat";
import { projectFieldErrorText } from "../project-field-error/project-field-error";
import { PROJECT_ITEM_DIALOG_COPY_NAMESPACE } from "./project-item-dialog.copy";
import type { ProjectItemDialogProps } from "./project-item-dialog.types";

const noop = () => undefined;

/** Tambah item / Ubah nilai: shared by the detail page and Proyek baru; it validates nothing itself and calls no action (AC-PRJ-017). */
export function ProjectItemDialog(props: Readonly<ProjectItemDialogProps>) {
  const t = useTranslations(PROJECT_ITEM_DIALOG_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const [definitionId, setDefinitionId] = useState<string | null>(null);
  const [value, setValue] = useState(initialText(props.item?.value, "value"));
  const [min, setMin] = useState(initialText(props.item?.value, "min"));
  const [max, setMax] = useState(initialText(props.item?.value, "max"));
  useLocaleReformat({ value, setValue, kind: "quantity" });
  useLocaleReformat({ value: min, setValue: setMin, kind: "quantity" });
  useLocaleReformat({ value: max, setValue: setMax, kind: "quantity" });
  const [errors, setErrors] = useState<Readonly<Record<string, string>>>({});
  const [isPending, setIsPending] = useState(false);
  const appLocale = useAppLocale();
  const definition =
    props.mode === "add"
      ? props.definitions?.find((option) => option.id === definitionId)
      : props.item;
  // D-18: unit and names show the label in the reader's language.
  const shown = definition ? displayItemDefinition(definition, appLocale) : undefined;
  const shownOptions = (props.definitions ?? []).map((option) =>
    localizeItemDefinition(option, appLocale),
  );
  const submit = async () => {
    if (!definition) {
      setErrors(toTexts({ definitionId: "REQUIRED" }));
      return;
    }
    const packageValue: PackageValue =
      definition.valueType === "RANGE" ? { type: "RANGE", min, max } : { type: "NUMBER", value };
    setIsPending(true);
    try {
      const result = await props.onSubmit({
        definitionId: props.mode === "add" ? (definitionId ?? undefined) : undefined,
        value: packageValue,
      });
      if (result === null) props.onOpenChange(false);
      else setErrors(toTexts(result));
    } finally {
      setIsPending(false);
    }
  };
  const handleConfirm = () => {
    void submit();
  };
  const handleCancel = () => {
    props.onOpenChange(false);
  };
  const title =
    props.mode === "add" ? t("itemAddTitle") : t("itemEditTitle", { name: shown?.name ?? "" });
  const description = props.mode === "add" ? t("itemAddDescription") : t("itemEditDescription");
  const confirm = (
    <Button
      isPending={isPending}
      onPress={handleConfirm}
      size={isMobile ? "lg" : "md"}
      className="max-md:w-full"
    >
      {props.mode === "add" ? t("itemAddConfirm") : t("itemSave")}
    </Button>
  );
  const body = (
    <div className="flex flex-col gap-(--space-4)">
      {props.mode === "add" ? (
        <Select
          label={t("itemPickerLabel")}
          value={definitionId}
          options={shownOptions.map((option) => ({
            id: option.id,
            label: option.name,
            description: option.unit ?? undefined,
          }))}
          onChange={setDefinitionId}
          placeholder={t("itemPickerPlaceholder")}
          description={t("itemPickerHelper")}
          errorMessage={errors.definitionId}
        />
      ) : null}
      {definition?.valueType === "RANGE" ? (
        <div className="grid grid-cols-2 gap-(--space-3)">
          <TextField
            label={t("rangeMin")}
            name="min"
            value={min}
            onChange={setMin}
            onBlur={noop}
            description={shown?.unit ?? undefined}
            errorMessage={errors.min}
          />
          <TextField
            label={t("rangeMax")}
            name="max"
            value={max}
            onChange={setMax}
            onBlur={noop}
            description={shown?.unit ?? undefined}
            errorMessage={errors.max}
          />
        </div>
      ) : (
        <TextField
          label={t("quantityLabel")}
          name="value"
          value={value}
          onChange={setValue}
          onBlur={noop}
          description={shown?.unit ? t("unitHelper", { unit: shown.unit }) : undefined}
          errorMessage={errors.value}
        />
      )}
    </div>
  );
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
        title={title}
        description={description}
        variant="form"
        actions={confirm}
      >
        {body}
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={title}
      description={description}
      size="md"
      actions={
        <>
          <Button variant="secondary" onPress={handleCancel}>
            {t("itemCancel")}
          </Button>
          {confirm}
        </>
      }
    >
      {body}
    </Modal>
  );
}

function toTexts(errors: Readonly<Record<string, string>>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(errors).map(([path, key]) => [path, projectFieldErrorText(path, key)]),
  );
}

function initialText(value: PackageValue | undefined, key: "value" | "min" | "max"): string {
  if (!value) return "";
  if (key === "value") return value.type === "NUMBER" ? value.value : "";
  return value.type === "RANGE" ? value[key] : "";
}
/* eslint-enable max-lines-per-function -- the responsive shell and the value form share one submit flow */
