"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CLIENT_SEARCH_DEBOUNCE_MS } from "@/features/booking/domain/client-search/client-search";

/**
 * Holds the search text and replaces the tab URL's `?q=` once typing pauses (A-3).
 * @param q - the query the server rendered with
 * @param pathname - the tab route, without a query
 * @returns the text, a change handler and a clear handler
 */
export function useTeamMemberSearch(q: string, pathname: string) {
  const router = useRouter();
  const [value, setValue] = useState(q);
  const [syncedQ, setSyncedQ] = useState(q);
  const timer = useRef<number | undefined>(undefined);
  // Follow a query changed elsewhere (the other breakpoint's field, back/forward) unless typing.
  if (q !== syncedQ) {
    setSyncedQ(q);
    if (timer.current === undefined) setValue(q);
  }
  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
    },
    [],
  );
  // Navigate only from the owner's own input: reacting to `q` would make the desktop and phone
  // fields replace the URL back and forth forever.
  function change(next: string): void {
    setValue(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      router.replace(next ? `${pathname}?q=${encodeURIComponent(next)}` : pathname);
    }, CLIENT_SEARCH_DEBOUNCE_MS);
  }
  function clear(): void {
    window.clearTimeout(timer.current);
    timer.current = undefined;
    setValue("");
    router.replace(pathname);
  }
  return { value, change, clear };
}
