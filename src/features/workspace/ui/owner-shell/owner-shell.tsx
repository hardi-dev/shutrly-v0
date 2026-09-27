import { AppShell } from "@/ui/patterns/app-shell/app-shell";
import type { BottomNavProps } from "@/ui/patterns/bottom-nav/bottom-nav.types";

import { OwnerNav } from "../owner-nav/owner-nav";
import { OWNER_NAV_COPY } from "../owner-nav/owner-nav.copy";
import { WorkspaceSwitcher } from "../workspace-switcher/workspace-switcher";
import type { OwnerShellProps } from "./owner-shell.types";

const MOBILE_ITEMS: BottomNavProps["items"] = [
  { href: "", label: OWNER_NAV_COPY.dashboard, icon: "layout-grid", isActive: false },
  { href: "/projects", label: OWNER_NAV_COPY.projects, icon: "folder-kanban", isActive: false },
  { href: "/clients", label: OWNER_NAV_COPY.clients, icon: "users", isActive: false },
  { href: "/settings", label: OWNER_NAV_COPY.settings, icon: "settings", isActive: false },
];

/** Composes the feature's verified workspace data into the feature-agnostic AppShell. @param props - shell and account data @returns the responsive Owner shell */
export function OwnerShell({
  workspaceId,
  workspaceName,
  accountName,
  accountEmail,
  pathname,
  title,
  children,
  workspaces,
  onSwitch,
  onCreate,
}: Readonly<OwnerShellProps>) {
  const mobileItems = [
    mobileItem(MOBILE_ITEMS[0], workspaceId, pathname),
    mobileItem(MOBILE_ITEMS[1], workspaceId, pathname),
    mobileItem(MOBILE_ITEMS[2], workspaceId, pathname),
    mobileItem(MOBILE_ITEMS[3], workspaceId, pathname),
  ] as const satisfies BottomNavProps["items"];
  return (
    <AppShell
      title={title}
      workspace={{ name: workspaceName }}
      account={{ name: accountName, email: accountEmail, initials: initials(accountName) }}
      nav={<OwnerNav workspaceId={workspaceId} pathname={pathname} />}
      workspaceSwitcher={
        <WorkspaceSwitcher
          currentName={workspaceName}
          workspaces={workspaces}
          onSwitch={onSwitch}
          onCreate={onCreate}
        />
      }
      mobileBottomNav={{
        items: mobileItems,
        ctaLabel: OWNER_NAV_COPY.create,
      }}
    >
      {children}
    </AppShell>
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
