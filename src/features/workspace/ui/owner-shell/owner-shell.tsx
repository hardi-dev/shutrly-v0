"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useState } from "react";

import { AppShell } from "@/ui/patterns/app-shell/app-shell";
import type { AppShellSubPage } from "@/ui/patterns/app-shell/app-shell.types";
import type { BottomNavProps } from "@/ui/patterns/bottom-nav/bottom-nav.types";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { PAGE_ACTIONS_ID } from "@/ui/patterns/page-actions/page-actions";
import type { BreadcrumbItem } from "@/ui/patterns/page-header/page-header.types";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { SidebarBrandLogo } from "@/ui/patterns/sidebar/sidebar";
import { Avatar } from "@/ui/primitives/avatar/avatar";
import { Button } from "@/ui/primitives/button/button";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { AccountMenu } from "../account-menu/account-menu";
import type { OwnerLocaleAction } from "../account-menu/account-menu.types";
import { CreateWorkspaceDialog } from "../create-workspace-dialog/create-workspace-dialog";
import {
  OwnerNav,
  OwnerNavBottom,
  resolvePageHeading,
  useOwnerNavTranslations,
} from "../owner-nav/owner-nav";
import type { OwnerNavTranslator } from "../owner-nav/owner-nav.types";
import { PageHeadingOverrideProvider } from "../page-heading-override/page-heading-override";
import type { PageHeadingOverrideValue } from "../page-heading-override/page-heading-override.types";
import {
  sortWorkspaces,
  useWorkspaceSwitch,
  useWorkspaceSwitcherTranslations,
  WorkspaceSwitcher,
} from "../workspace-switcher/workspace-switcher";
import {
  MobileAccountGroup,
  MobileAccountSheets,
  useMobileAccountSheets,
} from "./mobile-account-sheets";
import type { MobileAccountSheet } from "./mobile-account-sheets.types";
import { OWNER_SHELL_COPY_NAMESPACE } from "./owner-shell.copy";
import type { OwnerShellProps } from "./owner-shell.types";

/** The bottom-nav destinations, labelled from the owner-nav copy. */
function mobileBottomItems(
  t: OwnerNavTranslator,
  workspaceId: string,
  pathname: string,
): BottomNavProps["items"] {
  return [
    mobileItem(
      { href: "", label: t("dashboard"), icon: "layout-grid", isActive: false },
      workspaceId,
      pathname,
    ),
    mobileItem(
      { href: "/projects", label: t("projects"), icon: "folder-kanban", isActive: false },
      workspaceId,
      pathname,
    ),
    mobileItem(
      { href: "/clients", label: t("clients"), icon: "users", isActive: false },
      workspaceId,
      pathname,
    ),
    mobileItem(
      { href: "/invoices", label: t("invoices"), icon: "receipt", isActive: false },
      workspaceId,
      pathname,
    ),
  ];
}

/** The menu-sheet destinations: section, owner-nav copy key and icon. */
const MOBILE_MENU_ITEMS = [
  ["services", "services", "package"],
  ["team", "team", "user-round-cog"],
  ["message-templates", "messageTemplates", "message-square-text"],
  ["photo-sources", "photoSources", "folder-open"],
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
  localeAction,
  subPages,
}: Readonly<OwnerShellProps>) {
  const currentPathname = usePathname();
  const navT = useOwnerNavTranslations();
  const subPage = subPages?.find((page) => page.path === currentPathname);
  const [headingOverride, setHeadingOverride] = useState<PageHeadingOverrideValue | null>(null);
  const resolvedHeading = resolvePageHeading(currentPathname, workspaceId, workspaceName, navT);
  const heading = headingOverride ?? subPage ?? resolvedHeading ?? { title };
  let shellSubPage: AppShellSubPage | undefined;
  let panelBreadcrumbs: readonly BreadcrumbItem[] | undefined;
  if (headingOverride) {
    shellSubPage = {
      parent: headingOverride.parent,
      hidesBottomNav: headingOverride.hidesBottomNav,
    };
  } else if (subPage) shellSubPage = { parent: subPage.parent };
  if (headingOverride) {
    panelBreadcrumbs = [headingOverride.parent, { label: headingOverride.title }];
  } else if (subPage) {
    panelBreadcrumbs = [subPage.parent, { label: subPage.title }];
  } else if ("breadcrumbs" in heading) {
    panelBreadcrumbs = heading.breadcrumbs;
  }
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
  const handleCreateProject = () => {
    router.push(`/w/${workspaceId}/projects/new`);
  };
  const handleMobileNavigate = (section: string) => {
    setIsMobileMenuOpen(false);
    router.push(`/w/${workspaceId}/${section}`);
  };
  const mobileItems = mobileBottomItems(navT, workspaceId, currentPathname);
  const handleOpenCreate = () => {
    setIsCreateOpen(true);
  };
  const handleMobileCreate = () => {
    setIsMobileWorkspaceSwitcherOpen(false);
    handleOpenCreate();
  };
  const handleOpenProfile = () => {
    router.push("/profile");
  };
  const handleOpenMobileWorkspaceSwitcher = () => {
    setIsMobileMenuOpen(false);
    setIsMobileWorkspaceSwitcherOpen(true);
  };
  const handleLogout = () => {
    void logoutAction?.();
  };
  const renderAccountMenu = (trigger: ReactNode) => (
    <AccountMenu
      workspaceId={workspaceId}
      localeAction={localeAction}
      onLogout={logoutAction ? handleLogout : undefined}
    >
      {trigger}
    </AccountMenu>
  );
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
          panelTitleAdornment={
            headingOverride?.status ? <StatusChip {...headingOverride.status} /> : undefined
          }
          panelMeta={headingOverride?.meta}
          mobileSubtitle={"mobileSubtitle" in heading ? heading.mobileSubtitle : undefined}
          workspace={{ name: workspaceName }}
          subPage={shellSubPage}
          panelBreadcrumbs={panelBreadcrumbs}
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
          accountMenu={renderAccountMenu}
          mobileBottomNav={{
            items: mobileItems,
            ctaLabel: navT("create"),
            onCtaPress: handleCreateProject,
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
                onOpenProfile={handleOpenProfile}
                localeAction={localeAction}
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
  onOpenProfile,
  localeAction,
  onLogout,
}: Readonly<{
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  accountName: string;
  accountEmail: string;
  workspaces?: OwnerShellProps["workspaces"];
  onOpenWorkspaceSwitcher?: () => void;
  onNavigate: (section: string) => void;
  onOpenProfile?: () => void;
  localeAction?: OwnerLocaleAction;
  onLogout?: () => void;
}>) {
  const t = useTranslations(OWNER_SHELL_COPY_NAMESPACE);
  const { subSheet, openSheet, closeSubSheet } = useMobileAccountSheets(onOpenChange);
  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={t("mobileMenuTitle")}
        headerLeading={<MobileSheetLogo />}
        variant="menu"
      >
        <MobileMenuBody
          accountName={accountName}
          accountEmail={accountEmail}
          hasLanguage={localeAction !== undefined}
          onNavigate={onNavigate}
          onOpenProfile={onOpenProfile}
          onOpenSheet={openSheet}
          onMenuOpenChange={onOpenChange}
          onLogout={onLogout}
        />
      </BottomSheet>
      <MobileAccountSheets subSheet={subSheet} onChange={closeSubSheet} action={localeAction} />
    </>
  );
}

