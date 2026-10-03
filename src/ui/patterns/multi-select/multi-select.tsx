"use client";

import { useContext, useId, useState } from "react";
import {
  Button as AriaButton,
  Label,
  ListBox,
  ListBoxItem,
  OverlayTriggerStateContext,
  Popover,
  Select as AriaSelect,
} from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { MenuGroupLabel } from "@/ui/patterns/menu/menu-group-label";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { Checkbox, CheckboxBox } from "@/ui/primitives/checkbox/checkbox";
import { Icon } from "@/ui/primitives/icon/icon";

import type {
  MobileSheetState,
  MultiSelectCreateAction,
  MultiSelectProps,
} from "./multi-select.types";
import { MultiSelectMessages } from "./multi-select-messages";

const TRIGGER_CLASS =
  "flex h-(--component-input-height) w-full items-center gap-(--space-2) rounded-(--component-input-radius) border border-(--component-input-border) bg-(--component-input-background) px-(--component-input-padding-x) text-left text-(length:--font-size-body) text-(--component-input-text) outline-none transition-colors data-hovered:border-(--component-input-border-hover) data-focus-visible:border-(--component-input-border-focus) data-invalid:border-(--component-input-border-error) data-focus-visible:shadow-[inset_0_0_0_1px_var(--component-input-border-focus),0_0_0_4px_var(--color-semantic-focus-glow)] data-disabled:border-(--component-input-border-disabled) data-disabled:bg-(--component-input-background-disabled) data-disabled:text-(--component-input-text-disabled)";

const optionClass = ({ isFocused }: { isFocused: boolean }) =>
  cn(
    "flex min-h-(--space-9) items-center gap-(--component-menu-item-gap) rounded-(--component-menu-item-radius) px-(--component-menu-item-padding-x) py-(--component-menu-item-padding-y) text-(--component-menu-item-text) outline-none",
    isFocused && "bg-(--component-menu-item-background-hover)",
  );

function describedBy(props: Readonly<MultiSelectProps>, messageId: string): string | undefined {
  return props.errorMessage || props.description ? messageId : undefined;
}

function summary(props: Readonly<MultiSelectProps>): string | null {
  const picked = props.options.filter((option) => props.selectedIds.includes(option.id));
  return picked.length === 0 ? null : picked.map((option) => option.label).join(", ");
}

/** Renders the design-system C20 multi-select: a trigger listing the picked labels over checkbox options; a sheet on phones. @param props - controlled selection and options @returns the accessible multi-select */
export function MultiSelect(props: Readonly<MultiSelectProps>) {
  const isMobile = useMobileViewport();
  return isMobile ? <MobileMultiSelect {...props} /> : <DesktopMultiSelect {...props} />;
}

function Trigger({ text, placeholder }: Readonly<{ text: string | null; placeholder: string }>) {
  return (
    <>
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          text === null && "text-(--component-input-placeholder)",
        )}
      >
        {text ?? placeholder}
      </span>
      <Icon name="chevron-down" aria-hidden="true" size="sm" />
    </>
  );
}

function DesktopMultiSelect(props: Readonly<MultiSelectProps>) {
  const messageId = useId();
  const handleChange = (keys: readonly (string | number)[]) => {
    props.onChange(keys.map(String));
  };
  return (
    <AriaSelect
      selectionMode="multiple"
      value={[...props.selectedIds]}
      onChange={handleChange}
      isDisabled={props.isDisabled}
      placeholder={props.placeholder}
      isInvalid={Boolean(props.errorMessage)}
      validationBehavior="aria"
      className="relative flex flex-col gap-(--component-input-gap)"
    >
      <Label className="text-(length:--font-size-label) font-semibold text-(--component-input-label)">
        {props.label}
      </Label>
      <AriaButton aria-describedby={describedBy(props, messageId)} className={TRIGGER_CLASS}>
        <Trigger text={summary(props)} placeholder={props.placeholder} />
      </AriaButton>
      <MultiSelectMessages
        description={props.description}
        errorMessage={props.errorMessage}
        messageId={messageId}
      />
      <DesktopOptions {...props} />
    </AriaSelect>
  );
}

