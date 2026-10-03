"use client";

import { createContext, useContext, useEffect } from "react";

import type {
  PageHeadingOverrideProps,
  PageHeadingOverrideProviderProps,
  PageHeadingOverrideValue,
} from "./page-heading-override.types";

const PageHeadingOverrideContext = createContext<
  ((value: PageHeadingOverrideValue | null) => void) | null
>(null);

/** Provides the Owner shell callback used by detail pages to override their heading. */
export function PageHeadingOverrideProvider({
  children,
  onChange,
}: Readonly<PageHeadingOverrideProviderProps>) {
  return (
    <PageHeadingOverrideContext.Provider value={onChange}>
      {children}
    </PageHeadingOverrideContext.Provider>
  );
}

/** Registers a detail page heading with the nearest Owner shell. */
export function PageHeadingOverride({
  title,
  subtitle,
  parent,
  hidesBottomNav,
}: Readonly<PageHeadingOverrideProps>) {
  const onChange = useContext(PageHeadingOverrideContext);
  const parentHref = parent.href;
  const parentLabel = parent.label;

  useEffect(() => {
    onChange?.({
      title,
      subtitle,
      parent: { href: parentHref, label: parentLabel },
      hidesBottomNav,
    });
    return () => onChange?.(null);
  }, [hidesBottomNav, onChange, parentHref, parentLabel, subtitle, title]);

  return null;
}
