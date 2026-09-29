import { useContext } from "react";
import { Button as AriaButton } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { Avatar } from "@/ui/primitives/avatar/avatar";
import { Icon } from "@/ui/primitives/icon/icon";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { NavItemCompactContext } from "../nav-item/nav-item-context";
import { SIDEBAR_COPY } from "./sidebar.copy";
import type {
  SidebarAccount,
  SidebarProps,
  SidebarWorkspace,
  SidebarWorkspaceTriggerProps,
} from "./sidebar.types";

/** Renders the expanded sidebar or its compact rail mode (C29/C37). */
// eslint-disable-next-line max-lines-per-function -- coordinates expanded and compact navigation regions
export function Sidebar({
  workspace,
  account,
  children,
  navBottom,
  isCompact = false,
  onCollapse,
  onExpand,
  onLogout,
  workspaceSwitcher,
}: Readonly<SidebarProps>) {
  return (
    <NavItemCompactContext.Provider value={isCompact}>
      <aside
        className={
          isCompact
            ? "flex h-full w-(--size-rail) shrink-0 flex-col items-center gap-(--component-sidebar-rail-gap) py-(--component-sidebar-padding-y)"
            : "flex h-full w-(--component-sidebar-width) shrink-0 flex-col gap-(--component-sidebar-gap) bg-transparent px-(--component-sidebar-padding-x) py-(--component-sidebar-padding-y)"
        }
        aria-label={SIDEBAR_COPY.label}
      >
        <SidebarLogo isCompact={isCompact} onCollapse={onCollapse} />
        {!isCompact ? (
          <div data-testid="sidebar-divider" className="h-px bg-(--component-sidebar-divider)" />
        ) : null}
        {resolveWorkspaceSwitcher(workspaceSwitcher, isCompact) ?? (
          <WorkspaceSwitcher workspace={workspace} isCompact={isCompact} />
        )}
        <SidebarDivider isCompact={isCompact} />
        <nav
          aria-label={SIDEBAR_COPY.navigationLabel}
          className={
            isCompact
              ? "flex min-h-0 flex-1 flex-col items-center gap-(--component-sidebar-rail-gap) overflow-y-auto"
              : "flex min-h-0 flex-1 flex-col gap-(--space-3) overflow-y-auto"
          }
        >
          <div className={isCompact ? "contents" : "flex flex-col gap-(--space-1)"}>{children}</div>
          {navBottom ? (
            <div
              className={
                isCompact
                  ? "mt-auto flex flex-col items-center gap-(--component-sidebar-rail-gap)"
                  : "mt-auto flex flex-col gap-(--space-1)"
              }
            >
              {navBottom}
            </div>
          ) : null}
        </nav>
        <SidebarDivider isCompact={isCompact} />
        {isCompact && onExpand ? (
          <IconButton
            icon="panel-left-open"
            aria-label={SIDEBAR_COPY.expand}
            data-sidebar-toggle=""
            onPress={onExpand}
          />
        ) : null}
        <SidebarAccount account={account} isCompact={isCompact} onLogout={onLogout} />
      </aside>
    </NavItemCompactContext.Provider>
  );
}

function SidebarDivider({ isCompact }: Readonly<{ isCompact: boolean }>) {
  return (
    <div
      data-testid="sidebar-divider"
      className={cn(
        "h-px shrink-0 bg-(--component-sidebar-divider)",
        isCompact ? "w-(--space-8)" : "w-full",
      )}
    />
  );
}

/** Renders the Shutrly aperture mark from the shell exports (C29). */
export function SidebarBrandMark() {
  return (
    <Icon
      name="aperture"
      aria-hidden="true"
      data-icon="aperture"
      className="size-(--size-mark-lg) shrink-0 text-(--component-sidebar-logo)"
    />
  );
}

/** Renders the aperture mark with the wordmark (C29 logo row, C32 menu sheet header). */
export function SidebarBrandLogo({ className }: Readonly<{ className?: string }>) {
  return (
    <span className={cn("flex items-center gap-(--space-2)", className)}>
      <SidebarBrandMark />
      <span className="text-(length:--font-size-title) font-bold tracking-(--font-letter-spacing-title) text-(--component-sidebar-logo)">
        {SIDEBAR_COPY.wordmark}
      </span>
    </span>
  );
}

