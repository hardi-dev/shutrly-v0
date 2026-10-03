"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Dialog, Modal as AriaModal, ModalOverlay } from "react-aria-components";

import { useLayoutChange } from "@/ui/hooks/use-layout-change/use-layout-change";

import { AppPanel, PageContent } from "../app-panel/app-panel";
import { BottomNav } from "../bottom-nav/bottom-nav";
import { CompactBar } from "../compact-bar/compact-bar";
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
  subtitle,
  mobileSubtitle,
  workspace,
  account,
  onLogout,
  children,
  nav,
  navBottom,
  panelActions,
  panelUtilities,
  panelTabs,
  panelBreadcrumbs,
  mobileBottomNav,
  mobileSheet,
  mobileUtilities,
  onMobileWorkspacePress,
  isMobileOverlayOpen = false,
  onLayoutChange,
  workspaceSwitcher,
  subPage,
}: Readonly<AppShellProps>) {
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [isTabletSidebarOpen, setIsTabletSidebarOpen] = useState(false);

  useEffect(() => {
    // Read browser-only state after hydration to avoid server/client markup drift.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizes persisted UI state
    setIsDesktopSidebarCollapsed(readCollapsed());
  }, []);

  useLayoutChange(() => {
    setIsTabletSidebarOpen(false);
    onLayoutChange?.();
    requestAnimationFrame(focusVisibleMain);
  });

  function handleOpenTabletSidebar() {
    setIsTabletSidebarOpen(true);
  }

  function handleCloseTabletSidebar() {
    setIsTabletSidebarOpen(false);
  }

  function handleCollapseDesktopSidebar() {
    setIsDesktopSidebarCollapsed(true);
    writeCollapsed(true);
    requestAnimationFrame(focusSidebarToggle);
  }

  function handleExpandDesktopSidebar() {
    setIsDesktopSidebarCollapsed(false);
    writeCollapsed(false);
    requestAnimationFrame(focusSidebarToggle);
  }

  return (
    <div className="flex min-h-dvh bg-(--color-semantic-surface-muted) md:pt-(--space-3) md:pr-(--space-3) md:pb-(--space-3)">
      <a href={`#${APP_SHELL_CONTENT_ID}`} className="sr-only focus:not-sr-only max-md:hidden">
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
      <DesktopContent
        id={APP_SHELL_CONTENT_ID}
        title={title}
        subtitle={subtitle}
        parent={subPage?.parent.label ?? workspace.name}
        panelActions={panelActions}
        panelUtilities={panelUtilities}
        panelTabs={panelTabs}
        panelBreadcrumbs={panelBreadcrumbs}
      >
        {children}
      </DesktopContent>
      <MobileContent
        title={title}
        subtitle={subtitle}
        mobileSubtitle={mobileSubtitle}
        mobileBottomNav={mobileBottomNav}
        isMobileBottomNavHidden={subPage?.hidesBottomNav}
        isMobileOverlayOpen={isMobileOverlayOpen}
        mobileSheet={mobileSheet}
        workspaceName={workspace.name}
        mobileUtilities={mobileUtilities}
        onMobileWorkspacePress={onMobileWorkspacePress}
        header={subPage ? <CompactBar title={title} parent={subPage.parent} /> : undefined}
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

const APP_SHELL_CONTENT_ID = "app-shell-content";

function isVisible(element: Element | null): element is HTMLElement {
  return element instanceof HTMLElement && element.getClientRects().length > 0;
}

/** Keeps keyboard focus on a visible element after the layout changes (AC-SHELL-011). */
function focusVisibleMain() {
  if (isVisible(document.activeElement) && document.activeElement !== document.body) return;
  const main = [...document.querySelectorAll("main")].find(isVisible);
  main?.focus({ preventScroll: true });
}

/** Moves focus to the collapse or expand control that replaced the one just pressed. */
function focusSidebarToggle() {
  const toggle = [...document.querySelectorAll("[data-sidebar-toggle]")].find(isVisible);
  toggle?.focus();
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
    // The Sidebar stays pinned while the page (header and content) scrolls.
    <div className="hidden xl:flex sticky top-(--space-3) h-[calc(100dvh-var(--space-3)*2)] self-start">
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
    <div className="hidden md:flex xl:hidden sticky top-(--space-3) h-[calc(100dvh-var(--space-3)*2)] self-start">
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
  subtitle,
  parent,
  panelActions,
  panelUtilities,
  panelTabs,
  panelBreadcrumbs,
  children,
}: Readonly<{
  id: string;
  title: string;
  subtitle: AppShellProps["subtitle"];
  parent: string;
  panelActions: AppShellProps["panelActions"];
  panelUtilities: AppShellProps["panelUtilities"];
  panelTabs: AppShellProps["panelTabs"];
  panelBreadcrumbs: AppShellProps["panelBreadcrumbs"];
  children: AppShellProps["children"];
}>) {
  return (
    <div className="hidden min-w-0 flex-1 md:flex">
      <AppPanel
        id={id}
        title={title}
        subtitle={subtitle}
        parent={parent}
        actions={panelActions}
        utilities={panelUtilities}
        tabs={panelTabs}
        breadcrumbs={panelBreadcrumbs}
      >
        <PageContent>{children}</PageContent>
      </AppPanel>
    </div>
  );
}

function MobileContent({
  title,
  subtitle,
  mobileSubtitle,
  children,
  mobileBottomNav,
  isMobileBottomNavHidden,
  isMobileOverlayOpen,
  mobileSheet,
  workspaceName,
  mobileUtilities,
  onMobileWorkspacePress,
  header,
}: Readonly<
  Pick<
    AppShellProps,
    | "title"
    | "subtitle"
    | "mobileSubtitle"
    | "children"
    | "mobileBottomNav"
    | "isMobileOverlayOpen"
    | "mobileSheet"
    | "mobileUtilities"
    | "onMobileWorkspacePress"
  > & { workspaceName: string; header?: ReactNode; isMobileBottomNavHidden?: boolean }
>) {
  return (
    <div className="flex min-w-0 flex-1 md:hidden">
      <MobileAppShell
        title={title}
        subtitle={mobileSubtitle ?? subtitle}
        bottomNav={isMobileBottomNavHidden ? null : <BottomNavFromProps {...mobileBottomNav} />}
        isOverlayOpen={isMobileOverlayOpen}
        sheet={mobileSheet}
        workspace={workspaceName}
        utilities={mobileUtilities}
        onWorkspacePress={onMobileWorkspacePress}
        header={header}
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
