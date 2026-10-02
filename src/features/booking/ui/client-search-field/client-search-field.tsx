"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const router = useRouter();
  const [value, setValue] = useState(q);
  const pathname = `/w/${workspaceId}/clients${status === "ARCHIVED" ? "/archived" : ""}`;
  useEffect(() => {
    if (value === q) return;
    const destination = value ? `${pathname}?q=${encodeURIComponent(value)}` : pathname;
    const timer = window.setTimeout(() => {
      router.replace(destination);
    }, CLIENT_SEARCH_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [pathname, q, router, value]);
  function clear(): void {
    setValue("");
    router.replace(pathname);
  }
  return (
    <>
      <div className="w-full md:w-[320px]">
        <Input
          variant="search"
          aria-label={CLIENT_COPY.searchLabel}
          placeholder={CLIENT_COPY.searchPlaceholder}
          value={value}
          onChange={setValue}
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
