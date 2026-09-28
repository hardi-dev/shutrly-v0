"use client";

import { useState } from "react";

import { Menu } from "@/ui/patterns/menu/menu";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger as WorkspaceMenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SidebarWorkspaceTrigger } from "@/ui/patterns/sidebar/sidebar";

import { CreateWorkspaceDialog } from "../create-workspace-dialog/create-workspace-dialog";
import { WORKSPACE_SWITCHER_COPY } from "./workspace-switcher.copy";
import type { WorkspaceSwitcherProps } from "./workspace-switcher.types";

/** Renders the keyboard-accessible workspace switcher menu. @param props - current workspace and actions @returns the switcher trigger, menu and create dialog */
export function WorkspaceSwitcher({
  currentName,
  workspaces,
  isCompact = false,
  onSwitch,
  onCreate,
}: Readonly<WorkspaceSwitcherProps>) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  function handleCreate() {
    setIsCreateOpen(true);
  }
  return (
    <>
      <WorkspaceMenuTrigger label={WORKSPACE_SWITCHER_COPY.trigger}>
        <SidebarWorkspaceTrigger workspaceName={currentName} isCompact={isCompact} />
        <Menu aria-label={WORKSPACE_SWITCHER_COPY.menuLabel}>
          {workspaces.map((workspace) => (
            <WorkspaceMenuItem key={workspace.id} workspace={workspace} onSwitch={onSwitch} />
          ))}
          <MenuItem label={WORKSPACE_SWITCHER_COPY.create} icon="plus" onSelect={handleCreate} />
        </Menu>
      </WorkspaceMenuTrigger>
      <CreateWorkspaceDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        action={onCreate}
      />
    </>
  );
}

function WorkspaceMenuItem({
  workspace,
  onSwitch,
}: Readonly<{
  workspace: WorkspaceSwitcherProps["workspaces"][number];
  onSwitch: WorkspaceSwitcherProps["onSwitch"];
}>) {
  function handleSwitch() {
    void onSwitch(workspace.id);
  }

  return (
    <MenuItem label={workspace.name} isSelected={workspace.isCurrent} onSelect={handleSwitch} />
  );
}
