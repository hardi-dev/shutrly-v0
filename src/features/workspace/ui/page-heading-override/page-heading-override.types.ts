import type { ReactNode } from "react";

export interface PageHeadingOverrideValue {
  readonly title: string;
  readonly subtitle?: string;
  readonly parent: { readonly label: string; readonly href: string };
  /** Hides the phone Bottom Nav on pages with their own sticky action bar. */
  readonly hidesBottomNav?: boolean;
}

export interface PageHeadingOverrideProviderProps {
  readonly children: ReactNode;
  readonly onChange: (value: PageHeadingOverrideValue | null) => void;
}

export type PageHeadingOverrideProps = PageHeadingOverrideValue;
