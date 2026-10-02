import type { ReactNode } from "react";

export interface PageHeadingOverrideValue {
  readonly title: string;
  readonly subtitle?: string;
  readonly parent: { readonly label: string; readonly href: string };
}

export interface PageHeadingOverrideProviderProps {
  readonly children: ReactNode;
  readonly onChange: (value: PageHeadingOverrideValue | null) => void;
}

export type PageHeadingOverrideProps = PageHeadingOverrideValue;
