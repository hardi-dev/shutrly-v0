"use client";

import { Button as AriaButton, Group, Input, NumberField } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";

import { STEPPER_COPY } from "./stepper.copy";
import type { StepperProps } from "./stepper.types";

// 32 px visible button; the pseudo-element widens the hit area to 44 px on touch (stepper.md › Accessibility).
const STEP =
  "relative flex size-8 shrink-0 items-center justify-center rounded-(--radius-full) outline-none before:absolute before:-inset-1.5 before:content-[''] disabled:opacity-(--opacity-disabled) data-focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]";

/**
 * Adjusts a small whole number in place with − and + buttons (C08): a spinbutton from `min` to
 * `max`, Arrow Up/Down change the value, and each step button disables at its end.
 * @param props - accessible name, value, bounds and the change callback
 * @returns the stepper
 */
export function Stepper({
  label,
  value,
  onChange,
  min = 1,
  max,
  isDisabled = false,
  className,
}: Readonly<StepperProps>) {
  return (
    <NumberField
      aria-label={label}
      value={value}
      onChange={onChange}
      minValue={min}
      maxValue={max}
      isDisabled={isDisabled}
      formatOptions={{ maximumFractionDigits: 0 }}
      className={cn("w-fit", className)}
    >
      <Group className="flex items-center gap-(--component-stepper-gap) rounded-(--component-stepper-radius) border border-(--component-stepper-border) bg-(--component-stepper-background) p-(--component-stepper-padding)">
        <AriaButton
          slot="decrement"
          aria-label={STEPPER_COPY.decrease}
          className={cn(
            STEP,
            "bg-(--component-stepper-button-background) text-(--component-stepper-button-icon) data-hovered:bg-(--component-stepper-button-background-hover)",
          )}
        >
          <Icon name="minus" size="sm" aria-hidden="true" />
        </AriaButton>
        <Input className="w-8 bg-transparent text-center text-(length:--font-size-body) font-bold text-(--component-stepper-value) outline-none" />
        <AriaButton
          slot="increment"
          aria-label={STEPPER_COPY.increase}
          className={cn(
            STEP,
            "bg-(--component-stepper-button-primary-background) text-(--component-stepper-button-primary-icon) data-hovered:bg-(--component-stepper-button-primary-background-hover)",
          )}
        >
          <Icon name="plus" size="sm" aria-hidden="true" />
        </AriaButton>
      </Group>
    </NumberField>
  );
}
