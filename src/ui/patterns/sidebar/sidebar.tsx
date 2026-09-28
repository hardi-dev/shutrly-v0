import { Button as AriaButton } from "react-aria-components";

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
        <SidebarLogo isCompact={isCompact} onCollapse={onCollapse} onExpand={onExpand} />
        {!isCompact ? <div className="h-px bg-(--component-sidebar-divider)" /> : null}
        {resolveWorkspaceSwitcher(workspaceSwitcher, isCompact) ?? (
          <WorkspaceSwitcher workspace={workspace} isCompact={isCompact} />
        )}
        {isCompact ? <div className="h-px w-full bg-(--component-sidebar-divider)" /> : null}
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
        {isCompact ? <div className="h-px w-full bg-(--component-sidebar-divider)" /> : null}
        <SidebarAccount account={account} isCompact={isCompact} onLogout={onLogout} />
      </aside>
    </NavItemCompactContext.Provider>
  );
}

// eslint-disable-next-line max-lines-per-function -- renders the expanded and compact logo controls
function SidebarLogo({
  isCompact,
  onCollapse,
  onExpand,
}: Readonly<{ isCompact: boolean; onCollapse?: () => void; onExpand?: () => void }>) {
  if (isCompact) {
    return (
      <AriaButton
        type="button"
        aria-label={SIDEBAR_COPY.expand}
        onPress={onExpand}
        className="group flex size-(--size-mark-lg) items-center justify-center rounded-(--radius-xs) outline-none focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]"
      >
        <span className="flex size-full items-center justify-center rounded-(--radius-xs) bg-(--component-sidebar-workspace-mark)">
          <Icon
            name="camera"
            size="sm"
            aria-hidden="true"
            className="text-(--color-semantic-accent-on-highlight) group-hover:hidden group-focus-visible:hidden"
          />
          <Icon
            name="panel-left-open"
            size="sm"
            aria-hidden="true"
            className="hidden text-(--color-semantic-text-primary) group-hover:block group-focus-visible:block"
          />
        </span>
      </AriaButton>
    );
  }

  return (
    <div className="flex items-center gap-(--space-2) px-(--space-2)">
      <div className="flex size-(--size-mark-lg) items-center justify-center rounded-(--radius-xs) bg-(--component-sidebar-workspace-mark)">
        <Icon
          name="camera"
          size="sm"
          aria-hidden="true"
          className="text-(--color-semantic-accent-on-highlight)"
        />
      </div>
      <span className="flex-1 text-(--component-sidebar-logo) text-[18px] font-bold">
        {SIDEBAR_COPY.wordmark}
      </span>
      <IconButton
        icon="panel-left"
        size="sm"
        aria-label={SIDEBAR_COPY.collapse}
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
}: Readonly<SidebarWorkspaceTriggerProps>) {
  return (
    <AriaButton
      type="button"
      aria-haspopup="menu"
      aria-label={workspaceName}
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
          <span className="flex size-(--size-mark-md) shrink-0 items-center justify-center rounded-(--radius-xs) bg-(--component-sidebar-workspace-mark)">
            <Icon
              name="camera"
              size="sm"
              aria-hidden="true"
              data-icon="camera"
              className="text-(--color-semantic-accent-on-highlight)"
            />
          </span>
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
        <p className="truncate text-(length:--font-size-caption) text-(--color-semantic-text-muted)">
          {account.email}
        </p>
      </div>
      <IconButton icon="log-out" size="sm" aria-label={SIDEBAR_COPY.logout} onPress={onLogout} />
    </div>
  );
}

export type { SidebarAccount, SidebarWorkspace };
