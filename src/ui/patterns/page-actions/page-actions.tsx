"use client";

import { createPortal } from "react-dom";

import { useSlotTarget } from "@/ui/hooks/use-slot-target/use-slot-target";

import type { PageActionsProps } from "./page-actions.types";

export const PAGE_ACTIONS_ID = "owner-page-actions";

/**
 * Renders a page's primary actions into the desktop Page Header actions slot (C40), once the shell has rendered it.
 * @param props - the actions
 * @returns a portal, or nothing before the slot exists or when another page owns it
 */
export function PageActions({ children }: Readonly<PageActionsProps>) {
  const target = useSlotTarget(PAGE_ACTIONS_ID, "pageActionsOwner");
  return target ? createPortal(children, target) : null;
}