function SidebarLogo({
  isCompact,
  onCollapse,
}: Readonly<{ isCompact: boolean; onCollapse?: () => void }>) {
  if (isCompact) {
    return (
      <div className="flex size-(--space-10) shrink-0 items-center justify-center">
        <SidebarBrandMark />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-(--space-2) px-(--space-2)">
      <SidebarBrandLogo className="flex-1" />
      <IconButton
        icon="panel-left"
        size="sm"
        aria-label={SIDEBAR_COPY.collapse}
        data-sidebar-toggle=""
        onPress={onCollapse}
      />
    </div>
  );
}

function WorkspaceSwitcher({
  workspace,
  isCompact,
}: Readonly<{ workspace: SidebarWorkspace; isCompact: boolean }>) {
  return <SidebarWorkspaceTrigger workspaceName={workspace.name} isCompact={isCompact} />;
}

export function SidebarWorkspaceTrigger({
  workspaceName,
  isCompact = false,
  onPress,
}: Readonly<SidebarWorkspaceTriggerProps>) {
  return (
    <AriaButton
      type="button"
      aria-haspopup="menu"
      aria-label={workspaceName}
      onPress={onPress}
      className={
        isCompact
          ? "flex size-(--space-10) items-center justify-center rounded-(--component-sidebar-workspace-radius) border border-(--component-sidebar-workspace-border) bg-(--component-sidebar-workspace-background) outline-none focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]"
          : "flex w-full items-center gap-(--space-2) rounded-(--component-sidebar-workspace-radius) border border-(--component-sidebar-workspace-border) bg-(--component-sidebar-workspace-background) px-(--component-sidebar-padding-x) py-(--component-sidebar-padding-y) text-left outline-none data-hovered:bg-(--color-semantic-surface-sunken) focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]"
      }
    >
      {isCompact ? (
        <Icon
          name="chevrons-up-down"
          size="sm"
          aria-hidden="true"
          data-icon="chevrons-up-down"
          className="text-(--color-semantic-text-muted)"
        />
      ) : (
        <>
          <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-(--color-semantic-text-primary)">
            {workspaceName}
          </span>
          <Icon
            name="chevrons-up-down"
            size="sm"
            aria-hidden="true"
            data-icon="chevrons-up-down"
            className="text-(--color-semantic-text-muted)"
          />
        </>
      )}
    </AriaButton>
  );
}

export function SidebarNavGroup({
  label,
  children,
}: Readonly<{ label?: string; children: React.ReactNode }>) {
  const isCompact = useContext(NavItemCompactContext);

  return (
    <div className={isCompact ? "contents" : "flex flex-col gap-(--space-1)"}>
      {isCompact && label ? (
        <div
          data-testid="sidebar-group-divider"
          className="h-px w-(--space-6) shrink-0 bg-(--component-sidebar-divider)"
        />
      ) : null}
      {!isCompact && label ? (
        <div className="flex w-full items-start px-(--component-nav-item-padding-x) py-(--space-1)">
          <span className="text-(length:--font-size-overline) font-bold tracking-(--font-letter-spacing-overline) text-(--color-semantic-text-secondary)">
            {label}
          </span>
        </div>
      ) : null}
      {children}
    </div>
  );
}

function resolveWorkspaceSwitcher(
  workspaceSwitcher: SidebarProps["workspaceSwitcher"],
  isCompact: boolean,
) {
  return typeof workspaceSwitcher === "function" ? workspaceSwitcher(isCompact) : workspaceSwitcher;
}

function SidebarAccount({
  account,
  isCompact,
  onLogout,
}: Readonly<{ account: SidebarAccount; isCompact: boolean; onLogout?: () => void }>) {
  if (isCompact) {
    return <Avatar initials={account.initials} aria-label={account.name} />;
  }

  return (
    <div className="flex items-center gap-(--component-sidebar-account-gap) px-(--space-2) py-(--space-1)">
      <Avatar initials={account.initials} aria-label={account.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-(length:--font-size-body-sm) font-semibold text-(--color-semantic-text-primary)">
          {account.name}
        </p>
        <p className="truncate text-(length:--font-size-caption) text-(--color-semantic-text-secondary)">
          {account.email}
        </p>
      </div>
      <IconButton icon="log-out" size="sm" aria-label={SIDEBAR_COPY.logout} onPress={onLogout} />
    </div>
  );
}

export type { SidebarAccount, SidebarWorkspace };
