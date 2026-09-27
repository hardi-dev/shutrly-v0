"use client";

import { cloneElement, isValidElement, useId } from "react";
import { useState } from "react";

import type { TooltipProps } from "./tooltip.types";

/** Adds a focus- and hover-triggered tooltip to a single focusable child. */
export function Tooltip({ label, children }: Readonly<TooltipProps>) {
  const tooltipId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const trigger = isValidElement<Record<string, unknown>>(children)
    ? cloneElement(children, {
        "aria-describedby": tooltipId,
        onFocus: () => {
          setIsOpen(true);
        },
        onBlur: () => {
          setIsOpen(false);
        },
        onMouseEnter: () => {
          setIsOpen(true);
        },
        onMouseLeave: () => {
          setIsOpen(false);
        },
      })
    : children;

  return (
    <span className="relative inline-flex">
      {trigger}
      {isOpen ? (
        <span
          id={tooltipId}
          role="tooltip"
          className={[
            "absolute bottom-full left-1/2 mb-(--space-1) -translate-x-1/2 whitespace-nowrap",
            "rounded-(--component-tooltip-radius) px-(--component-tooltip-padding-x)",
            "py-(--component-tooltip-padding-y) text-(length:--font-size-label)",
            "bg-(--component-tooltip-background) text-(--component-tooltip-text)",
            "shadow-[0_var(--elevation-1-offset-y)_var(--elevation-1-blur)_var(--color-semantic-elevation-1-color)]",
          ].join(" ")}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
