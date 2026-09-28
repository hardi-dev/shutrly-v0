"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/ui/patterns/app-shell/app-shell";
import type { BottomNavProps } from "@/ui/patterns/bottom-nav/bottom-nav.types";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { Avatar } from "@/ui/primitives/avatar/avatar";
import { Button } from "@/ui/primitives/button/button";
import { Icon } from "@/ui/primitives/icon/icon";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { CreateWorkspaceDialog } from "../create-workspace-dialog/create-workspace-dialog";
import { OwnerNav, OwnerNavBottom } from "../owner-nav/owner-nav";
import { OWNER_NAV_COPY } from "../owner-nav/owner-nav.copy";
import { WorkspaceSwitcher } from "../workspace-switcher/workspace-switcher";
import { OWNER_SHELL_COPY } from "./owner-shell.copy";
import type { OwnerShellProps } from "./owner-shell.types";

const MOBILE_ITEMS: BottomNavProps["items"] = [
  { href: "", label: OWNER_NAV_COPY.dashboard, icon: "layout-grid", isActive: false },
  { href: "/projects", label: OWNER_NAV_COPY.projects, icon: "folder-kanban", isActive: false },
  { href: "/clients", label: OWNER_NAV_COPY.clients, icon: "users", isActive: false },
  { href: "/invoices", label: OWNER_NAV_COPY.invoices, icon: "receipt", isActive: false },
];

const MOBILE_MENU_ITEMS = [
  ["services", OWNER_NAV_COPY.services, "package"],
  ["team", OWNER_NAV_COPY.team, "user-round-cog"],
  ["message-templates", OWNER_NAV_COPY.messageTemplates, "message-square-text"],
  ["client-sources", OWNER_NAV_COPY.clientSources, "share-2"],
  ["settings", OWNER_NAV_COPY.settings, "settings"],
] as const;

// eslint-disable-next-line max-lines-per-function -- coordinates responsive shell regions
export function OwnerShell({
  workspaceId,
  workspaceName,
  accountName,
  accountEmail,
  title,
  children,
  workspaces,
  onSwitch,
  onCreate,
  logoutAction,
}: Readonly<OwnerShellProps>) {
  const currentPathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileWorkspaceSwitcherOpen, setIsMobileWorkspaceSwitcherOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const handleOpenMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };
  const handleOpenSearch = () => {
    router.push(`/w/${workspaceId}/search`);
  };
  const handleOpenNotifications = () => {
    router.push(`/w/${workspaceId}/notifications`);
  };
  const handleOpenProjects = () => {
    router.push(`/w/${workspaceId}/projects`);
  };
  const handleMobileNavigate = (section: string) => {
    setIsMobileMenuOpen(false);
    router.push(`/w/${workspaceId}/${section}`);
  };
  const mobileItems = [
    mobileItem(MOBILE_ITEMS[0], workspaceId, currentPathname),
    mobileItem(MOBILE_ITEMS[1], workspaceId, currentPathname),
    mobileItem(MOBILE_ITEMS[2], workspaceId, currentPathname),
    mobileItem(MOBILE_ITEMS[3], workspaceId, currentPathname),
  ] as const;
  const handleMobileSwitch = async (nextWorkspaceId: string) => {
    await onSwitch(nextWorkspaceId);
    setIsMobileWorkspaceSwitcherOpen(false);
  };
  const handleOpenCreate = () => {
    setIsCreateOpen(true);
  };
  const handleMobileCreate = () => {
    setIsMobileWorkspaceSwitcherOpen(false);
    handleOpenCreate();
  };
  const handleOpenMobileWorkspaceSwitcher = () => {
    setIsMobileMenuOpen(false);
    setIsMobileWorkspaceSwitcherOpen(true);
  };
  const handleLogout = () => {
    void logoutAction?.();
  };
  const renderWorkspaceSwitcher = (isCompact: boolean) => (
    <WorkspaceSwitcher
      currentName={workspaceName}
      workspaces={workspaces}
      isCompact={isCompact}
      onSwitch={onSwitch}
      onCreate={handleOpenCreate}
    />
  );

  return (
    <>
      <AppShell
        title={title}
        workspace={{ name: workspaceName }}
        account={{ name: accountName, email: accountEmail, initials: initials(accountName) }}
        nav={<OwnerNav workspaceId={workspaceId} pathname={currentPathname} />}
        navBottom={<OwnerNavBottom workspaceId={workspaceId} pathname={currentPathname} />}
        workspaceSwitcher={renderWorkspaceSwitcher}
        onLogout={logoutAction ? handleLogout : undefined}
        mobileBottomNav={{
          items: mobileItems,
          ctaLabel: OWNER_NAV_COPY.create,
          onCtaPress: handleOpenProjects,
        }}
        mobileUtilities={
          <MobileUtilities
            onSearch={handleOpenSearch}
            onNotifications={handleOpenNotifications}
            onMenu={handleOpenMobileMenu}
          />
        }
        onMobileWorkspacePress={handleOpenMobileWorkspaceSwitcher}
        mobileSheet={
          <>
            <MobileWorkspaceSheet
              isOpen={isMobileMenuOpen}
              onOpenChange={setIsMobileMenuOpen}
              workspaces={workspaces}
              accountName={accountName}
              accountEmail={accountEmail}
              onNavigate={handleMobileNavigate}
              onLogout={logoutAction ? handleLogout : undefined}
            />
            <MobileWorkspaceSwitcherSheet
              isOpen={isMobileWorkspaceSwitcherOpen}
              onOpenChange={setIsMobileWorkspaceSwitcherOpen}
              workspaces={workspaces}
              onSwitch={handleMobileSwitch}
              onCreate={handleMobileCreate}
            />
          </>
        }
      >
        {children}
      </AppShell>
      <CreateWorkspaceDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        action={onCreate}
      />
    </>
  );
}

