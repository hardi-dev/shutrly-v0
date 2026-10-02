"use client";

import { useState } from "react";
import {
  Button as AriaButton,
  FieldError,
  Label,
  ListBox,
  Popover,
  Select as AriaSelect,
  SelectValue,
  Text,
} from "react-aria-components";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Button } from "@/ui/primitives/button/button";
import { Icon } from "@/ui/primitives/icon/icon";
import { TEXT_FIELD_COPY } from "@/ui/primitives/text-field/text-field.copy";

import { SELECT_COPY } from "./select.copy";
import type {
  MobileSelectSheetProps,
  MobileSelectTriggerProps,
  SelectOption,
  SelectProps,
} from "./select.types";
import { SelectOptionItem } from "./select-option";

const FIELD_MESSAGE = "text-(length:--font-size-label)";

/** Renders the design-system C19 select with rich options and a mobile picker sheet.
 * @param props - controlled selection and field presentation options
 * @returns the accessible select field
 */
export function Select(props: Readonly<SelectProps>) {
  const isMobile = useMobileViewport();
  return isMobile ? <MobileSelect {...props} /> : <DesktopSelect {...props} />;
}

function DesktopSelect({ options, value, onChange, ...props }: Readonly<SelectProps>) {
  const selectedOption = findOption(options, value);
  const handleSelectionChange = (key: string | number | null) => {
    if (key !== null) onChange(String(key));
  };
  return (
    <AriaSelect
      {...props}
      value={value}
      onChange={handleSelectionChange}
      isInvalid={Boolean(props.errorMessage)}
      validationBehavior="aria"
      className="relative flex flex-col gap-(--component-input-gap)"
    >
      <SelectLabel {...props} />
      <AriaButton className={SELECT_TRIGGER_CLASS}>
        {selectedOption?.icon ? (
          <Icon name={selectedOption.icon} aria-hidden="true" size="sm" />
        ) : null}
        <SelectValue className="min-w-0 flex-1 truncate text-left">
          {({ defaultChildren, isPlaceholder, selectedText }) =>
            isPlaceholder ? defaultChildren : selectedText
          }
        </SelectValue>
        <Icon name="chevron-down" aria-hidden="true" size="sm" />
      </AriaButton>
      <SelectMessages {...props} />
      <Popover
        placement="bottom start"
        offset={4}
        className="w-(--trigger-width) rounded-(--component-menu-radius) border border-(--component-menu-border) bg-(--component-menu-background) p-(--component-menu-padding) shadow-[0_var(--elevation-1-offset-y)_var(--elevation-1-blur)_var(--color-semantic-elevation-1-color)]"
      >
        <ListBox aria-label={props.label} className="outline-none">
          {options.map((option) => (
            <SelectOptionItem key={option.id} option={option} isSelected={option.id === value} />
          ))}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}

function MobileSelect({ options, value, onChange, ...props }: Readonly<SelectProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState(value);
  const selectedOption = findOption(options, value);
  const handleOpenChange = (nextIsOpen: boolean) => {
    setIsOpen(nextIsOpen);
    if (nextIsOpen) setPendingValue(value);
  };
  const handlePendingChange = (keys: Set<string | number> | "all") => {
    if (keys !== "all") {
      const selectedKey = Array.from(keys).at(0);
      setPendingValue(selectedKey === undefined ? null : String(selectedKey));
    }
  };
  const handlePick = () => {
    if (pendingValue !== null) onChange(pendingValue);
    setIsOpen(false);
  };
  const handleOpen = () => {
    handleOpenChange(true);
  };
  return (
    <div className="flex flex-col gap-(--component-input-gap)">
      <SelectLabel {...props} />
      <MobileSelectTrigger
        label={props.label}
        placeholder={props.placeholder}
        selectedOption={selectedOption}
        isDisabled={props.isDisabled}
        onPress={handleOpen}
      />
      <SelectMessages {...props} />
      <MobileSelectSheet
        label={props.label}
        pickerDescription={props.pickerDescription}
        options={options}
        pendingValue={pendingValue}
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        onPendingChange={handlePendingChange}
        onPick={handlePick}
      />
    </div>
  );
}

function MobileSelectTrigger({
  label,
  placeholder,
  selectedOption,
  isDisabled,
  onPress,
}: Readonly<MobileSelectTriggerProps>) {
  return (
    <AriaButton
      aria-label={label}
      isDisabled={isDisabled}
      onPress={onPress}
      className={SELECT_TRIGGER_CLASS}
    >
      {selectedOption?.icon ? (
        <Icon name={selectedOption.icon} aria-hidden="true" size="sm" />
      ) : null}
      <span className="min-w-0 flex-1 truncate text-left">
        {selectedOption?.label ?? placeholder ?? ""}
      </span>
      <Icon name="chevron-down" aria-hidden="true" size="sm" />
    </AriaButton>
  );
}

function MobileSelectSheet({
  label,
  pickerDescription,
  options,
  pendingValue,
  isOpen,
  onOpenChange,
  onPendingChange,
  onPick,
}: Readonly<MobileSelectSheetProps>) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={label}
      description={pickerDescription}
      variant="form"
      actions={<Button onPress={onPick}>{SELECT_COPY.pick}</Button>}
    >
      <ListBox
        aria-label={label}
        selectionMode="single"
        selectedKeys={pendingValue ? new Set([pendingValue]) : new Set()}
        onSelectionChange={onPendingChange}
        className="outline-none"
      >
        {options.map((option) => (
          <SelectOptionItem
            key={option.id}
            option={option}
            isSelected={option.id === pendingValue}
          />
        ))}
      </ListBox>
    </BottomSheet>
  );
}

function SelectLabel({ label, isOptional }: Readonly<Pick<SelectProps, "label" | "isOptional">>) {
  return (
    <div className="flex items-center gap-(--space-1)">
      <Label className="text-(length:--font-size-label) font-semibold text-(--component-input-label)">
        {label}
      </Label>
      {isOptional ? (
        <span className="text-(length:--font-size-label) text-(--component-input-helper)">
          {TEXT_FIELD_COPY.optionalSuffix}
        </span>
      ) : null}
    </div>
  );
}

function SelectMessages({
  description,
  errorMessage,
}: Readonly<Pick<SelectProps, "description" | "errorMessage">>) {
  return (
    <>
      {description && !errorMessage ? (
        <Text slot="description" className={`${FIELD_MESSAGE} text-(--component-input-helper)`}>
          {description}
        </Text>
      ) : null}
      {errorMessage ? (
        <FieldError className={`${FIELD_MESSAGE} text-(--component-input-error-text)`}>
          {errorMessage}
        </FieldError>
      ) : null}
    </>
  );
}

function findOption(options: readonly SelectOption[], value: string | null) {
  return options.find((option) => option.id === value);
}

const SELECT_TRIGGER_CLASS =
  "flex h-(--component-input-height) w-full items-center gap-(--space-2) rounded-(--component-input-radius) border border-(--component-input-border) bg-(--component-input-background) px-(--component-input-padding-x) text-(length:--font-size-body) text-(--component-input-text) outline-none transition-colors data-hovered:border-(--component-input-border-hover) data-focused:border-(--component-input-border-focus) data-focused:shadow-[inset_0_0_0_1px_var(--component-input-border-focus),0_0_0_4px_var(--color-semantic-focus-glow)] data-invalid:border-(--component-input-border-error) data-disabled:border-(--component-input-border-disabled) data-disabled:bg-(--component-input-background-disabled) data-disabled:text-(--component-input-text-disabled)";
