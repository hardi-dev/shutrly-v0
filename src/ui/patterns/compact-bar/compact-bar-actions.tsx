"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const COMPACT_BAR_ACTIONS_ID = "owner-compact-bar-actions";

/**
 * Renders a sub-page's actions into the phone Compact Bar's actions slot (C33), after mount.
 * @param props - the actions
 * @returns a portal, or nothing before mount or when the slot is absent
 */
export function CompactBarActions({ children }: Readonly<{ children: ReactNode }>) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const ownsTarget = useRef(false);

  useEffect(() => {
    // The slot is only available after the owner shell has mounted.
    const nextTarget = document.getElementById(COMPACT_BAR_ACTIONS_ID);
    if (!nextTarget || nextTarget.dataset.compactActionsOwner === "true") return;
    nextTarget.dataset.compactActionsOwner = "true";
    ownsTarget.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resolves the portal target after mount
    setTarget(nextTarget);
    return () => {
      if (ownsTarget.current) {
        delete nextTarget.dataset.compactActionsOwner;
        ownsTarget.current = false;
      }
    };
  }, []);

  return target ? createPortal(children, target) : null;
}
