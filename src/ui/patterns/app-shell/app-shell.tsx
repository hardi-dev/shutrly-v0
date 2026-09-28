"use client";

import { useEffect, useState } from "react";
import { Dialog, Modal as AriaModal, ModalOverlay } from "react-aria-components";

import { AppPanel, PageContent } from "../app-panel/app-panel";
import { BottomNav } from "../bottom-nav/bottom-nav";
import { MobileAppShell } from "../mobile-app-shell/mobile-app-shell";
import { Sidebar } from "../sidebar/sidebar";
import { APP_SHELL_COPY } from "./app-shell.copy";
import type { AppShellProps } from "./app-shell.types";
import { readCollapsed, writeCollapsed } from "./sidebar-collapse-preference";

/** Renders the responsive desktop, tablet and mobile Owner shell (C30/C35/C37). */
// The shell coordinates all responsive regions and their shared overlay state.
// eslint-disable-next-line max-lines-per-function -- coordinates all responsive regions and shared overlay state
export function AppShell({
  title,
  workspace,
  account,
  onLogout,
  children,
  nav,
  navBottom,
  panelActions,
  mobileBottomNav,
  mobileSheet,
  mobileUtilities,
  onMobileWorkspacePress,
  isMobileOverlayOpen = false,
  workspaceSwitcher,
}: Readonly<AppShellProps>) {
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [isTabletSidebarOpen, setIsTabletSidebarOpen] = useState(false);

  useEffect(() => {
    // Read browser-only state after hydration to avoid server/client markup drift.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizes persisted UI state
    setIsDesktopSidebarCollapsed(readCollapsed());
  }, []);

  function handleOpenTabletSidebar() {
    setIsTabletSidebarOpen(true);
  }

  function handleCloseTabletSidebar() {
    setIsTabletSidebarOpen(false);
  }

  function handleCollapseDesktopSidebar() {
    setIsDesktopSidebarCollapsed(true);
    writeCollapsed(true);
  }

  function handleExpandDesktopSidebar() {
    setIsDesktopSidebarCollapsed(false);
    writeCollapsed(false);
  }

  return (
    <div className="flex min-h-dvh bg-(--color-semantic-surface-canvas) md:pt-(--space-3) md:pr-(--space-3) md:pb-(--space-3)">
      <a href="#app-shell-content" className="sr-only focus:not-sr-only">
        {APP_SHELL_COPY.skip}
      </a>
      <DesktopSidebar
        workspace={workspace}
        account={account}
        nav={nav}
        navBottom={navBottom}
        isCompact={isDesktopSidebarCollapsed}
        onCollapse={handleCollapseDesktopSidebar}
        onExpand={handleExpandDesktopSidebar}
        workspaceSwitcher={workspaceSwitcher}
        onLogout={onLogout}
      />
      <TabletRail
        workspace={workspace}
        account={account}
        nav={nav}
        navBottom={navBottom}
        onExpand={handleOpenTabletSidebar}
        workspaceSwitcher={workspaceSwitcher}
      />
      <DesktopContent id="app-shell-content" title={title} panelActions={panelActions}>
        {children}
      </DesktopContent>
      <MobileContent
        title={title}
        mobileBottomNav={mobileBottomNav}
        isMobileOverlayOpen={isMobileOverlayOpen}
        mobileSheet={mobileSheet}
        workspaceName={workspace.name}
        mobileUtilities={mobileUtilities}
        onMobileWorkspacePress={onMobileWorkspacePress}
      >
        {children}
      </MobileContent>
      <TabletSidebarOverlay
        isOpen={isTabletSidebarOpen}
        onOpenChange={setIsTabletSidebarOpen}
        workspace={workspace}
        account={account}
        nav={nav}
        navBottom={navBottom}
        onCollapse={handleCloseTabletSidebar}
        workspaceSwitcher={workspaceSwitcher}
        onLogout={onLogout}
      />
    </div>
  );
}

