"use client";

import { useEffect, useRef, useState } from "react";
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
  const ownsTarget = useRef(false);

  useEffect(() => {
    // The slot is only available after the owner shell has mounted.
    const nextTarget = document.getElementById(PAGE_ACTIONS_ID);
    if (!nextTarget || nextTarget.dataset.pageActionsOwner === "true") return;
    nextTarget.dataset.pageActionsOwner = "true";
    ownsTarget.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resolves the portal target after mount
    setTarget(nextTarget);
    return () => {
      if (ownsTarget.current) {
        delete nextTarget.dataset.pageActionsOwner;
        ownsTarget.current = false;
      }
    };
  }, []);

  return target ? createPortal(children, target) : null;
}
