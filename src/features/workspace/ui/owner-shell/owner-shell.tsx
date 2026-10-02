"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/ui/patterns/app-shell/app-shell";
import type { BottomNavProps } from "@/ui/patterns/bottom-nav/bottom-nav.types";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { PAGE_ACTIONS_ID } from "@/ui/patterns/page-actions/page-actions";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { SidebarBrandLogo } from "@/ui/patterns/sidebar/sidebar";
import { Avatar } from "@/ui/primitives/avatar/avatar";
import { Button } from "@/ui/primitives/button/button";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { CreateWorkspaceDialog } from "../create-workspace-dialog/create-workspace-dialog";
import { OwnerNav, OwnerNavBottom, resolvePageHeading } from "../owner-nav/owner-nav";
import { OWNER_NAV_COPY } from "../owner-nav/owner-nav.copy";
import { PageHeadingOverrideProvider } from "../page-heading-override/page-heading-override";
import type { PageHeadingOverrideValue } from "../page-heading-override/page-heading-override.types";
import {
  sortWorkspaces,
  useWorkspaceSwitch,
  WorkspaceSwitcher,
} from "../workspace-switcher/workspace-switcher";
import { WORKSPACE_SWITCHER_COPY } from "../workspace-switcher/workspace-switcher.copy";
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
  ["photo-sources", OWNER_NAV_COPY.photoSources, "folder-open"],
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
  subPages,
}: Readonly<OwnerShellProps>) {
  const currentPathname = usePathname();
  const subPage = subPages?.find((page) => page.path === currentPathname);
  const [headingOverride, setHeadingOverride] = useState<PageHeadingOverrideValue | null>(null);
  const resolvedHeading = resolvePageHeading(currentPathname, workspaceId, workspaceName);
  const heading = headingOverride ?? subPage ?? resolvedHeading ?? { title };
  let shellSubPage: { parent: { label: string; href: string } } | undefined;
  if (headingOverride) shellSubPage = { parent: headingOverride.parent };
  else if (subPage) shellSubPage = { parent: subPage.parent };
  const panelTabs = "tabs" in heading ? heading.tabs : undefined;
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileWorkspaceSwitcherOpen, setIsMobileWorkspaceSwitcherOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const handleLayoutChange = () => {
    setIsMobileMenuOpen(false);
    setIsMobileWorkspaceSwitcherOpen(false);
  };
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
    <PageHeadingOverrideProvider onChange={setHeadingOverride}>
      <>
        <AppShell
          title={heading.title}
          subtitle={heading.subtitle}
          workspace={{ name: workspaceName }}
          subPage={shellSubPage}
          panelTabs={panelTabs}
          account={{ name: accountName, email: accountEmail, initials: initials(accountName) }}
          nav={<OwnerNav workspaceId={workspaceId} pathname={currentPathname} />}
          navBottom={<OwnerNavBottom workspaceId={workspaceId} pathname={currentPathname} />}
          workspaceSwitcher={renderWorkspaceSwitcher}
          panelUtilities={
            <DesktopUtilities
              onSearch={handleOpenSearch}
              onNotifications={handleOpenNotifications}
            />
          }
          panelActions={<div id={PAGE_ACTIONS_ID} className="flex items-center gap-(--space-2)" />}
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
          onLayoutChange={handleLayoutChange}
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
                currentName={workspaceName}
                workspaces={workspaces}
                onSwitch={onSwitch}
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
    </PageHeadingOverrideProvider>
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
  const handleClose = () => {
    onOpenChange(false);
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
      {MOBILE_MENU_ITEMS.slice(0, 2).map(([section, label, icon]) => (
        <SheetItem key={section} label={label} icon={icon} onPress={handleNavigate(section)} />
      ))}
      {MOBILE_MENU_ITEMS.slice(2).map(([section, label, icon]) => (
        <SheetItem key={section} label={label} icon={icon} onPress={handleNavigate(section)} />
      ))}
      <MobileSheetAccount
        name={accountName}
        email={accountEmail}
        onOpenProfile={handleClose}
        onLogout={onLogout}
      />
    </BottomSheet>
  );
}

function DesktopUtilities({
  onSearch,
  onNotifications,
}: Readonly<{ onSearch: () => void; onNotifications: () => void }>) {
  return (
    <>
      <IconButton icon="search" aria-label={OWNER_SHELL_COPY.search} onPress={onSearch} />
      <IconButton
        icon="bell"
        aria-label={OWNER_SHELL_COPY.notifications}
        onPress={onNotifications}
      />
    </>
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
        icon="bell"
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
  currentName,
  workspaces,
  onSwitch,
  onCreate,
}: Readonly<{
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentName: string;
  workspaces: OwnerShellProps["workspaces"];
  onSwitch: (workspaceId: string) => Promise<void>;
  onCreate: () => void;
}>) {
  const { pendingId, selectWorkspace } = useWorkspaceSwitch(currentName, onSwitch);
  const isPending = pendingId !== null;
  const handleSwitch = (workspaceId: string) => () => {
    void selectWorkspace(workspaceId).finally(() => {
      onOpenChange(false);
    });
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={WORKSPACE_SWITCHER_COPY.menuLabel}
      meta={WORKSPACE_SWITCHER_COPY.count(workspaces.length)}
      variant="menu"
      actions={<CreateWorkspaceButton isDisabled={isPending} onPress={onCreate} />}
    >
      {sortWorkspaces(workspaces).map((workspace) => (
        <SheetItem
          key={workspace.id}
          label={workspace.name}
          isSelected={workspace.isCurrent}
          isDisabled={isPending}
          onPress={handleSwitch(workspace.id)}
        />
      ))}
    </BottomSheet>
  );
}

function CreateWorkspaceButton({
  isDisabled,
  onPress,
}: Readonly<{ isDisabled: boolean; onPress: () => void }>) {
  return (
    <Button
      variant="primary"
      size="lg"
      className="w-full"
      iconLeading="plus"
      isDisabled={isDisabled}
      onPress={onPress}
    >
      {WORKSPACE_SWITCHER_COPY.create}
    </Button>
  );
}

function MobileSheetLogo() {
  return <SidebarBrandLogo />;
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
  onOpenProfile,
  onLogout,
}: Readonly<{ name: string; email: string; onOpenProfile: () => void; onLogout?: () => void }>) {
  return (
    <div className="flex items-center gap-(--component-sidebar-account-gap) border-t border-(--component-sheet-item-border) px-(--component-sheet-item-padding-x) pb-(--space-1) pt-(--space-3)">
      <Link
        href="/profile"
        onClick={onOpenProfile}
        className="flex min-w-0 flex-1 items-center gap-(--component-sidebar-account-gap) rounded-(--radius-sm) outline-none focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]"
      >
        <MobileSheetAccountText name={name} email={email} />
      </Link>
      <IconButton
        icon="log-out"
        size="sm"
        aria-label={OWNER_SHELL_COPY.logout}
        onPress={onLogout}
      />
    </div>
  );
}

function MobileSheetAccountText({ name, email }: Readonly<{ name: string; email: string }>) {
  return (
    <>
      <Avatar initials={initials(name)} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-(length:--font-size-body-sm) font-semibold text-(--color-semantic-text-primary)">
          {name}
        </p>
        <p className="truncate text-(length:--font-size-caption) text-(--color-semantic-text-muted)">
          {email}
        </p>
      </div>
    </>
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
