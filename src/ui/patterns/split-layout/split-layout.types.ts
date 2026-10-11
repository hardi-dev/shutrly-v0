import type { PropsWithChildren, ReactNode } from "react";

export interface SplitLayoutProps extends PropsWithChildren {
  editorial?: ReactNode;
  /** Rendered at the right end of the brand row, e.g. the language link. */
  headerAction?: ReactNode;
}
