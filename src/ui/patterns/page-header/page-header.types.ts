import type { ReactNode } from "react";

import type { TabLink } from "../tabs/tabs.types";

export interface BreadcrumbItem {
  readonly label: string;
  readonly href?: string;
  /** Acts in the page instead of linking (in-page state). */
  readonly onPress?: () => void;
}

export interface BreadcrumbTrailProps {
  readonly label: string;
  readonly items: readonly BreadcrumbItem[];
  /** Text after the trail, e.g. *· 2 folder · 212 foto*. */
  readonly trailing?: string;
  readonly className?: string;
}

export interface BreadcrumbTrailItemProps {
  readonly item: BreadcrumbItem;
  readonly isCurrent: boolean;
  readonly showSeparator: boolean;
}

export interface PageHeaderProps {
  parent: string;
  current: string;
  title: string;
  breadcrumbs?: readonly BreadcrumbItem[];
  subtitle?: string;
  /** Sits after the title, e.g. a status chip. */
  titleAdornment?: ReactNode;
  /** One line under the title, in place of the subtitle. */
  meta?: string;
  action?: ReactNode;
  utilities?: ReactNode;
  tabs?: { readonly label: string; readonly tabs: readonly TabLink[] };
  /** No horizontal padding and no outer border: the page puts it in a bordered band whose column already lines it up (client shell, `ra85A`). */
  isFlush?: boolean;
}
