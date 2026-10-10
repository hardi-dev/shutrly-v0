import type { ReactNode } from "react";

import type { ClientGateView } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access.types";
import type { BreadcrumbItem } from "@/ui/patterns/page-header/page-header.types";

export interface ClientPageHeader {
  readonly title: string;
  readonly subtitle?: string;
  /** Desktop trail, current page last (A-26). */
  readonly breadcrumbs: readonly BreadcrumbItem[];
  /** Phone back button at the top of the content (A-26). */
  readonly back?: { readonly href: string; readonly label: string };
  readonly action?: ReactNode;
}

export interface ClientShellProps {
  readonly gate: ClientGateView;
  readonly header: ClientPageHeader;
  /** `narrow` is Beranda's 720 column; `wide` the 1096 container (A-24). */
  readonly width: "narrow" | "wide";
  readonly children: ReactNode;
}
