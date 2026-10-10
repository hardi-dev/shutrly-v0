"use client";

import { parseDate } from "@internationalized/date";
import { useContext } from "react";
import type { DateValue } from "react-aria-components";
import {
  Button as AriaButton,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DatePicker,
  DatePickerStateContext,
  Dialog,
  FieldError,
  Group,
  Heading,
  Label,
  Popover,
  Text,
} from "react-aria-components";

import type { FormattingLocale } from "@/shared/locale/locale.types";
import { cn } from "@/ui/cn/cn";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Icon } from "@/ui/primitives/icon/icon";
import { TEXT_FIELD_COPY } from "@/ui/primitives/text-field/text-field.copy";

import type { DateFieldDisplay, DateFieldProps } from "./date-field.types";

const FIELD_MESSAGE = "text-(length:--font-size-label)";
// The display follows the app's formatting locale, which the app provider sets (AC-L10N-005).
// Frozen per-locale lookup, never a mutable one (§5.6).
const DATE_FORMATS: Readonly<
  Record<FormattingLocale, Readonly<Record<DateFieldDisplay, Intl.DateTimeFormat>>>
> = Object.freeze({
  "id-ID": {
    date: new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }),
    weekday: new Intl.DateTimeFormat("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }),
  },
  "en-US": {
    date: new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }),
    weekday: new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }),
  },
});
const TRIGGER_CLASS =
  "flex h-(--component-input-height) w-full items-center gap-(--space-2) rounded-(--component-input-radius) border border-(--component-input-border) bg-(--component-input-background) px-(--component-input-padding-x) text-left text-(length:--font-size-body) text-(--component-input-text) outline-none transition-colors data-hovered:border-(--component-input-border-hover) data-focus-visible:border-(--component-input-border-focus) data-focus-visible:shadow-[inset_0_0_0_1px_var(--component-input-border-focus),0_0_0_4px_var(--color-semantic-focus-glow)] data-disabled:border-(--component-input-border-disabled) data-disabled:bg-(--component-input-background-disabled) data-disabled:text-(--component-input-text-disabled)";
const NAV_CLASS =
  "flex size-(--space-9) items-center justify-center rounded-(--component-calendar-day-radius) text-(--component-calendar-day-number) outline-none data-hovered:bg-(--component-calendar-day-background-hover) data-focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]";

/** Formats a YYYY-MM-DD date for display, e.g. "10 Nov 2026" or "Sel, 10 Nov 2026". @param value - the ISO date @param display - with or without the weekday @returns the display text */
function formatDate(value: string, display: DateFieldDisplay, locale: FormattingLocale): string {
  return DATE_FORMATS[locale][display].format(new Date(`${value}T00:00:00Z`));
}

/** Renders a text-field-looking date picker with a calendar popover (C25).
 * @param props - controlled ISO date and field presentation options
 * @returns the accessible date field
 */
export function DateField(props: Readonly<DateFieldProps>) {
  const handleChange = (date: DateValue | null) => {
    props.onChange(date === null ? null : date.toString());
  };
  return (
    <DatePicker
      value={props.value === null ? null : parseDate(props.value)}
      onChange={handleChange}
      isDisabled={props.isDisabled}
      isInvalid={Boolean(props.errorMessage)}
      validationBehavior="aria"
      className="flex flex-col gap-(--component-input-gap)"
    >
      <DateFieldLabel label={props.label} isOptional={props.isOptional} />
      <DateFieldTrigger {...props} />
      {props.description && !props.errorMessage ? (
        <Text slot="description" className={cn(FIELD_MESSAGE, "text-(--component-input-helper)")}>
          {props.description}
        </Text>
      ) : null}
      {props.errorMessage ? (
        <FieldError className={cn(FIELD_MESSAGE, "text-(--component-input-error-text)")}>
          {props.errorMessage}
        </FieldError>
      ) : null}
      <DateFieldCalendar title={props.label} />
    </DatePicker>
  );
}

function DateFieldCalendar({ title }: Readonly<{ title: string }>) {
  const isMobile = useMobileViewport();
  const state = useContext(DatePickerStateContext);
  const handleOpenChange = (isOpen: boolean) => {
    state?.setOpen(isOpen);
  };
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={state?.isOpen ?? false}
        onOpenChange={handleOpenChange}
        title={title}
        variant="form"
      >
        <div className="flex justify-center pb-(--space-4)">
          <CalendarPanel />
        </div>
      </BottomSheet>
    );
  }
  return (
    <Popover
      placement="bottom start"
      offset={4}
      className="rounded-(--component-menu-radius) border border-(--component-menu-border) bg-(--component-menu-background) p-(--space-3) shadow-[0_var(--elevation-1-offset-y)_var(--elevation-1-blur)_var(--color-semantic-elevation-1-color)]"
    >
      <Dialog className="outline-none">
        <CalendarPanel />
      </Dialog>
    </Popover>
  );
}

function DateFieldLabel({
  label,
  isOptional,
}: Readonly<Pick<DateFieldProps, "label" | "isOptional">>) {
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

function DateFieldTrigger({
  value,
  display,
  placeholder,
  errorMessage,
}: Readonly<Pick<DateFieldProps, "value" | "display" | "placeholder" | "errorMessage">>) {
  const locale = useFormattingLocale();
  return (
    <Group className="block w-full">
      <AriaButton
        className={cn(TRIGGER_CLASS, errorMessage && "border-(--component-input-border-error)")}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            value === null && "text-(--component-input-placeholder)",
          )}
        >
          {value === null ? (placeholder ?? "") : formatDate(value, display, locale)}
        </span>
        <Icon name="calendar" aria-hidden="true" className="text-(--component-input-placeholder)" />
      </AriaButton>
    </Group>
  );
}

function CalendarPanel() {
  return (
    <Calendar className="flex flex-col gap-(--space-2)">
      <header className="flex items-center justify-between gap-(--space-2)">
        <AriaButton slot="previous" className={NAV_CLASS}>
          <Icon name="chevron-left" aria-hidden="true" size="sm" />
        </AriaButton>
        <Heading className="text-(length:--font-size-body) font-semibold text-(--component-calendar-day-number)" />
        <AriaButton slot="next" className={NAV_CLASS}>
          <Icon name="chevron-right" aria-hidden="true" size="sm" />
        </AriaButton>
      </header>
      <CalendarGrid className="border-separate border-spacing-(--space-1)">
        {(date) => (
          <CalendarCell
            date={date}
            className="flex size-(--space-9) items-center justify-center rounded-(--component-calendar-day-radius) text-(length:--font-size-body) text-(--component-calendar-day-number) outline-none data-hovered:bg-(--component-calendar-day-background-hover) data-selected:bg-(--component-calendar-day-background-selected) data-selected:text-(--component-calendar-day-number-selected) data-outside-month:text-(--component-calendar-day-label) data-focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]"
          />
        )}
      </CalendarGrid>
    </Calendar>
  );
}