export function MobileWorkspaceSheet({
  isOpen,
  onOpenChange,
  accountName,
  accountEmail,
  onNavigate,
  onLogout,
}: Readonly<{
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  accountName: string;
  accountEmail: string;
  workspaces?: OwnerShellProps["workspaces"];
  onOpenWorkspaceSwitcher?: () => void;
  onNavigate: (section: string) => void;
  onLogout?: () => void;
}>) {
  const handleNavigate = (section: string) => () => {
    onNavigate(section);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={OWNER_SHELL_COPY.mobileMenuTitle}
      headerLeading={<MobileSheetLogo />}
      variant="menu"
    >
      <MobileSheetGroupLabel label={OWNER_NAV_COPY.catalog} />
      {MOBILE_MENU_ITEMS.slice(1, 3).map(([section, label, icon]) => (
        <SheetItem key={section} label={label} icon={icon} onPress={handleNavigate(section)} />
      ))}
      {MOBILE_MENU_ITEMS.slice(3).map(([section, label, icon]) => (
        <SheetItem key={section} label={label} icon={icon} onPress={handleNavigate(section)} />
      ))}
      <MobileSheetAccount name={accountName} email={accountEmail} onLogout={onLogout} />
    </BottomSheet>
  );
}

function MobileUtilities({
  onSearch,
  onNotifications,
  onMenu,
}: Readonly<{ onSearch: () => void; onNotifications: () => void; onMenu: () => void }>) {
  return (
    <>
      <IconButton icon="search" aria-label={OWNER_SHELL_COPY.search} onPress={onSearch} />
      <IconButton
        icon="info"
        aria-label={OWNER_SHELL_COPY.notifications}
        onPress={onNotifications}
      />
      <IconButton icon="menu" aria-label={OWNER_SHELL_COPY.menu} onPress={onMenu} />
    </>
  );
}

export function MobileWorkspaceSwitcherSheet({
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
      title={OWNER_SHELL_COPY.mobileWorkspaceSwitcherTitle}
      variant="menu"
      actions={
        <Button variant="primary" size="lg" className="w-full" onPress={onCreate}>
          {OWNER_SHELL_COPY.createWorkspace}
        </Button>
      }
    >
      {workspaces.map((workspace) => (
        <SheetItem
          key={workspace.id}
          label={workspace.name}
          isSelected={workspace.isCurrent}
          onPress={handleWorkspaceSwitch(onSwitch, workspace.id)}
        />
      ))}
    </BottomSheet>
  );
}

function handleWorkspaceSwitch(
  onSwitch: (workspaceId: string) => Promise<void>,
  workspaceId: string,
) {
  return () => {
    void onSwitch(workspaceId);
  };
}

function MobileSheetLogo() {
  return (
    <div className="flex items-center gap-(--space-2)">
      <Icon
        name="camera"
        size="sm"
        aria-hidden="true"
        className="text-(--component-sidebar-logo)"
      />
      <span className="text-[18px] font-bold text-(--component-sidebar-logo)">
        {OWNER_SHELL_COPY.brandName}
      </span>
    </div>
  );
}

function MobileSheetGroupLabel({ label }: Readonly<{ label: string }>) {
  return (
    <div className="border-t border-(--component-sheet-item-border) px-(--component-sheet-item-padding-x) pb-(--space-1) pt-(--space-3)">
      <span className="text-(length:--font-size-overline) font-bold tracking-(--font-letter-spacing-overline) text-(--color-semantic-text-muted)">
        {label}
      </span>
    </div>
  );
}

function MobileSheetAccount({
  name,
  email,
  onLogout,
}: Readonly<{ name: string; email: string; onLogout?: () => void }>) {
  return (
    <div className="flex items-center gap-(--component-sidebar-account-gap) border-t border-(--component-sheet-item-border) px-(--component-sheet-item-padding-x) pb-(--space-1) pt-(--space-3)">
      <Avatar initials={name} aria-label={name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-(length:--font-size-body-sm) font-semibold text-(--color-semantic-text-primary)">
          {name}
        </p>
        <p className="truncate text-(length:--font-size-caption) text-(--color-semantic-text-muted)">
          {email}
        </p>
      </div>
      <IconButton
        icon="log-out"
        size="sm"
        aria-label={OWNER_SHELL_COPY.logout}
        onPress={onLogout}
      />
    </div>
  );
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
