"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { PageActionsProps } from "./page-actions.types";

export const PAGE_ACTIONS_ID = "owner-page-actions";

/**
 * Renders a page's primary actions into the desktop Page Header actions slot (C40), after mount.
 * @param props - the actions
 * @returns a portal, or nothing before mount or when the slot is absent
 */
export function PageActions({ children }: Readonly<PageActionsProps>) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // The slot is only available after the owner shell has mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resolves the portal target after mount
    setTarget(document.getElementById(PAGE_ACTIONS_ID));
  }, []);

  return target ? createPortal(children, target) : null;
}
