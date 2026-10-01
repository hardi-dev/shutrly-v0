"use client";

import type { MouseEvent } from "react";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";

import { VARIABLE_CHIP_COPY as COPY } from "./variable-chip.copy";
import type { VariableChipProps } from "./variable-chip.types";

const CHIP = [
  "inline-flex items-center gap-(--space-1) rounded-(--radius-sm) border px-(--space-2) py-(--space-1)",
  "text-(length:--font-size-label) outline-none",
  "focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]",
];
const DEFAULT = [
  "border-(--color-semantic-border-default) bg-(--color-semantic-surface-subtle) text-(--color-semantic-text-primary)",
  "hover:bg-(--color-semantic-surface-muted)",
];
const REQUIRED =
  "border-(--color-semantic-accent-soft) bg-(--color-semantic-accent-soft) text-(--color-semantic-accent-soft-fg)";

/**
 * A pressable variable from the type's catalogue; pressing inserts `{{name}}` at the caret
 * (AC-MSG-006). The required link variable is marked (AC-MSG-005).
 * @param props - variable name, required flag and insert callback
 * @returns the chip button
 */
export function VariableChip({ name, isRequired, onInsert }: Readonly<VariableChipProps>) {
  const handleClick = () => {
    onInsert(name);
  };
  // Keep focus (and the caret) in the textarea while the pointer presses the chip.
  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  return (
    <button
      type="button"
      aria-label={COPY.insert(name, isRequired)}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      className={cn(CHIP, isRequired ? REQUIRED : DEFAULT)}
    >
      <Icon
        name="braces"
        size="sm"
        className={isRequired ? undefined : "text-(--color-semantic-text-secondary)"}
      />
      <span className="font-medium">{name}</span>
      {isRequired ? (
        <span className="text-(length:--font-size-caption)">{COPY.required}</span>
      ) : null}
    </button>
  );
}
