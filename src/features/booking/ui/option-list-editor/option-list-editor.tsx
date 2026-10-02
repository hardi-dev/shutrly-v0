"use client";

import { Button } from "@/ui/primitives/button/button";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import type { OptionListEditorProps } from "./option-list-editor.types";

function noop(): void {}

export function OptionListEditor({
  options,
  errors = {},
  onChange,
}: Readonly<OptionListEditorProps>) {
  function addOption(): void {
    onChange([...options, ""]);
  }
  return (
    <div className="flex flex-col gap-(--space-3)" aria-label={CATALOG_COPY.options}>
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
        {CATALOG_COPY.addOptionButton}
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
  function change(value: string): void {
    onChange(options.map((entry, itemIndex) => (itemIndex === index ? value : entry)));
  }
  function remove(): void {
    onChange(options.filter((_, itemIndex) => itemIndex !== index));
  }
  return (
    <div className="flex items-start gap-(--space-2)">
      <TextField
        label={CATALOG_COPY.optionLabel(index + 1)}
        name={`option-${String(index)}`}
        value={option}
        onChange={change}
        onBlur={noop}
        errorMessage={error ? CATALOG_COPY.optionError(error) : undefined}
      />
      <IconButton
        icon="trash-2"
        size="md"
        aria-label={CATALOG_COPY.removeOption(option)}
        onPress={remove}
      />
    </div>
  );
}
