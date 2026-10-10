import type { ReactNode } from "react";

import type { OwnerLocaleAction } from "../account-menu/account-menu.types";

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
  /** Saves the owner's language from the account menu; omit to hide the language group. */
  localeAction?: OwnerLocaleAction;
  subPages?: readonly OwnerSubPage[];
}