/** The menu body: catalog, account rows and the account block (the profile link). */
function MobileMenuBody({
  accountName,
  accountEmail,
  hasLanguage,
  onNavigate,
  onOpenProfile,
  onOpenSheet,
  onMenuOpenChange,
  onLogout,
}: Readonly<{
  accountName: string;
  accountEmail: string;
  hasLanguage: boolean;
  onNavigate: (section: string) => void;
  onOpenProfile?: () => void;
  onOpenSheet: (sheet: MobileAccountSheet) => void;
  onMenuOpenChange: (isOpen: boolean) => void;
  onLogout?: () => void;
}>) {
  const t = useTranslations(OWNER_SHELL_COPY_NAMESPACE);
  const handleClose = () => {
    onMenuOpenChange(false);
  };
  const handleProfile = () => {
    handleClose();
    onOpenProfile?.();
  };
  const handleSettings = () => {
    onNavigate("settings");
  };
  return (
    <>
      <MobileCatalogItems onNavigate={onNavigate} />
      <MobileSheetGroupLabel label={t("accountGroup")} />
      <MobileAccountGroup
        hasLanguage={hasLanguage}
        onProfile={handleProfile}
        onOpenSheet={onOpenSheet}
        onNavigateSettings={handleSettings}
        onLogout={onLogout}
      />
      <MobileSheetAccount name={accountName} email={accountEmail} onOpenProfile={handleClose} />
    </>
  );
}

/** The catalog destinations of the mobile menu, labelled from the owner-nav copy. */
function MobileCatalogItems({ onNavigate }: Readonly<{ onNavigate: (section: string) => void }>) {
  const navT = useOwnerNavTranslations();
  const handleNavigate = (section: string) => () => {
    onNavigate(section);
  };
  return (
    <>
      <MobileSheetGroupLabel label={navT("catalog")} />
      {MOBILE_MENU_ITEMS.map(([section, key, icon]) => (
        <SheetItem key={section} label={navT(key)} icon={icon} onPress={handleNavigate(section)} />
      ))}
    </>
  );
}

function DesktopUtilities({
  onSearch,
  onNotifications,
}: Readonly<{ onSearch: () => void; onNotifications: () => void }>) {
  const t = useTranslations(OWNER_SHELL_COPY_NAMESPACE);
  return (
    <>
      <IconButton icon="search" aria-label={t("search")} onPress={onSearch} />
      <IconButton icon="bell" aria-label={t("notifications")} onPress={onNotifications} />
    </>
  );
}

function MobileUtilities({
  onSearch,
  onNotifications,
  onMenu,
}: Readonly<{ onSearch: () => void; onNotifications: () => void; onMenu: () => void }>) {
  const t = useTranslations(OWNER_SHELL_COPY_NAMESPACE);
  return (
    <>
      <IconButton icon="search" aria-label={t("search")} onPress={onSearch} />
      <IconButton icon="bell" aria-label={t("notifications")} onPress={onNotifications} />
      <IconButton icon="menu" aria-label={t("menu")} onPress={onMenu} />
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
  const t = useWorkspaceSwitcherTranslations();
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
      title={t("menuLabel")}
      meta={t("count", { count: workspaces.length })}
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
  const t = useWorkspaceSwitcherTranslations();
  return (
    <Button
      variant="primary"
      size="lg"
      className="w-full"
      iconLeading="plus"
      isDisabled={isDisabled}
      onPress={onPress}
    >
      {t("create")}
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
}: Readonly<{ name: string; email: string; onOpenProfile: () => void }>) {
  return (
    <div className="flex items-center gap-(--component-sidebar-account-gap) border-t border-(--component-sheet-item-border) px-(--component-sheet-item-padding-x) pb-(--space-1) pt-(--space-3)">
      <Link
        href="/profile"
        onClick={onOpenProfile}
        className="flex min-w-0 flex-1 items-center gap-(--component-sidebar-account-gap) rounded-(--radius-sm) outline-none focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]"
      >
        <MobileSheetAccountText name={name} email={email} />
      </Link>
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
