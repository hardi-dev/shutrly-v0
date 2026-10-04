"use client";

import { useEffect, useState } from "react";

/**
 * Claims a shell slot (by element id) once it exists and no other page owns it, waiting for it
 * when the shell renders it after the page mounted (e.g. the phone Compact Bar).
 * @param slotId - the slot element's id
 * @param ownerAttribute - the data attribute (camelCase dataset key) that marks the owner
 * @returns the slot element once claimed, else null
 */
export function useSlotTarget(slotId: string, ownerAttribute: string): HTMLElement | null {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    let claimed: HTMLElement | null = null;
    const claim = (): boolean => {
      const slot = document.getElementById(slotId);
      if (!slot || slot.dataset[ownerAttribute] === "true") return false;
      slot.dataset[ownerAttribute] = "true";
      claimed = slot;
      setTarget(slot);
      return true;
    };
    const observer = new MutationObserver(() => {
      if (claim()) observer.disconnect();
    });
    // Resolved after mount: the shell's slot is not available during render.

    if (!claim()) observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (claimed) Reflect.deleteProperty(claimed.dataset, ownerAttribute);
    };
  }, [slotId, ownerAttribute]);
  return target;
}
