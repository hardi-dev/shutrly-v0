"use client";

import { ListBoxItem } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";

import type { SelectOptionItemProps } from "./select.types";

/** Renders one rich or plain option in a select listbox.
 * @param props - option content and selection state
 * @returns the accessible listbox option
 */
export function SelectOptionItem({ option, isSelected }: Readonly<SelectOptionItemProps>) {
  const isRich = Boolean(option.description || option.icon);
  return (
    <ListBoxItem
      id={option.id}
      textValue={option.label}
      isDisabled={option.isDisabled}
      aria-label={isRich ? `${option.label} ${option.description ?? ""}`.trim() : option.label}
      className={getOptionClassName(Boolean(option.isDisabled))}
    >
      {option.icon ? <Icon name={option.icon} aria-hidden="true" size="sm" /> : null}
      <span className="min-w-0 flex-1">
        <span className={cn("block", isSelected && "font-semibold")}>{option.label}</span>
        {option.description ? (
          <span className="block text-(length:--font-size-label) text-(--component-menu-item-description)">
            {option.description}
          </span>
        ) : null}
      </span>
      {isSelected ? (
        <Icon
          name="check"
          aria-hidden="true"
          size="sm"
          className="text-(--component-menu-item-check)"
        />
      ) : null}
    </ListBoxItem>
  );
}

function getOptionClassName(isDisabled: boolean) {
  return ({ isFocused }: { isFocused: boolean }) =>
    cn(
      "flex min-h-(--space-9) items-center gap-(--component-menu-item-gap)",
      "rounded-(--component-menu-item-radius) px-(--component-menu-item-padding-x) py-(--component-menu-item-padding-y)",
      "text-(--component-menu-item-text) outline-none",
      isFocused && "bg-(--component-menu-item-background-hover)",
      isDisabled && "text-(--component-menu-item-text-disabled)",
    );
}
