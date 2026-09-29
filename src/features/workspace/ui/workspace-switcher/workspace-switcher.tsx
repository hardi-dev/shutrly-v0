"use client";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useMemo, useState } from "react";

import { Menu } from "@/ui/patterns/menu/menu";
import { MenuCtaItem } from "@/ui/patterns/menu/menu-cta-item";
import { MenuGroupLabel } from "@/ui/patterns/menu/menu-group-label";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuSection } from "@/ui/patterns/menu/menu-section";
import { MenuTrigger as WorkspaceMenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SidebarWorkspaceTrigger } from "@/ui/patterns/sidebar/sidebar";
import { showToast } from "@/ui/patterns/toast/toast";

import { WORKSPACE_SWITCHER_COPY } from "./workspace-switcher.copy";
import type { WorkspaceSwitcherItem, WorkspaceSwitcherProps } from "./workspace-switcher.types";

/** Sorts workspaces alphabetically for every switcher surface. */
export function sortWorkspaces(workspaces: readonly WorkspaceSwitcherItem[]) {
  return [...workspaces].sort((left, right) => left.name.localeCompare(right.name));
}

/**
 * Runs a workspace switch with the shared pending and failure feedback.
 * @param currentName - the workspace the Owner stays in when the switch fails
 * @param onSwitch - the switch action; redirect errors are re-thrown
 * @returns the pending workspace id and the select handler
 */
export function useWorkspaceSwitch(
  currentName: string,
  onSwitch: WorkspaceSwitcherProps["onSwitch"],
) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const selectWorkspace = async (workspaceId: string): Promise<void> => {
    setPendingId(workspaceId);
    try {
      await onSwitch(workspaceId);
    } catch (error: unknown) {
      if (isRedirectError(error)) throw error;
      showToast({
        tone: "danger",
        title: WORKSPACE_SWITCHER_COPY.failed,
        body: WORKSPACE_SWITCHER_COPY.failedBody(currentName),
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
  return { pendingId, selectWorkspace };
}

/** Renders the keyboard-accessible workspace switcher menu. @param props - current workspace and actions @returns the switcher trigger and menu */
export function WorkspaceSwitcher({
  currentName,
  workspaces,
  isCompact = false,
  onSwitch,
  onCreate,
}: Readonly<WorkspaceSwitcherProps>) {
  const { pendingId, selectWorkspace } = useWorkspaceSwitch(currentName, onSwitch);
  const sortedWorkspaces = useMemo(() => sortWorkspaces(workspaces), [workspaces]);
  const isPending = pendingId !== null;
  const handleCreate = () => {
    onCreate();
  };
  return (
    <WorkspaceMenuTrigger label={WORKSPACE_SWITCHER_COPY.trigger}>
      <SidebarWorkspaceTrigger workspaceName={currentName} isCompact={isCompact} />
      <Menu aria-label={WORKSPACE_SWITCHER_COPY.menuLabel} variant="list">
        <MenuSection className="w-[calc(var(--size-sidebar)_-_var(--space-6))]">
          <MenuGroupLabel className="px-(--component-sheet-item-padding-x) pb-(--space-2)">
            {WORKSPACE_SWITCHER_COPY.menuLabel}
          </MenuGroupLabel>
          {sortedWorkspaces.map((workspace) => (
            <WorkspaceMenuItem
              key={workspace.id}
              workspace={workspace}
              onSwitch={selectWorkspace}
              isPending={isPending}
            />
          ))}
          <MenuCtaItem
            label={WORKSPACE_SWITCHER_COPY.create}
            icon="plus"
            isDisabled={isPending}
            className="border-t border-(--component-sheet-item-border) px-(--component-sheet-item-padding-x) py-(--space-3)"
            onSelect={handleCreate}
          />
        </MenuSection>
      </Menu>
    </WorkspaceMenuTrigger>
  );
}

function WorkspaceMenuItem({
  workspace,
  onSwitch,
  isPending,
}: Readonly<{
  workspace: WorkspaceSwitcherItem;
  onSwitch: (workspaceId: string) => Promise<void>;
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
      layout="row"
      onSelect={handleSwitch}
    />
  );
}
