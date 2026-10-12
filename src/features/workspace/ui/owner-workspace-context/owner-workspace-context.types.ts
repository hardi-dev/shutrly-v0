import type { ReactNode } from "react";

export interface OwnerWorkspaceContextValue {
  readonly workspaceId: string;
  readonly workspaceName: string;
}

export interface OwnerWorkspaceProviderProps extends OwnerWorkspaceContextValue {
  readonly children: ReactNode;
}
