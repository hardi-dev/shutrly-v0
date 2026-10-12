import type { ReactNode } from "react";

export interface OwnerSubPage {
  path: string;
  title: string;
  subtitle?: string;
  parent: { label: string; href: string };
}

export interface OwnerShellProps {
  workspaceId: string;
  workspaceName: string;
  accountName: string;
  accountEmail: string;
  title: string;
  children: ReactNode;
  workspaces: readonly { id: string; name: string; isCurrent: boolean }[];
  onSwitch: (workspaceId: string) => Promise<void>;
  onCreate: (formData: FormData) => Promise<void>;
  logoutAction?: () => Promise<void>;
  subPages?: readonly OwnerSubPage[];
  /** The breadcrumb rendered on the server (`@crumbs` slot or the profile layout, ADR-025). */
  trail?: ReactNode;
}
