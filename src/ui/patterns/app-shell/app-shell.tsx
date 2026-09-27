"use client";

import { useState } from "react";
import { Dialog, Modal as AriaModal, ModalOverlay } from "react-aria-components";

import { AppPanel, PageContent } from "../app-panel/app-panel";
import { BottomNav } from "../bottom-nav/bottom-nav";
import { MobileAppShell } from "../mobile-app-shell/mobile-app-shell";
import { Sidebar } from "../sidebar/sidebar";
import { SidebarRail } from "../sidebar-rail/sidebar-rail";
import { APP_SHELL_COPY } from "./app-shell.copy";
import type { AppShellProps } from "./app-shell.types";

/** Renders the responsive desktop, tablet and mobile Owner shell (C30/C35/C37). */
// The shell coordinates all responsive regions and their shared overlay state.
// eslint-disable-next-line max-lines-per-function -- coordinates all responsive regions and shared overlay state
export function AppShell({
  title,
  workspace,
  account,
  children,
  nav,
  navBottom,
  panelActions,
  mobileBottomNav,
  mobileSheet,
  isMobileOverlayOpen = false,
}: Readonly<AppShellProps>) {
  const [isTabletSidebarOpen, setIsTabletSidebarOpen] = useState(false);

  function handleOpenTabletSidebar() {
    setIsTabletSidebarOpen(true);
  }

  function handleCloseTabletSidebar() {
    setIsTabletSidebarOpen(false);
  }

  return (
    <div className="flex min-h-dvh bg-(--color-semantic-surface-canvas) pt-(--space-3) pr-(--space-3) pb-(--space-3)">
      <a href="#app-shell-content" className="sr-only focus:not-sr-only">
        {APP_SHELL_COPY.skip}
      </a>
      <DesktopSidebar
        workspace={workspace}
        account={account}
        nav={nav}
        navBottom={navBottom}
        onCollapse={handleOpenTabletSidebar}
      />
      <TabletRail
        workspace={workspace}
        account={account}
        nav={nav}
        navBottom={navBottom}
        onExpand={handleOpenTabletSidebar}
      />
      <DesktopContent id="app-shell-content" title={title} panelActions={panelActions}>
        {children}
      </DesktopContent>
      <MobileContent
        title={title}
        mobileBottomNav={mobileBottomNav}
        isMobileOverlayOpen={isMobileOverlayOpen}
        mobileSheet={mobileSheet}
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
      />
    </div>
  );
}

function DesktopSidebar({
  workspace,
  account,
  nav,
  navBottom,
  onCollapse,
}: Readonly<Pick<AppShellProps, "workspace" | "account" | "nav" | "navBottom">> & {
  onCollapse: () => void;
}) {
  return (
    <div className="hidden min-[1280px]:flex">
      <Sidebar
        workspace={workspace}
        account={account}
        onCollapse={onCollapse}
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
}: Readonly<Pick<AppShellProps, "workspace" | "account" | "nav" | "navBottom">> & {
  onExpand: () => void;
}) {
  return (
    <div className="hidden min-[768px]:flex min-[1280px]:hidden">
      <SidebarRail
        workspace={workspace}
        account={account}
        onExpand={onExpand}
        navBottom={navBottom}
      >
        {nav}
      </SidebarRail>
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
    <div id={id} className="hidden min-w-0 flex-1 min-[768px]:flex">
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
}: Readonly<
  Pick<
    AppShellProps,
    "title" | "children" | "mobileBottomNav" | "isMobileOverlayOpen" | "mobileSheet"
  >
>) {
  return (
    <div className="flex min-w-0 flex-1 min-[768px]:hidden">
      <MobileAppShell
        title={title}
        bottomNav={<BottomNavFromProps {...mobileBottomNav} />}
        isOverlayOpen={isMobileOverlayOpen}
        sheet={mobileSheet}
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
}: Readonly<{
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workspace: AppShellProps["workspace"];
  account: AppShellProps["account"];
  nav: AppShellProps["nav"];
  navBottom: AppShellProps["navBottom"];
  onCollapse: () => void;
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
