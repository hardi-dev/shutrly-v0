"use client";

import { CheckboxButton, CheckboxField } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";

import type { CheckboxProps } from "./checkbox.types";

const BOX =
  "flex size-[18px] shrink-0 items-center justify-center rounded-(--component-checkbox-radius) border-[1.5px] border-(--component-checkbox-border) bg-(--component-checkbox-background) text-(--component-checkbox-mark) transition-colors";

/** The 18 px box with its check mark; presentational, so a parent control can own the toggling (C05). */
export function CheckboxBox({ isSelected }: Readonly<{ isSelected: boolean }>) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        BOX,
        isSelected &&
          "border-(--component-checkbox-background-checked) bg-(--component-checkbox-background-checked)",
      )}
    >
      {isSelected ? <Icon name="check" size="sm" /> : null}
    </span>
  );
}

/** Renders a labelled checkbox; the whole row is the click target (C05). @param props - label, state and handler @returns the accessible checkbox */
export function Checkbox({ label, isSelected, onChange, isDisabled }: Readonly<CheckboxProps>) {
  return (
    <CheckboxField
      isSelected={isSelected}
      onChange={onChange}
      isDisabled={isDisabled}
      className="group data-disabled:opacity-(--opacity-disabled)"
    >
      <CheckboxButton className="flex cursor-pointer items-center gap-(--component-checkbox-gap) text-(length:--font-size-body) font-medium text-(--component-checkbox-label) outline-none group-data-disabled:cursor-not-allowed">
        {({ isSelected: selected, isFocusVisible }) => (
          <>
            <span
              className={cn(
                "rounded-(--component-checkbox-radius)",
                isFocusVisible &&
                  "shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]",
              )}
            >
              <CheckboxBox isSelected={selected} />
            </span>
            {label}
          </>
        )}
      </CheckboxButton>
    </CheckboxField>
  );
}
