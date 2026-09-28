"use client";

import { NavItem } from "@/ui/patterns/nav-item/nav-item";
import { SidebarNavGroup } from "@/ui/patterns/sidebar/sidebar";

import { OWNER_NAV_COPY } from "./owner-nav.copy";
import type { OwnerNavProps } from "./owner-nav.types";
import type { ActiveNavState } from "./owner-nav.types";

/** Renders the complete Owner workspace navigation with route-aware active states. @param props - workspace route context @returns the navigation items */
export function OwnerNav({ workspaceId, pathname }: Readonly<OwnerNavProps>) {
  return (
    <SidebarNavGroup>
      <OwnerNavItems
        workspaceId={workspaceId}
        pathname={pathname}
        items={[
          ["", OWNER_NAV_COPY.dashboard, "layout-grid"],
          ["projects", OWNER_NAV_COPY.projects, "folder-kanban"],
          ["clients", OWNER_NAV_COPY.clients, "users"],
          ["invoices", OWNER_NAV_COPY.invoices, "receipt"],
        ]}
      />
      <SidebarNavGroup label={OWNER_NAV_COPY.catalog}>
        <OwnerNavItems
          workspaceId={workspaceId}
          pathname={pathname}
          items={[
            ["services", OWNER_NAV_COPY.services, "package"],
            ["team", OWNER_NAV_COPY.team, "user-round-cog"],
          ]}
        />
      </SidebarNavGroup>
    </SidebarNavGroup>
  );
}

/** Resolves the desktop nav key and phone tab from a workspace pathname. */
export function resolveActiveNav(pathname: string, workspaceId: string): ActiveNavState {
  const prefix = `/w/${workspaceId}`;
  const section = pathname.slice(prefix.length).split("/")[1] ?? "";
  if (pathname === prefix) return { nav: "dashboard", tab: "dashboard" };
  if (section === "projects") return { nav: "projects", tab: "projects" };
  if (section === "clients") return { nav: "clients", tab: "clients" };
  if (section === "invoices") return { nav: "invoices", tab: "invoices" };
  if (section === "settings") return { nav: "settings", tab: null };
  return { nav: null, tab: null };
}

export function OwnerNavBottom({ workspaceId, pathname }: Readonly<OwnerNavProps>) {
  return (
    <SidebarNavGroup>
      <OwnerNavItems
        workspaceId={workspaceId}
        pathname={pathname}
        items={[
          ["message-templates", OWNER_NAV_COPY.messageTemplates, "message-square-text"],
          ["client-sources", OWNER_NAV_COPY.clientSources, "share-2"],
          ["settings", OWNER_NAV_COPY.settings, "settings"],
        ]}
      />
    </SidebarNavGroup>
  );
}

function OwnerNavItems({
  workspaceId,
  pathname,
  items,
}: Readonly<{
  workspaceId: string;
  pathname: string;
  items: readonly (readonly [
    string,
    string,
    (
      | "folder-kanban"
      | "layout-grid"
      | "message-square-text"
      | "package"
      | "receipt"
      | "settings"
      | "share-2"
      | "user-round-cog"
      | "users"
    ),
  ])[];
}>) {
  return items.map(([section, label, icon]) => {
    const href = workspaceHref(workspaceId, section);
    return (
      <NavItem key={href} href={href} label={label} icon={icon} isActive={pathname === href} />
    );
  });
}

function workspaceHref(workspaceId: string, section: string): string {
  return section.length > 0 ? `/w/${workspaceId}/${section}` : `/w/${workspaceId}`;
}
