"use client";

import type { PropsWithChildren } from "react";
import { I18nProvider } from "react-aria-components";

import { ToastRegion } from "@/ui/patterns/toast/toast";

/**
 * Client-side providers for the whole app. React Aria formats dates and numbers for the MVP
 * locale (ADR-010).
 * @param props - the app tree
 * @returns the tree inside `I18nProvider locale="id-ID"`
 */
export function AppProviders({ children }: Readonly<PropsWithChildren>) {
  return (
    <I18nProvider locale="id-ID">
      {children}
      <ToastRegion />
    </I18nProvider>
  );
}
