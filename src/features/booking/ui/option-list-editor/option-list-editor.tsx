"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/ui/primitives/button/button";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CATALOG_ERROR_MESSAGE_KEY } from "../catalog-copy/catalog-copy.copy";
import { isCatalogErrorKey } from "../catalog-field-error/catalog-field-error";
import { OPTION_LIST_EDITOR_COPY_NAMESPACE } from "./option-list-editor.copy";
import type { OptionListEditorProps } from "./option-list-editor.types";

function noop(): void {}

export function OptionListEditor({
  options,
  errors = {},
  onChange,
}: Readonly<OptionListEditorProps>) {
  const t = useTranslations(OPTION_LIST_EDITOR_COPY_NAMESPACE);
  function addOption(): void {
    onChange([...options, ""]);
  }
  return (
    <div className="flex flex-col gap-(--space-3)" aria-label={t("options")}>
      {options.map((option, index) => (
        <OptionInput
          key={`${String(index)}-${option}`}
          option={option}
          index={index}
          error={errors[index]}
          options={options}
          onChange={onChange}
        />
      ))}
      <Button type="button" variant="secondary" size="md" iconLeading="plus" onPress={addOption}>
        {t("addOptionButton")}
      </Button>
    </div>
  );
}

function OptionInput({
  option,
  index,
  error,
  options,
  onChange,
}: Readonly<{
  readonly option: string;
  readonly index: number;
  readonly error?: string;
  readonly options: readonly string[];
  readonly onChange: (options: readonly string[]) => void;
}>) {
  const t = useTranslations(OPTION_LIST_EDITOR_COPY_NAMESPACE);
  function change(value: string): void {
    onChange(options.map((entry, itemIndex) => (itemIndex === index ? value : entry)));
  }
  function remove(): void {
    onChange(options.filter((_, itemIndex) => itemIndex !== index));
  }
  return (
    <div className="flex items-start gap-(--space-2)">
      <TextField
        label={t("optionLabel", { index: index + 1 })}
        name={`option-${String(index)}`}
        placeholder={t("optionPlaceholder")}
        value={option}
        onChange={change}
        onBlur={noop}
        errorMessage={
          error && isCatalogErrorKey(error) ? t(CATALOG_ERROR_MESSAGE_KEY[error]) : undefined
        }
      />
      <IconButton
        icon="trash-2"
        size="md"
        aria-label={option ? t("removeOption", { name: option }) : t("removeNewOption")}
        onPress={remove}
      />
    </div>
  );
}
