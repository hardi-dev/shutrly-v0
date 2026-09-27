import { Button as AriaButton } from "react-aria-components";

import { Avatar } from "@/ui/primitives/avatar/avatar";
import { Icon } from "@/ui/primitives/icon/icon";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { SIDEBAR_COPY } from "../sidebar/sidebar.copy";
import type { SidebarAccount, SidebarWorkspace } from "../sidebar/sidebar.types";
import type { SidebarRailProps } from "./sidebar-rail.types";

/** Renders the 72px tablet navigation rail with an Expand control (C37). */
export function SidebarRail({
  workspace,
  account,
  children,
  navBottom,
  onExpand,
}: Readonly<SidebarRailProps>) {
  return (
    <aside
      className="flex h-full w-(--size-rail) shrink-0 flex-col items-center gap-(--component-sidebar-rail-gap) py-(--component-sidebar-padding-y)"
      aria-label={SIDEBAR_COPY.label}
    >
      <RailMark />
      <RailWorkspace workspace={workspace} />
      <div className="h-px w-full bg-(--component-sidebar-divider)" />
      <nav
        aria-label={SIDEBAR_COPY.navigationLabel}
        className="flex min-h-0 flex-1 flex-col items-center gap-(--component-sidebar-rail-gap) overflow-y-auto"
      >
        {children}
        {navBottom ? (
          <div className="mt-auto flex flex-col items-center gap-(--component-sidebar-rail-gap)">
            {navBottom}
          </div>
        ) : null}
      </nav>
      <div className="h-px w-full bg-(--component-sidebar-divider)" />
      <IconButton
        icon="panel-left-open"
        size="md"
        aria-label={SIDEBAR_COPY.expand}
        onPress={onExpand}
      />
      <Avatar initials={account.initials} aria-label={account.name} />
    </aside>
  );
}

function RailMark() {
  return (
    <div className="flex size-(--size-mark-lg) items-center justify-center rounded-(--radius-xs) bg-(--component-sidebar-workspace-mark)">
      <Icon
        name="camera"
        size="sm"
        aria-hidden="true"
        className="text-(--color-semantic-accent-on-highlight)"
      />
    </div>
  );
}

function RailWorkspace({ workspace }: Readonly<{ workspace: SidebarWorkspace }>) {
  return (
    <AriaButton
      type="button"
      aria-haspopup="menu"
      aria-label={workspace.name}
      className="flex size-(--space-10) items-center justify-center rounded-(--component-sidebar-workspace-radius) border border-(--component-sidebar-workspace-border) bg-(--component-sidebar-workspace-background) outline-none"
    >
      <div className="flex size-(--size-mark-md) items-center justify-center rounded-(--radius-xs) bg-(--component-sidebar-workspace-mark)">
        <Icon
          name="camera"
          size="sm"
          aria-hidden="true"
          className="text-(--color-semantic-accent-on-highlight)"
        />
      </div>
    </AriaButton>
  );
}

export type { SidebarAccount, SidebarWorkspace };
