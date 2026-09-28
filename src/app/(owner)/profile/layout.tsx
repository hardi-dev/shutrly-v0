import type { ReactNode } from "react";

import { createWorkspaceAction } from "@/app/actions/workspace/create";
import { switchWorkspaceAction } from "@/app/actions/workspace/switch";
import { requireOwnerOrRedirect } from "@/composition/auth/owner-guard/owner-guard";
import { resolveOwnerHome } from "@/composition/workspace/owner-workspace/owner-workspace";
import { loadWorkspaceSwitcher } from "@/composition/workspace/workspace-flow/workspace-flow";
import { OwnerShell } from "@/features/workspace/ui/owner-shell/owner-shell";

import { PROFILE_LAYOUT_COPY } from "./layout.copy";

export default async function ProfileLayout({ children }: Readonly<{ children: ReactNode }>) {
  const [account, workspace] = await Promise.all([requireOwnerOrRedirect(), resolveOwnerHome()]);
  const workspaces = await loadWorkspaceSwitcher(workspace.id);

  return (
    <OwnerShell
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      accountName={account.name}
      accountEmail={account.email}
      pathname="/profile"
      title={PROFILE_LAYOUT_COPY.title}
      workspaces={workspaces}
      onSwitch={switchWorkspaceAction}
      onCreate={createWorkspaceAction}
    >
      {children}
    </OwnerShell>
  );
}
