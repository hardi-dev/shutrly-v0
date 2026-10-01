"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { internalHrefOf } from "./internal-href";
import type { UnsavedChangesGuard } from "./use-unsaved-changes-guard.types";

/**
 * While the form is dirty, asks before an in-app link navigates away and lets the browser warn
 * on reload or close (A-7, AC-MSG-014). Browser back/forward is not intercepted (D-M2).
 * @param isDirty - whether the form has unsaved changes
 * @returns the confirm state and the stay / leave handlers
 */
export function useUnsavedChangesGuard(isDirty: boolean): UnsavedChangesGuard {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!isDirty) return undefined;
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    // Capture phase on the document runs before Next/React Aria link handlers.
    function handleClick(event: MouseEvent) {
      const { origin, pathname, search } = window.location;
      const href = internalHrefOf(event, origin, `${pathname}${search}`);
      if (href === null) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingHref(href);
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [isDirty]);

  function stay() {
    setPendingHref(null);
  }

  function leave() {
    if (pendingHref) router.push(pendingHref);
    setPendingHref(null);
  }

  return { isConfirmOpen: pendingHref !== null, stay, leave };
}
