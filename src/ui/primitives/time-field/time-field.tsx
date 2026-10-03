"use client";

import { parseTime } from "@internationalized/date";
import type { TimeValue } from "react-aria-components";
import {
  DateInput,
  DateSegment,
  FieldError,
  I18nProvider,
  Label,
  TimeField as AriaTimeField,
} from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import { Icon } from "../icon/icon";
import { TEXT_FIELD_COPY } from "../text-field/text-field.copy";
import type { TimeFieldProps } from "./time-field.types";

const LOCALE = "id-ID";
const MINUTE_END = 5;
const FRAME_CLASS =
  "flex h-(--component-input-height) w-full items-center gap-(--space-2) rounded-(--component-input-radius) border border-(--component-input-border) bg-(--component-input-background) px-(--component-input-padding-x) text-(length:--font-size-body) text-(--component-input-text) transition-colors hover:border-(--component-input-border-hover) focus-within:border-(--component-input-border-focus) focus-within:shadow-[inset_0_0_0_1px_var(--component-input-border-focus),0_0_0_4px_var(--color-semantic-focus-glow)]";

/** Renders a 24-hour time input that looks like a text field with a clock icon (Indonesian style, 07.30).
 * @param props - controlled HH:MM value and field presentation options
 * @returns the accessible time field
 */
export function TimeField(props: Readonly<TimeFieldProps>) {
  const handleChange = (time: TimeValue | null) => {
    props.onChange(time === null ? null : time.toString().slice(0, MINUTE_END));
  };
  return (
    <I18nProvider locale={LOCALE}>
      <AriaTimeField
        value={props.value === null ? null : parseTime(props.value)}
        onChange={handleChange}
        hourCycle={24}
        granularity="minute"
        shouldForceLeadingZeros
        isDisabled={props.isDisabled}
        isInvalid={Boolean(props.errorMessage)}
        validationBehavior="aria"
        className="flex flex-col gap-(--component-input-gap)"
      >
        <div className="flex items-center gap-(--space-1)">
          <Label className="text-(length:--font-size-label) font-semibold text-(--component-input-label)">
            {props.label}
          </Label>
          {props.isOptional ? (
            <span className="text-(length:--font-size-label) text-(--component-input-helper)">
              {TEXT_FIELD_COPY.optionalSuffix}
            </span>
          ) : null}
        </div>
        <TimeFieldFrame errorMessage={props.errorMessage} isDisabled={props.isDisabled} />
        {props.errorMessage ? (
          <FieldError className="text-(length:--font-size-label) text-(--component-input-error-text)">
            {props.errorMessage}
          </FieldError>
        ) : null}
      </AriaTimeField>
    </I18nProvider>
  );
}

function TimeFieldFrame({
  errorMessage,
  isDisabled,
}: Readonly<Pick<TimeFieldProps, "errorMessage" | "isDisabled">>) {
  return (
    <div
      className={cn(
        FRAME_CLASS,
        errorMessage && "border-(--component-input-border-error)",
        isDisabled &&
          "border-(--component-input-border-disabled) bg-(--component-input-background-disabled) text-(--component-input-text-disabled)",
      )}
    >
      <DateInput className="flex min-w-0 flex-1 items-center outline-none">
        {(segment) => (
          <DateSegment
            segment={segment}
            className={cn(
              "rounded-(--space-1) px-px outline-none data-focused:bg-(--component-menu-item-background-hover)",
              segment.isPlaceholder && "text-(--component-input-placeholder)",
            )}
          />
        )}
      </DateInput>
      <Icon name="clock" aria-hidden="true" className="text-(--component-input-placeholder)" />
    </div>
  );
}
