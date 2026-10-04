"use client";

import {
  Label,
  RadioButton,
  RadioField,
  RadioGroup as AriaRadioGroup,
} from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import type { RadioDotProps, RadioGroupProps, RadioRowProps } from "./radio-group.types";

// C06: an 18 px dot; selected draws a 5 px ring around the mark colour. Radio shares the checkbox tokens.
const DOT =
  "flex size-[18px] shrink-0 rounded-full border-[1.5px] border-(--component-checkbox-border) bg-(--component-checkbox-background) transition-colors group-data-hovered:border-(--component-checkbox-border-hover)";
const DOT_SELECTED =
  "border-[5px] border-(--component-checkbox-background-checked) bg-(--component-checkbox-mark) group-data-hovered:border-(--component-checkbox-background-checked-hover)";
const FOCUS =
  "shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]";

function RadioDot({ isSelected, isFocusVisible }: Readonly<RadioDotProps>) {
  return (
    <span
      aria-hidden="true"
      className={cn(DOT, isSelected && DOT_SELECTED, isFocusVisible && FOCUS)}
    />
  );
}

function RadioRow({ option }: Readonly<RadioRowProps>) {
  return (
    <RadioField value={option.value} className="group w-fit">
      <RadioButton className="flex cursor-pointer items-center gap-(--component-checkbox-gap) text-(length:--font-size-body) font-medium text-(--component-checkbox-label) outline-none group-data-disabled:cursor-not-allowed">
        {({ isSelected, isFocusVisible }) => (
          <>
            <RadioDot isSelected={isSelected} isFocusVisible={isFocusVisible} />
            {option.label}
          </>
        )}
      </RadioButton>
    </RadioField>
  );
}

/** Picks one option from a short visible list (C06); the whole row is the click target. @param props - label, options, value and handler @returns the labelled radio group */
export function RadioGroup({
  label,
  options,
  value,
  onChange,
  isDisabled,
}: Readonly<RadioGroupProps>) {
  return (
    <AriaRadioGroup
      value={value}
      onChange={onChange}
      isDisabled={isDisabled}
      className="flex flex-col gap-(--space-3) data-disabled:opacity-(--opacity-disabled)"
    >
      <Label className="text-(length:--font-size-label) font-semibold text-(--component-input-label)">
        {label}
      </Label>
      {options.map((option) => (
        <RadioRow key={option.value} option={option} />
      ))}
    </AriaRadioGroup>
  );
}
