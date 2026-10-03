"use client";

import { useId } from "react";
import {
  ComboBox as AriaComboBox,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Text,
} from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { MenuDivider } from "@/ui/patterns/menu/menu-divider";
import { Icon } from "@/ui/primitives/icon/icon";
import { Input } from "@/ui/primitives/input/input";

import type { ComboboxProps } from "./combobox.types";
import { MobileCombobox } from "./mobile-combobox";

const CREATE_ID = "__create__";
const FIELD_MESSAGE = "text-(length:--font-size-label)";
const ITEM_CLASS = ({ isFocused }: { isFocused: boolean }) =>
  cn(
    "flex min-h-(--space-9) items-center gap-(--component-menu-item-gap)",
    "rounded-(--component-menu-item-radius) px-(--component-menu-item-padding-x) py-(--component-menu-item-padding-y)",
    "text-(--component-menu-item-text) outline-none",
    isFocused && "bg-(--component-menu-item-background-hover)",
  );
const CREATE_CLASS = ({ isFocused }: { isFocused: boolean }) =>
  cn(ITEM_CLASS({ isFocused }), "font-semibold text-(--component-menu-item-text-action)");

// Filtering is the caller's job (the matches come from a server search), so nothing is hidden here.
const SHOW_ALL = () => true;

/** Renders the design-system C36 combobox: a search input over a menu of matches with a final create row.
 * @param props - controlled query, matches and field presentation options
 * @returns the accessible combobox field
 */
export function Combobox<T extends { readonly id: string }>(props: Readonly<ComboboxProps<T>>) {
  const isMobile = useMobileViewport();
  return isMobile ? <MobileCombobox {...props} /> : <DesktopCombobox {...props} />;
}

function DesktopCombobox<T extends { readonly id: string }>(props: Readonly<ComboboxProps<T>>) {
  const errorMessageId = useId();
  const handleChange = (key: string | number | null) => {
    if (key === null) return;
    if (key === CREATE_ID) props.onCreate?.(props.inputValue);
    else props.onSelect(String(key));
  };
  return (
    <AriaComboBox
      aria-errormessage={props.errorMessage ? errorMessageId : undefined}
      value={props.selectedId}
      onChange={handleChange}
      inputValue={props.inputValue}
      onInputChange={props.onInputChange}
      defaultFilter={SHOW_ALL}
      menuTrigger="focus"
      // Typed text is never a selection, so Escape closes the menu and keeps the query.
      allowsCustomValue
      allowsEmptyCollection
      isDisabled={props.isDisabled}
      isInvalid={Boolean(props.errorMessage)}
      validationBehavior="aria"
      className="relative flex flex-col gap-(--component-input-gap)"
    >
      <Label className="text-(length:--font-size-label) font-semibold text-(--component-input-label)">
        {props.label}
      </Label>
      <Input
        placeholder={props.placeholder}
        iconLeading="search"
        iconTrailing="chevrons-up-down"
        isInvalid={Boolean(props.errorMessage)}
      />
      <ComboboxMessages
        description={props.description}
        errorMessage={props.errorMessage}
        errorMessageId={errorMessageId}
      />
      <ComboboxMenu {...props} />
    </AriaComboBox>
  );
}

function ComboboxMessages({
  description,
  errorMessage,
  errorMessageId,
}: Readonly<{ description?: string; errorMessage?: string; errorMessageId: string }>) {
  return (
    <>
      {description && !errorMessage ? (
        <Text slot="description" className={cn(FIELD_MESSAGE, "text-(--component-input-helper)")}>
          {description}
        </Text>
      ) : null}
      {errorMessage ? (
        <FieldError
          id={errorMessageId}
          className={cn(FIELD_MESSAGE, "text-(--component-input-error-text)")}
        >
          {errorMessage}
        </FieldError>
      ) : null}
    </>
  );
}

function ComboboxMenu<T extends { readonly id: string }>(props: Readonly<ComboboxProps<T>>) {
  const hasCreate = Boolean(props.createLabel && props.onCreate && props.inputValue.trim() !== "");
  return (
    <Popover
      placement="bottom start"
      offset={4}
      className="w-(--trigger-width) rounded-(--component-menu-radius) border border-(--component-menu-border) bg-(--component-menu-background) p-(--component-menu-padding) shadow-[0_var(--elevation-1-offset-y)_var(--elevation-1-blur)_var(--color-semantic-elevation-1-color)]"
    >
      <p className="px-(--component-menu-item-padding-x) py-(--space-2) text-(length:--font-size-overline) font-bold uppercase tracking-(--font-letter-spacing-overline) text-(--component-menu-group-label)">
        {props.groupLabel}
      </p>
      <ListBox aria-label={props.label} aria-busy={props.isLoading} className="outline-none">
        {props.items.map((item) => (
          <ComboboxOption key={item.id} item={item} renderItem={props.renderItem} />
        ))}
        {hasCreate ? <CreateRow label={props.createLabel ?? ""} query={props.inputValue} /> : null}
      </ListBox>
    </Popover>
  );
}

function ComboboxOption<T extends { readonly id: string }>({
  item,
  renderItem,
}: Readonly<{ item: T; renderItem: ComboboxProps<T>["renderItem"] }>) {
  const text = renderItem(item);
  return (
    <ListBoxItem
      id={item.id}
      textValue={text.label}
      aria-label={`${text.label} ${text.description ?? ""}`.trim()}
      className={ITEM_CLASS}
    >
      <span className="min-w-0 flex-1">
        <span className="block">{text.label}</span>
        {text.description ? (
          <span className="block text-(length:--font-size-label) text-(--component-menu-item-description)">
            {text.description}
          </span>
        ) : null}
      </span>
    </ListBoxItem>
  );
}

function CreateRow({ label, query }: Readonly<{ label: string; query: string }>) {
  return (
    <>
      <MenuDivider />
      <ListBoxItem id={CREATE_ID} textValue={query} aria-label={label} className={CREATE_CLASS}>
        <Icon name="plus" aria-hidden="true" size="sm" />
        <span className="min-w-0 flex-1">{label}</span>
      </ListBoxItem>
    </>
  );
}
