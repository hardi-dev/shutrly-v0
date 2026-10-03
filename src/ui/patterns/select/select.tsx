"use client";

import { useId, useState } from "react";
import {
  Button as AriaButton,
  FieldError,
  Label,
  ListBox,
  ListBoxSection,
  Popover,
  Select as AriaSelect,
  Text,
} from "react-aria-components";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { MenuGroupLabel } from "@/ui/patterns/menu/menu-group-label";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { Button } from "@/ui/primitives/button/button";
import { Icon } from "@/ui/primitives/icon/icon";
import { TEXT_FIELD_COPY } from "@/ui/primitives/text-field/text-field.copy";

import { SELECT_COPY } from "./select.copy";
import type {
  MobileSelectSheetProps,
  MobileSelectTriggerProps,
  SelectMessageProps,
  SelectOption,
  SelectOptionGroup,
  SelectProps,
} from "./select.types";
import { SelectOptionItem } from "./select-option";
import { groupBySection } from "./select-sections";

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
  const errorMessageId = useId();
  const fieldName = props.label ?? props["aria-label"];
  const selectedOption = findOption(options, value);
  const handleSelectionChange = (key: string | number | null) => {
    if (key !== null) onChange(String(key));
  };
  return (
    <AriaSelect
      {...props}
      aria-errormessage={props.errorMessage ? errorMessageId : undefined}
      value={value}
      onChange={handleSelectionChange}
      isInvalid={Boolean(props.errorMessage)}
      validationBehavior="aria"
      className="relative flex flex-col gap-(--component-input-gap)"
    >
      {props.label ? <SelectLabel label={props.label} isOptional={props.isOptional} /> : null}
      <AriaButton className={SELECT_TRIGGER_CLASS}>
        {selectedOption?.icon ? (
          <Icon name={selectedOption.icon} aria-hidden="true" size="sm" />
        ) : null}
        <span className="min-w-0 flex-1 truncate text-left">
          {selectedOption?.label ?? props.placeholder ?? ""}
        </span>
        <Icon name="chevron-down" aria-hidden="true" size="sm" />
      </AriaButton>
      <SelectMessages {...props} errorMessageId={errorMessageId} />
      <Popover
        placement="bottom start"
        offset={4}
        className="w-(--trigger-width) rounded-(--component-menu-radius) border border-(--component-menu-border) bg-(--component-menu-background) p-(--component-menu-padding) shadow-[0_var(--elevation-1-offset-y)_var(--elevation-1-blur)_var(--color-semantic-elevation-1-color)]"
      >
        <ListBox aria-label={fieldName} className="outline-none">
          {groupBySection(options).map((group) => (
            <SelectOptionGroupView key={group.section ?? ""} group={group} value={value} />
          ))}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}

function MobileSelect({ options, value, onChange, ...props }: Readonly<SelectProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState(value);
  const errorMessageId = useId();
  const selectedOption = findOption(options, value);
  const fieldName = props.label ?? props["aria-label"];
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
      {props.label ? <SelectLabel label={props.label} isOptional={props.isOptional} /> : null}
      <MobileSelectTrigger
        label={fieldName}
        placeholder={props.placeholder}
        selectedOption={selectedOption}
        isDisabled={props.isDisabled}
        onPress={handleOpen}
      />
      <SelectMessages {...props} errorMessageId={errorMessageId} />
      <MobileSelectSheet
        label={fieldName}
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
  function selectOption(optionId: string): () => void {
    return function handleOptionPress(): void {
      onPendingChange(new Set([optionId]));
    };
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={label}
      description={pickerDescription}
      variant="menu"
      actions={<Button onPress={onPick}>{SELECT_COPY.pick}</Button>}
    >
      {groupBySection(options).map((group) => (
        <div key={group.section ?? ""}>
          {group.section ? (
            <p className="px-(--component-menu-item-padding-x) pt-(--space-2) text-(length:--font-size-overline) font-bold uppercase tracking-(--font-letter-spacing-overline) text-(--component-menu-group-label)">
              {group.section}
            </p>
          ) : null}
          {group.options.map((option) => (
            <SheetItem
              key={option.id}
              label={option.label}
              description={option.description}
              icon={option.icon}
              isDisabled={option.isDisabled}
              isSelected={option.id === pendingValue}
              onPress={selectOption(option.id)}
            />
          ))}
        </div>
      ))}
    </BottomSheet>
  );
}

function SelectOptionGroupView({
  group,
  value,
}: Readonly<{ group: SelectOptionGroup; value: string | null }>) {
  const items = group.options.map((option) => (
    <SelectOptionItem key={option.id} option={option} isSelected={option.id === value} />
  ));
  if (group.section === null) return <>{items}</>;
  return (
    <ListBoxSection aria-label={group.section}>
      <MenuGroupLabel>{group.section}</MenuGroupLabel>
      {items}
    </ListBoxSection>
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
  errorMessageId,
}: Readonly<SelectMessageProps>) {
  return (
    <>
      {description && !errorMessage ? (
        <Text slot="description" className={`${FIELD_MESSAGE} text-(--component-input-helper)`}>
          {description}
        </Text>
      ) : null}
      {errorMessage ? (
        <FieldError
          id={errorMessageId}
          className={`${FIELD_MESSAGE} text-(--component-input-error-text)`}
        >
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
