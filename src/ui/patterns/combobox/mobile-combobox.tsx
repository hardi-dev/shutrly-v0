"use client";

import { useState } from "react";
import { Button as AriaButton } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { Icon } from "@/ui/primitives/icon/icon";
import { Input } from "@/ui/primitives/input/input";

import type { ComboboxProps } from "./combobox.types";

const FIELD_MESSAGE = "text-(length:--font-size-label)";
const TRIGGER_CLASS =
  "flex h-(--component-input-height) w-full items-center gap-(--space-2) rounded-(--component-input-radius) border border-(--component-input-border) bg-(--component-input-background) px-(--component-input-padding-x) text-left text-(length:--font-size-body) text-(--component-input-text) outline-none transition-colors data-focus-visible:border-(--component-input-border-focus) data-focus-visible:shadow-[inset_0_0_0_1px_var(--component-input-border-focus),0_0_0_4px_var(--color-semantic-focus-glow)] data-disabled:border-(--component-input-border-disabled) data-disabled:bg-(--component-input-background-disabled) data-disabled:text-(--component-input-text-disabled)";

/** The phone variant of the combobox: a field-looking trigger that opens a search sheet with the matches (C36 on phones). */
export function MobileCombobox<T extends { readonly id: string }>(
  props: Readonly<ComboboxProps<T>>,
) {
  const [isOpen, setIsOpen] = useState(false);
  const hasText = props.inputValue.trim() !== "";
  const handleOpen = () => {
    setIsOpen(true);
  };
  const handleSelect = (id: string) => {
    props.onSelect(id);
    setIsOpen(false);
  };
  const handleCreate = () => {
    props.onCreate?.(props.inputValue);
    setIsOpen(false);
  };
  return (
    <div className="flex flex-col gap-(--component-input-gap)">
      <span className="text-(length:--font-size-label) font-semibold text-(--component-input-label)">
        {props.label}
      </span>
      <MobileComboboxTrigger {...props} onPress={handleOpen} />
      {props.errorMessage ? (
        <p role="alert" className={cn(FIELD_MESSAGE, "text-(--component-input-error-text)")}>
          {props.errorMessage}
        </p>
      ) : null}
      {props.description && !props.errorMessage ? (
        <p className={cn(FIELD_MESSAGE, "text-(--component-input-helper)")}>{props.description}</p>
      ) : null}
      <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} title={props.label} variant="menu">
        <MobileComboboxBody
          {...props}
          hasCreate={Boolean(props.createLabel && props.onCreate && hasText)}
          onPick={handleSelect}
          onCreateRow={handleCreate}
        />
      </BottomSheet>
    </div>
  );
}

function MobileComboboxBody<T extends { readonly id: string }>({
  hasCreate,
  onPick,
  onCreateRow,
  ...props
}: Readonly<
  ComboboxProps<T> & { hasCreate: boolean; onPick: (id: string) => void; onCreateRow: () => void }
>) {
  return (
    <div aria-busy={props.isLoading}>
      <div className="px-(--space-4) pb-(--space-2)">
        <Input
          variant="search"
          aria-label={props.label}
          placeholder={props.placeholder}
          iconLeading="search"
          value={props.inputValue}
          onChange={props.onInputChange}
        />
      </div>
      <p className="px-(--space-4) pt-(--space-2) text-(length:--font-size-overline) font-bold uppercase tracking-(--font-letter-spacing-overline) text-(--component-menu-group-label)">
        {props.groupLabel}
      </p>
      {props.items.map((item) => (
        <MobileOption
          key={item.id}
          item={item}
          renderItem={props.renderItem}
          isSelected={item.id === props.selectedId}
          onPick={onPick}
        />
      ))}
      {hasCreate ? (
        <SheetItem icon="plus" label={props.createLabel ?? ""} onPress={onCreateRow} />
      ) : null}
    </div>
  );
}

function MobileOption<T extends { readonly id: string }>({
  item,
  renderItem,
  isSelected,
  onPick,
}: Readonly<{
  item: T;
  renderItem: ComboboxProps<T>["renderItem"];
  isSelected: boolean;
  onPick: (id: string) => void;
}>) {
  const text = renderItem(item);
  const handlePress = () => {
    onPick(item.id);
  };
  return (
    <SheetItem
      label={text.label}
      description={text.description}
      isSelected={isSelected}
      onPress={handlePress}
    />
  );
}

function MobileComboboxTrigger<T extends { readonly id: string }>({
  onPress,
  ...props
}: Readonly<ComboboxProps<T> & { onPress: () => void }>) {
  const hasText = props.inputValue.trim() !== "";
  return (
    <AriaButton
      aria-label={props.label}
      isDisabled={props.isDisabled}
      onPress={onPress}
      className={cn(TRIGGER_CLASS, props.errorMessage && "border-(--component-input-border-error)")}
    >
      <Icon name="search" aria-hidden="true" size="sm" />
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          !hasText && "text-(--component-input-placeholder)",
        )}
      >
        {hasText ? props.inputValue : props.placeholder}
      </span>
      <Icon name="chevrons-up-down" aria-hidden="true" size="sm" />
    </AriaButton>
  );
}
