"use client";

import { Children, cloneElement, isValidElement } from "react";
import { MenuTrigger as AriaMenuTrigger, Popover } from "react-aria-components";

import type { MenuTriggerProps } from "./menu-trigger.types";

/** Connects a trigger to a positioned, keyboard-navigable Menu (C10). */
export function MenuTrigger({ label, children }: Readonly<MenuTriggerProps>) {
  const [trigger, menu] = Children.toArray(children);
  if (!isValidElement<{ "aria-label"?: string }>(trigger) || !isValidElement(menu)) {
    return null;
  }

  return (
    <AriaMenuTrigger>
      {cloneElement(trigger, { "aria-label": label })}
      <Popover
        placement="bottom start"
        offset={4}
        className="entering:animate-in exiting:animate-out"
      >
        {menu}
      </Popover>
    </AriaMenuTrigger>
  );
}
