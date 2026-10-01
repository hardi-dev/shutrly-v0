import type { ReactNode } from "react";

import { logoutAction } from "@/app/actions/auth/login";
import { createWorkspaceAction } from "@/app/actions/workspace/create";
import { switchWorkspaceAction } from "@/app/actions/workspace/switch";
import { requireOwnerOrRedirect } from "@/composition/auth/owner-guard/owner-guard";
import { verifyOwnerWorkspace } from "@/composition/workspace/owner-workspace/owner-workspace";
import { loadWorkspaceSwitcher } from "@/composition/workspace/workspace-flow/workspace-flow";
import { messageTemplateSubPages } from "@/features/communications/ui/template-sub-pages/template-sub-pages";
import { OwnerShell } from "@/features/workspace/ui/owner-shell/owner-shell";

import { WORKSPACE_LAYOUT_COPY } from "./layout.copy";

export default async function WorkspaceLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  const [account, verified, workspaces] = await Promise.all([
    requireOwnerOrRedirect(),
    verifyOwnerWorkspace(workspaceId),
    loadWorkspaceSwitcher(workspaceId),
  ]);
  return (
    <OwnerShell
      workspaceId={workspaceId}
      workspaceName={verified.workspace.name}
      accountName={account.name}
      accountEmail={account.email}
      title={WORKSPACE_LAYOUT_COPY.title}
      workspaces={workspaces}
      onSwitch={switchWorkspaceAction}
      onCreate={createWorkspaceAction}
      logoutAction={logoutAction}
      subPages={messageTemplateSubPages(workspaceId)}
    >
      {children}
    </OwnerShell>
  );
}
