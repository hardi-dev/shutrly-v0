"use client";

import { RadioButton, RadioField, RadioGroup } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import type { OptionCardGroupProps, OptionCardProps } from "./option-card-group.types";

const RADIO_CARD = [
  "group flex w-full items-center gap-(--component-option-card-gap) rounded-(--component-option-card-radius) border bg-(--component-option-card-background) p-(--component-option-card-padding)",
  "border-(--component-option-card-border) outline-none",
  "data-hovered:border-(--component-option-card-border-hover)",
  "data-selected:border-2 data-selected:border-(--component-option-card-border-selected)",
  "data-focus-visible:shadow-[0_0_0_4px_var(--color-semantic-focus-glow)]",
  "data-disabled:bg-(--component-option-card-background-disabled) data-disabled:border-(--component-option-card-border-disabled)",
];

function OptionCard({ option }: Readonly<OptionCardProps>) {
  return (
    <RadioField value={option.value} isDisabled={option.isDisabled} className="contents">
      <RadioButton className={cn(RADIO_CARD)}>
        <span
          aria-hidden="true"
          className="flex size-4 shrink-0 items-center justify-center rounded-full border border-(--color-semantic-border-control) group-data-selected:border-(--color-semantic-action-primary) group-data-selected:bg-(--color-semantic-action-primary)"
        >
          <span className="size-1.5 rounded-full bg-(--color-semantic-surface-canvas) opacity-0 group-data-selected:opacity-100" />
        </span>
        <Icon
          name={option.icon}
          size="md"
          aria-hidden="true"
          className="size-[18px] text-(--component-option-card-icon) group-data-disabled:text-(--component-option-card-icon-disabled)"
        />
        <span className="flex min-w-0 flex-1 flex-col gap-(--component-option-card-text-gap)">
          <span className="text-(length:--font-size-body) font-semibold text-(--color-semantic-text-primary) group-data-disabled:text-(--component-option-card-title-disabled)">
            {option.title}
          </span>
          {option.description ? (
            <span className="text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary) group-data-disabled:hidden">
              {option.description}
            </span>
          ) : null}
        </span>
        {option.badge ? <StatusChip tone="neutral" label={option.badge} hasDot={false} /> : null}
      </RadioButton>
    </RadioField>
  );
}

/**
 * Renders a single-choice radio group whose options are presented as accessible cards (C44).
 * @param props - group label, option cards, selected value and change callback
 * @returns the option card group
 */
export function OptionCardGroup({
  label,
  options,
  value,
  onChange,
  isLabelVisible = false,
}: Readonly<OptionCardGroupProps>) {
  const handleChange = (nextValue: string) => {
    onChange(nextValue);
  };
  return (
    <RadioGroup
      aria-label={label}
      value={value}
      onChange={handleChange}
      className="flex flex-col gap-(--space-2)"
    >
      <span className={cn("text-(--color-semantic-text-primary)", !isLabelVisible && "sr-only")}>
        {label}
      </span>
      {options.map((option) => (
        <OptionCard key={option.value} option={option} />
      ))}
    </RadioGroup>
  );
}