function DesktopOptions(props: Readonly<MultiSelectProps>) {
  return (
    <Popover
      placement="bottom start"
      offset={4}
      className="w-(--trigger-width) rounded-(--component-menu-radius) border border-(--component-menu-border) bg-(--component-menu-background) p-(--component-menu-padding) shadow-[0_var(--elevation-1-offset-y)_var(--elevation-1-blur)_var(--color-semantic-elevation-1-color)]"
    >
      {props.groupLabel ? <MenuGroupLabel>{props.groupLabel}</MenuGroupLabel> : null}
      <ListBox aria-label={props.label} selectionMode="multiple" className="outline-none">
        {props.options.map((option) => (
          <ListBoxItem
            key={option.id}
            id={option.id}
            textValue={option.label}
            className={optionClass}
          >
            {({ isSelected }) => (
              <>
                <CheckboxBox isSelected={isSelected} />
                <span className="min-w-0 flex-1">{option.label}</span>
              </>
            )}
          </ListBoxItem>
        ))}
      </ListBox>
      {props.createAction ? <CreateRow action={props.createAction} /> : null}
    </Popover>
  );
}

function CreateRow({ action }: Readonly<{ action: MultiSelectCreateAction }>) {
  const overlay = useContext(OverlayTriggerStateContext);
  const handlePress = () => {
    overlay?.close();
    action.onPress();
  };
  return (
    <AriaButton
      onPress={handlePress}
      className="flex min-h-(--space-9) w-full items-center gap-(--component-menu-item-gap) rounded-(--component-menu-item-radius) px-(--component-menu-item-padding-x) py-(--component-menu-item-padding-y) text-left text-(--component-menu-item-text) outline-none data-hovered:bg-(--component-menu-item-background-hover) data-focus-visible:bg-(--component-menu-item-background-hover)"
    >
      <Icon name="plus" aria-hidden="true" size="sm" />
      <span className="min-w-0 flex-1">{action.label}</span>
    </AriaButton>
  );
}

function MobileMultiSelect(props: Readonly<MultiSelectProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const messageId = useId();
  const handleOpen = () => {
    setIsOpen(true);
  };
  const handleCreate = () => {
    setIsOpen(false);
    props.createAction?.onPress();
  };
  return (
    <div className="flex flex-col gap-(--component-input-gap)">
      <span className="text-(length:--font-size-label) font-semibold text-(--component-input-label)">
        {props.label}
      </span>
      <AriaButton
        aria-label={props.label}
        aria-describedby={describedBy(props, messageId)}
        data-invalid={props.errorMessage ? "true" : undefined}
        isDisabled={props.isDisabled}
        onPress={handleOpen}
        className={TRIGGER_CLASS}
      >
        <Trigger text={summary(props)} placeholder={props.placeholder} />
      </AriaButton>
      <MultiSelectMessages
        description={props.description}
        errorMessage={props.errorMessage}
        messageId={messageId}
      />
      <MobileSheet {...props} isOpen={isOpen} onOpenChange={setIsOpen} onCreate={handleCreate} />
    </div>
  );
}

function MobileSheet({
  isOpen,
  onOpenChange,
  onCreate,
  ...props
}: Readonly<MultiSelectProps & MobileSheetState>) {
  const toggle = (id: string, isSelected: boolean) => {
    props.onChange(
      isSelected ? [...props.selectedIds, id] : props.selectedIds.filter((picked) => picked !== id),
    );
  };
  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange} title={props.label} variant="form">
      <div className="flex flex-col gap-(--space-2) pb-(--space-4)">
        {props.options.map((option) => (
          <MobileOption
            key={option.id}
            id={option.id}
            label={option.label}
            isSelected={props.selectedIds.includes(option.id)}
            onToggle={toggle}
          />
        ))}
        {props.createAction ? (
          <SheetItem label={props.createAction.label} icon="plus" onPress={onCreate} />
        ) : null}
      </div>
    </BottomSheet>
  );
}

function MobileOption({
  id,
  label,
  isSelected,
  onToggle,
}: Readonly<{
  id: string;
  label: string;
  isSelected: boolean;
  onToggle: (id: string, isSelected: boolean) => void;
}>) {
  const handleChange = (next: boolean) => {
    onToggle(id, next);
  };
  return <Checkbox label={label} isSelected={isSelected} onChange={handleChange} />;
}
