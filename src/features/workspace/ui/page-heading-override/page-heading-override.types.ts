import type { ReactNode } from "react";

import type { StatusChipProps } from "@/ui/primitives/status-chip/status-chip.types";

export interface PageHeadingOverrideValue {
  readonly title: string;
  readonly subtitle?: string;
  /** Shown as a Status Chip after the title on desktop (detail pages). */
  readonly status?: Pick<StatusChipProps, "label" | "tone" | "hasDot">;
  /** One line under the title on desktop, in place of the subtitle. */
  readonly meta?: string;
  readonly parent: { readonly label: string; readonly href: string };
  /** Hides the phone Bottom Nav on pages with their own sticky action bar. */
  readonly hidesBottomNav?: boolean;
}

export interface PageHeadingOverrideProviderProps {
  readonly children: ReactNode;
  readonly onChange: (value: PageHeadingOverrideValue | null) => void;
}

export type PageHeadingOverrideProps = PageHeadingOverrideValue;
