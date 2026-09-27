import type { ReactNode } from "react";

export interface OwnerShellProps {
  workspaceId: string;
  workspaceName: string;
  accountName: string;
  accountEmail: string;
  pathname: string;
  title: string;
  children: ReactNode;
  workspaces: readonly { id: string; name: string; isCurrent: boolean }[];
  onSwitch: (workspaceId: string) => Promise<void>;
  onCreate: (formData: FormData) => Promise<void>;
}