function DesktopSidebar({
  workspace,
  account,
  nav,
  navBottom,
  isCompact,
  onCollapse,
  onExpand,
  workspaceSwitcher,
  onLogout,
}: Readonly<Pick<AppShellProps, "workspace" | "account" | "nav" | "navBottom">> & {
  isCompact: boolean;
  onCollapse: () => void;
  onExpand: () => void;
  workspaceSwitcher: AppShellProps["workspaceSwitcher"];
  onLogout?: () => void;
}) {
  return (
    <div className="hidden xl:flex">
      <Sidebar
        workspace={workspace}
        account={account}
        isCompact={isCompact}
        onExpand={onExpand}
        onCollapse={onCollapse}
        workspaceSwitcher={workspaceSwitcher}
        onLogout={onLogout}
        navBottom={navBottom}
      >
        {nav}
      </Sidebar>
    </div>
  );
}

function TabletRail({
  workspace,
  account,
  nav,
  navBottom,
  onExpand,
  workspaceSwitcher,
}: Readonly<Pick<AppShellProps, "workspace" | "account" | "nav" | "navBottom">> & {
  onExpand: () => void;
  workspaceSwitcher: AppShellProps["workspaceSwitcher"];
}) {
  return (
    <div className="hidden md:flex xl:hidden">
      <Sidebar
        workspace={workspace}
        account={account}
        isCompact
        onExpand={onExpand}
        navBottom={navBottom}
        workspaceSwitcher={workspaceSwitcher}
      >
        {nav}
      </Sidebar>
    </div>
  );
}

function DesktopContent({
  id,
  title,
  panelActions,
  children,
}: Readonly<{
  id: string;
  title: string;
  panelActions: AppShellProps["panelActions"];
  children: AppShellProps["children"];
}>) {
  return (
    <div id={id} className="hidden min-w-0 flex-1 md:flex">
      <AppPanel title={title} actions={panelActions}>
        <PageContent>{children}</PageContent>
      </AppPanel>
    </div>
  );
}

function MobileContent({
  title,
  children,
  mobileBottomNav,
  isMobileOverlayOpen,
  mobileSheet,
  workspaceName,
  mobileUtilities,
  onMobileWorkspacePress,
}: Readonly<
  Pick<
    AppShellProps,
    | "title"
    | "children"
    | "mobileBottomNav"
    | "isMobileOverlayOpen"
    | "mobileSheet"
    | "mobileUtilities"
    | "onMobileWorkspacePress"
  > & { workspaceName: string }
>) {
  return (
    <div className="flex min-w-0 flex-1 md:hidden">
      <MobileAppShell
        title={title}
        bottomNav={<BottomNavFromProps {...mobileBottomNav} />}
        isOverlayOpen={isMobileOverlayOpen}
        sheet={mobileSheet}
        workspace={workspaceName}
        utilities={mobileUtilities}
        onWorkspacePress={onMobileWorkspacePress}
      >
        {children}
      </MobileAppShell>
    </div>
  );
}

function TabletSidebarOverlay({
  isOpen,
  onOpenChange,
  workspace,
  account,
  nav,
  navBottom,
  onCollapse,
  workspaceSwitcher,
  onLogout,
}: Readonly<{
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workspace: AppShellProps["workspace"];
  account: AppShellProps["account"];
  nav: AppShellProps["nav"];
  navBottom: AppShellProps["navBottom"];
  onCollapse: () => void;
  workspaceSwitcher: AppShellProps["workspaceSwitcher"];
  onLogout?: () => void;
}>) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="fixed inset-0 z-50 bg-(--component-modal-scrim)"
    >
      <AriaModal className="h-full w-fit max-w-[calc(100%_-_32px)] bg-(--color-semantic-surface-panel)">
        <Dialog aria-label={APP_SHELL_COPY.tabletOverlay} className="h-full outline-none">
          <Sidebar
            workspace={workspace}
            account={account}
            onCollapse={onCollapse}
            navBottom={navBottom}
            workspaceSwitcher={workspaceSwitcher}
            onLogout={onLogout}
          >
            {nav}
          </Sidebar>
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  );
}

function BottomNavFromProps(props: Readonly<AppShellProps["mobileBottomNav"]>) {
  return <BottomNav {...props} />;
}
