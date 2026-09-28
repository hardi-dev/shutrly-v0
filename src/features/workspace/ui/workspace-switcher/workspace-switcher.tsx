"use client";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useMemo, useState } from "react";

import { Menu } from "@/ui/patterns/menu/menu";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger as WorkspaceMenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SidebarWorkspaceTrigger } from "@/ui/patterns/sidebar/sidebar";
import { showToast } from "@/ui/patterns/toast/toast";

import { WORKSPACE_SWITCHER_COPY } from "./workspace-switcher.copy";
import type { WorkspaceSwitcherProps } from "./workspace-switcher.types";

/** Renders the keyboard-accessible workspace switcher menu. @param props - current workspace and actions @returns the switcher trigger, menu and create dialog */
// eslint-disable-next-line max-lines-per-function -- coordinates pending and failure UI state
export function WorkspaceSwitcher({
  currentName,
  workspaces,
  isCompact = false,
  onSwitch,
  onCreate,
}: Readonly<WorkspaceSwitcherProps>) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const sortedWorkspaces = useMemo(
    () => [...workspaces].sort((left, right) => left.name.localeCompare(right.name)),
    [workspaces],
  );
  const selectWorkspace = async (workspaceId: string) => {
    setPendingId(workspaceId);
    try {
      await onSwitch(workspaceId);
    } catch (error: unknown) {
      if (isRedirectError(error)) throw error;
      showToast({
        tone: "danger",
        title: WORKSPACE_SWITCHER_COPY.failed,
        body: "Workspace tidak berubah.",
        action: {
          label: WORKSPACE_SWITCHER_COPY.retry,
          onAction: () => {
            void selectWorkspace(workspaceId);
          },
        },
      });
    } finally {
      setPendingId(null);
    }
  };
  const handleCreate = () => {
    onCreate();
  };
  return (
    <>
      <WorkspaceMenuTrigger label={WORKSPACE_SWITCHER_COPY.trigger}>
        <SidebarWorkspaceTrigger workspaceName={currentName} isCompact={isCompact} />
        <Menu aria-label={WORKSPACE_SWITCHER_COPY.menuLabel}>
          {sortedWorkspaces.map((workspace) => (
            <WorkspaceMenuItem
              key={workspace.id}
              workspace={workspace}
              onSwitch={selectWorkspace}
              isPending={pendingId !== null}
            />
          ))}
          <MenuItem
            label={WORKSPACE_SWITCHER_COPY.create}
            isDisabled={pendingId !== null}
            onSelect={handleCreate}
          />
        </Menu>
      </WorkspaceMenuTrigger>
    </>
  );
}

function WorkspaceMenuItem({
  workspace,
  onSwitch,
  isPending,
}: Readonly<{
  workspace: WorkspaceSwitcherProps["workspaces"][number];
  onSwitch: WorkspaceSwitcherProps["onSwitch"];
  isPending: boolean;
}>) {
  function handleSwitch() {
    void onSwitch(workspace.id);
  }

  return (
    <MenuItem
      label={workspace.name}
      isSelected={workspace.isCurrent}
      isDisabled={isPending}
      onSelect={handleSwitch}
    />
  );
}
