"use client";

import { NavItem } from "@/ui/patterns/nav-item/nav-item";

import { OWNER_NAV_COPY } from "./owner-nav.copy";
import type { OwnerNavProps } from "./owner-nav.types";

/** Renders the complete Owner workspace navigation with route-aware active states. @param props - workspace route context @returns the navigation items */
export function OwnerNav({ workspaceId, pathname }: Readonly<OwnerNavProps>) {
  const items = [
    ["", OWNER_NAV_COPY.dashboard, "layout-grid"],
    ["projects", OWNER_NAV_COPY.projects, "folder-kanban"],
    ["clients", OWNER_NAV_COPY.clients, "users"],
    ["invoices", OWNER_NAV_COPY.invoices, "receipt"],
    ["services", OWNER_NAV_COPY.services, "package"],
    ["team", OWNER_NAV_COPY.team, "user-round-cog"],
    ["message-templates", OWNER_NAV_COPY.messageTemplates, "message-square-text"],
    ["client-sources", OWNER_NAV_COPY.clientSources, "share-2"],
    ["settings", OWNER_NAV_COPY.settings, "settings"],
  ] as const;
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
