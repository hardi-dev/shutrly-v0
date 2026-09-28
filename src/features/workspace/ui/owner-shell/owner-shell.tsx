"use client";

import { useState } from "react";

import { AppShell } from "@/ui/patterns/app-shell/app-shell";
import type { BottomNavProps } from "@/ui/patterns/bottom-nav/bottom-nav.types";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";

import { CreateWorkspaceDialog } from "../create-workspace-dialog/create-workspace-dialog";
import { OwnerNav } from "../owner-nav/owner-nav";
import { OWNER_NAV_COPY } from "../owner-nav/owner-nav.copy";
import { WorkspaceSwitcher } from "../workspace-switcher/workspace-switcher";
import { OWNER_SHELL_COPY } from "./owner-shell.copy";
import type { OwnerShellProps } from "./owner-shell.types";

const MOBILE_ITEMS: BottomNavProps["items"] = [
  { href: "", label: OWNER_NAV_COPY.dashboard, icon: "layout-grid", isActive: false },
  { href: "/projects", label: OWNER_NAV_COPY.projects, icon: "folder-kanban", isActive: false },
  { href: "/clients", label: OWNER_NAV_COPY.clients, icon: "users", isActive: false },
  { href: "/settings", label: OWNER_NAV_COPY.settings, icon: "settings", isActive: false },
];

// eslint-disable-next-line max-lines-per-function -- coordinates responsive shell regions
export function OwnerShell({
  workspaceId,
  workspaceName,
  accountName,
  accountEmail,
  pathname,
  title,
  children,
  workspaces,
  onSwitch,
  onCreate,
}: Readonly<OwnerShellProps>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const mobileItems = [
    mobileItem(MOBILE_ITEMS[0], workspaceId, pathname),
    mobileItem(MOBILE_ITEMS[1], workspaceId, pathname),
    mobileItem(MOBILE_ITEMS[2], workspaceId, pathname),
    mobileItem(MOBILE_ITEMS[3], workspaceId, pathname),
  ] as const;
  const handleOpenMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };
  const handleMobileSwitch = async (nextWorkspaceId: string) => {
    await onSwitch(nextWorkspaceId);
    setIsMobileMenuOpen(false);
  };
  const handleMobileCreate = () => {
    setIsMobileMenuOpen(false);
    setIsCreateOpen(true);
  };

  return (
    <AppShell
      title={title}
      workspace={{ name: workspaceName }}
      account={{ name: accountName, email: accountEmail, initials: initials(accountName) }}
      nav={<OwnerNav workspaceId={workspaceId} pathname={pathname} />}
      workspaceSwitcher={
        <WorkspaceSwitcher
          currentName={workspaceName}
          workspaces={workspaces}
          onSwitch={onSwitch}
          onCreate={onCreate}
        />
      }
      mobileBottomNav={{
        items: mobileItems,
        ctaLabel: OWNER_NAV_COPY.create,
        onCtaPress: handleOpenMobileMenu,
      }}
      mobileSheet={
        <MobileWorkspaceSheet
          isOpen={isMobileMenuOpen}
          onOpenChange={setIsMobileMenuOpen}
          workspaces={workspaces}
          onSwitch={handleMobileSwitch}
          onCreate={handleMobileCreate}
        />
      }
    >
      {children}
      <CreateWorkspaceDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        action={onCreate}
      />
    </AppShell>
  );
}

function MobileWorkspaceSheet({
  isOpen,
  onOpenChange,
  workspaces,
  onSwitch,
  onCreate,
}: Readonly<{
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workspaces: OwnerShellProps["workspaces"];
  onSwitch: (workspaceId: string) => Promise<void>;
  onCreate: () => void;
}>) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={OWNER_SHELL_COPY.mobileWorkspaceTitle}
      variant="menu"
      meta={OWNER_SHELL_COPY.mobileWorkspaceMeta(workspaces.length)}
    >
      {workspaces.map((workspace) => (
        <MobileWorkspaceItem key={workspace.id} workspace={workspace} onSwitch={onSwitch} />
      ))}
      <SheetItem label={OWNER_SHELL_COPY.createWorkspace} icon="plus" onPress={onCreate} />
    </BottomSheet>
  );
}

function MobileWorkspaceItem({
  workspace,
  onSwitch,
}: Readonly<{
  workspace: OwnerShellProps["workspaces"][number];
  onSwitch: (workspaceId: string) => Promise<void>;
}>) {
  const handlePress = () => {
    void onSwitch(workspace.id);
  };
  return <SheetItem label={workspace.name} icon="package" onPress={handlePress} />;
}

function mobileItem(item: BottomNavProps["items"][number], workspaceId: string, pathname: string) {
  const href = `/w/${workspaceId}${item.href}`;
  return { ...item, href, isActive: pathname === href };
}

function initials(name: string): string {
  return name
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
