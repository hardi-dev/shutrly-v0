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
  /** The first or the last crumb: it never shrinks (F-23 OQ-5). */
  readonly isEdge: boolean;
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
  /** A trail rendered elsewhere (the Owner `@crumbs` slot, ADR-026); replaces the one built from `breadcrumbs`. */
  trail?: ReactNode;
  /** Sits left of the breadcrumb, e.g. the sidebar toggle (F-23). */
  leading?: ReactNode;
  tabs?: { readonly label: string; readonly tabs: readonly TabLink[] };
  /** No horizontal padding and no outer border: the page puts it in a bordered band whose column already lines it up (client shell, `ra85A`). */
  isFlush?: boolean;
}

export interface PageHeaderTrailProps {
  readonly items: readonly BreadcrumbItem[];
  /** The trail's accessible name, translated by the caller (the server slot calls `getTranslations`). */
  readonly label: string;
}

export interface BreadcrumbRowProps {
  readonly trail: ReactNode;
  readonly utilities: PageHeaderProps["utilities"];
  readonly leading: PageHeaderProps["leading"];
  readonly isFlush: boolean;
}

export interface HeaderTabsProps {
  readonly tabs: NonNullable<PageHeaderProps["tabs"]>;
  readonly isFlush: boolean;
}

export interface HeaderTitleProps {
  readonly title: string;
  readonly adornment: PageHeaderProps["titleAdornment"];
}

export interface CrumbTextProps {
  readonly label: string;
  readonly isCurrent: boolean;
  readonly fit: string;
  readonly title: string | undefined;
}
