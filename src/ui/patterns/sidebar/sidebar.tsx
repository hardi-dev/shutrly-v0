import { Button as AriaButton } from "react-aria-components";

import { Avatar } from "@/ui/primitives/avatar/avatar";
import { Icon } from "@/ui/primitives/icon/icon";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { SIDEBAR_COPY } from "./sidebar.copy";
import type { SidebarAccount, SidebarProps, SidebarWorkspace } from "./sidebar.types";

/** Renders the desktop workspace sidebar with switcher, navigation and account slots (C29). */
export function Sidebar({
  workspace,
  account,
  children,
  navBottom,
  onCollapse,
  onLogout,
}: Readonly<SidebarProps>) {
  return (
    <aside
      className="flex h-full w-(--component-sidebar-width) shrink-0 flex-col gap-(--component-sidebar-gap) bg-transparent px-(--component-sidebar-padding-x) py-(--component-sidebar-padding-y)"
      aria-label={SIDEBAR_COPY.label}
    >
      <SidebarLogo onCollapse={onCollapse} />
      <div className="h-px bg-(--component-sidebar-divider)" />
      <WorkspaceSwitcher workspace={workspace} />
      <nav
        aria-label={SIDEBAR_COPY.navigationLabel}
        className="flex min-h-0 flex-1 flex-col gap-(--space-3) overflow-y-auto"
      >
        <div className="flex flex-col gap-(--space-1)">{children}</div>
        {navBottom ? (
          <div className="mt-auto flex flex-col gap-(--space-1)">{navBottom}</div>
        ) : null}
      </nav>
      <SidebarAccount account={account} onLogout={onLogout} />
    </aside>
  );
}

function SidebarLogo({ onCollapse }: Readonly<{ onCollapse?: () => void }>) {
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

function WorkspaceSwitcher({ workspace }: Readonly<{ workspace: SidebarWorkspace }>) {
  return (
    <AriaButton
      type="button"
      aria-haspopup="menu"
      aria-label={workspace.name}
      className="flex items-center gap-(--space-2) rounded-(--component-sidebar-workspace-radius) border border-(--component-sidebar-workspace-border) bg-(--component-sidebar-workspace-background) px-(--component-sidebar-padding-x) py-(--component-sidebar-padding-y) text-left outline-none data-hovered:bg-(--color-semantic-surface-sunken)"
    >
      <div className="flex size-(--size-mark-md) items-center justify-center rounded-(--radius-xs) bg-(--component-sidebar-workspace-mark)">
        <Icon
          name="camera"
          size="sm"
          aria-hidden="true"
          className="text-(--color-semantic-accent-on-highlight)"
        />
      </div>
      <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-(--color-semantic-text-primary)">
        {workspace.name}
      </span>
      <Icon
        name="chevrons-up-down"
        size="sm"
        aria-hidden="true"
        className="text-(--color-semantic-text-muted)"
      />
    </AriaButton>
  );
}

function SidebarAccount({
  account,
  onLogout,
}: Readonly<{ account: SidebarAccount; onLogout?: () => void }>) {
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
