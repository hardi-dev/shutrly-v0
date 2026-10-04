"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import { useSlotTarget } from "@/ui/hooks/use-slot-target/use-slot-target";

export const COMPACT_BAR_ACTIONS_ID = "owner-compact-bar-actions";

/**
 * Renders a sub-page's actions into the phone Compact Bar's actions slot (C33), once the shell has rendered it.
 * @param props - the actions
 * @returns a portal, or nothing before the slot exists or when another page owns it
 */
export function CompactBarActions({ children }: Readonly<{ children: ReactNode }>) {
  const target = useSlotTarget(COMPACT_BAR_ACTIONS_ID, "compactActionsOwner");
  return target ? createPortal(children, target) : null;
}
