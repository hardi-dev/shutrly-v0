"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CLIENT_SEARCH_DEBOUNCE_MS } from "@/features/booking/domain/client-search/client-search";
import { Input } from "@/ui/primitives/input/input";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import type { ClientSearchFieldProps } from "./client-search-field.types";

/** Updates the current client-tab URL after a short, accessible debounce. */
export function ClientSearchField({
  workspaceId,
  status,
  q,
  resultCount,
}: Readonly<ClientSearchFieldProps>) {
  const pathname = `/w/${workspaceId}/clients${status === "ARCHIVED" ? "/archived" : ""}`;
  const { value, change, clear } = useClientSearch(q, pathname);
  return (
    <>
      <div className="w-full md:w-[320px]">
        <Input
          variant="search"
          aria-label={CLIENT_COPY.searchLabel}
          placeholder={CLIENT_COPY.searchPlaceholder}
          value={value}
          onChange={change}
          iconLeading="search"
          iconTrailing={value ? "x" : undefined}
          iconTrailingAction={
            value ? { label: CLIENT_COPY.clearSearch, onPress: clear } : undefined
          }
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {value ? CLIENT_COPY.searchResultCount(resultCount) : ""}
      </p>
    </>
  );
}

function useClientSearch(q: string, pathname: string) {
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
  // Navigate only from the owner's own input; reacting to `q` would make the desktop and phone
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
