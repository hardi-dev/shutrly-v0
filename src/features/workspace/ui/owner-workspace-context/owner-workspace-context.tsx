"use client";

import { createContext, useContext } from "react";

import type {
  OwnerWorkspaceContextValue,
  OwnerWorkspaceProviderProps,
} from "./owner-workspace-context.types";

const OwnerWorkspaceContext = createContext<OwnerWorkspaceContextValue | null>(null);

/** Gives the verified workspace id and name to client slots under the Owner shell (F-24 D-5). */
export function OwnerWorkspaceProvider({
  workspaceId,
  workspaceName,
  children,
}: Readonly<OwnerWorkspaceProviderProps>) {
  return (
    <OwnerWorkspaceContext.Provider value={{ workspaceId, workspaceName }}>
      {children}
    </OwnerWorkspaceContext.Provider>
  );
}

/** The verified workspace of the nearest Owner shell, or null outside one. @returns the workspace id and name */
export function useOwnerWorkspace(): OwnerWorkspaceContextValue | null {
  return useContext(OwnerWorkspaceContext);
}
