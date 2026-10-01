"use client";

import type { Key } from "react-aria-components";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import type { SegmentedControlProps } from "./segmented-control.types";

const TRACK = [
  "inline-flex items-center gap-(--component-segmented-gap) rounded-(--component-segmented-radius)",
  "bg-(--component-segmented-track) p-(--component-segmented-padding)",
];

const ITEM = [
  "rounded-(--component-segmented-radius) px-(--component-segmented-item-padding-x) py-(--component-segmented-item-padding-y)",
  "text-(length:--font-size-body-sm) font-medium text-(--component-segmented-item-text) outline-none",
  "data-hovered:text-(--component-segmented-item-text-hover)",
  "data-selected:bg-(--component-segmented-item-background-active) data-selected:text-(--component-segmented-item-text-active)",
  "data-selected:shadow-[inset_0_0_0_1px_var(--component-segmented-item-border-active)]",
  "data-focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]",
];

/**
 * Switches between 2–4 views of the same content with one Tab stop and arrow keys (C23).
 * @param props - group label, options, the selected option and the change callback
 * @returns the segmented control
 */
export function SegmentedControl({
  label,
  options,
  selectedId,
  onChange,
  className,
}: Readonly<SegmentedControlProps>) {
  const handleSelectionChange = (keys: Set<Key>) => {
    const [next] = keys;
    if (typeof next === "string") onChange(next);
  };
  return (
    <ToggleButtonGroup
      aria-label={label}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[selectedId]}
      onSelectionChange={handleSelectionChange}
      className={cn(TRACK, className)}
    >
      {options.map((option) => (
        <ToggleButton key={option.id} id={option.id} className={cn(ITEM)}>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
