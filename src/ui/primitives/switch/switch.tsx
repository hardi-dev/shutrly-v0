"use client";

import { SwitchButton, SwitchField, Text } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import type { SwitchProps } from "./switch.types";

/** Renders the design-system C07 switch with an accessible label and optional description.
 * @param props - controlled switch state and presentation options
 * @returns the switch control
 */
export function Switch({
  label,
  isSelected,
  onChange,
  isDisabled = false,
  description,
  className,
}: Readonly<SwitchProps>) {
  return (
    <SwitchField
      isSelected={isSelected}
      isDisabled={isDisabled}
      onChange={onChange}
      className={cn(
        "group flex flex-col gap-(--space-1)",
        "data-disabled:opacity-(--opacity-disabled)",
        className,
      )}
    >
      <SwitchButton className="flex w-full items-center gap-(--component-switch-gap) outline-none">
        <span className="flex min-w-0 flex-1 text-(--component-switch-label) text-(length:--font-size-body) font-medium">
          {label}
        </span>
        <SwitchIndicator />
      </SwitchButton>
      {description ? (
        <Text
          slot="description"
          className="text-(--component-input-helper) text-(length:--font-size-label)"
        >
          {description}
        </Text>
      ) : null}
    </SwitchField>
  );
}

function SwitchIndicator() {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block h-5 w-9 shrink-0 rounded-(--component-switch-radius)",
        "bg-(--component-switch-track-off)",
        "group-data-hovered:bg-(--component-switch-track-off-hover)",
        "group-data-selected:bg-(--component-switch-track-on)",
        "group-data-selected:group-data-hovered:bg-(--component-switch-track-on-hover)",
        "group-data-focus-visible:outline-2 group-data-focus-visible:outline-offset-2",
        "group-data-focus-visible:outline-(--color-semantic-focus-ring)",
        "group-data-focus-visible:shadow-[0_0_0_4px_var(--color-semantic-focus-glow)]",
      )}
    >
      <span
        className={cn(
          "absolute left-(--component-switch-padding) top-(--component-switch-padding) size-4",
          "rounded-(--component-switch-radius) bg-(--component-switch-knob)",
          "transition-transform group-data-selected:translate-x-4",
        )}
      />
    </span>
  );
}
