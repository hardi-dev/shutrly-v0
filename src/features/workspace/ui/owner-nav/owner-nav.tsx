"use client";

import { NavItem } from "@/ui/patterns/nav-item/nav-item";
import { SidebarNavGroup } from "@/ui/patterns/sidebar/sidebar";

import { OWNER_NAV_COPY } from "./owner-nav.copy";
import type { OwnerNavProps } from "./owner-nav.types";
import type { ActiveNavState, PageHeading } from "./owner-nav.types";

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
  if (section === "services") return { nav: "services", tab: null };
  if (section === "settings") return { nav: "settings", tab: null };
  return { nav: null, tab: null };
}

const SECTION_TITLES: Readonly<Record<string, string>> = {
  projects: OWNER_NAV_COPY.projects,
  clients: OWNER_NAV_COPY.clients,
  invoices: OWNER_NAV_COPY.invoices,
  services: OWNER_NAV_COPY.services,
  "message-templates": OWNER_NAV_COPY.messageTemplates,
  "photo-sources": OWNER_NAV_COPY.photoSources,
  search: OWNER_NAV_COPY.search,
  notifications: OWNER_NAV_COPY.notifications,
};

/**
 * Resolves the Page Header title and subtitle for a workspace pathname.
 * @param pathname - the current pathname
 * @param workspaceId - the workspace in the URL
 * @param workspaceName - the workspace name used in the dashboard subtitle
 * @returns the heading, or null outside the workspace routes
 */
export function resolvePageHeading(
  pathname: string,
  workspaceId: string,
  workspaceName: string,
): PageHeading | null {
  const prefix = `/w/${workspaceId}`;
  if (pathname === prefix || pathname === `${prefix}/`) {
    return {
      title: OWNER_NAV_COPY.dashboard,
      subtitle: OWNER_NAV_COPY.dashboardSubtitle(workspaceName),
    };
  }
  if (!pathname.startsWith(`${prefix}/`)) return null;
  const section = pathname.slice(prefix.length).split("/")[1] ?? "";
  if (section === "settings") {
    return { title: OWNER_NAV_COPY.settings, subtitle: OWNER_NAV_COPY.settingsSubtitle };
  }
  if (section === "message-templates") {
    return {
      title: OWNER_NAV_COPY.messageTemplates,
      subtitle: OWNER_NAV_COPY.messageTemplatesSubtitle,
    };
  }
  if (section === "photo-sources") {
    return { title: OWNER_NAV_COPY.photoSources, subtitle: OWNER_NAV_COPY.photoSourcesSubtitle };
  }
  if (section === "clients") return resolveClientsHeading(pathname, prefix);
  if (section === "projects") return resolveProjectsHeading(pathname, prefix);
  if (section === "team") return resolveTeamHeading(pathname, prefix);
  if (section === "services") return resolveServicesHeading(pathname, prefix, workspaceName);
  const title = SECTION_TITLES[section];
  return title ? { title, subtitle: OWNER_NAV_COPY.comingSoonSubtitle } : null;
}

function resolveProjectsHeading(pathname: string, prefix: string): PageHeading {
  const base = `${prefix}/projects`;
  const rest = pathname.slice(base.length).split("/").filter(Boolean).join("/");
  const tabs = [
    { label: OWNER_NAV_COPY.projectTabs.active, href: base, isActive: rest === "" },
    {
      label: OWNER_NAV_COPY.projectTabs.completed,
      href: `${base}/completed`,
      isActive: rest === "completed",
    },
    {
      label: OWNER_NAV_COPY.projectTabs.cancelled,
      href: `${base}/cancelled`,
      isActive: rest === "cancelled",
    },
  ];
  // Proyek baru and a project's detail are sub-pages: they set their own heading and have no tabs.
  if (!tabs.some((tab) => tab.isActive)) return { title: OWNER_NAV_COPY.projects };
  return {
    title: OWNER_NAV_COPY.projects,
    subtitle: OWNER_NAV_COPY.projectsSubtitle,
    mobileSubtitle: OWNER_NAV_COPY.projectsMobileSubtitle,
    tabs: { label: OWNER_NAV_COPY.projectsTabsLabel, tabs },
  };
}

function resolveClientsHeading(pathname: string, prefix: string): PageHeading {
  const archived = pathname === `${prefix}/clients/archived`;
  return {
    title: OWNER_NAV_COPY.clients,
    subtitle: OWNER_NAV_COPY.clientsSubtitle,
    mobileSubtitle: OWNER_NAV_COPY.clientsMobileSubtitle,
    tabs: {
      label: OWNER_NAV_COPY.clientsTabsLabel,
      tabs: [
        { label: OWNER_NAV_COPY.clientTabs.active, href: `${prefix}/clients`, isActive: !archived },
        {
          label: OWNER_NAV_COPY.clientTabs.archived,
          href: `${prefix}/clients/archived`,
          isActive: archived,
        },
      ],
    },
  };
}

function resolveTeamHeading(pathname: string, prefix: string): PageHeading {
  const base = `${prefix}/team`;
  const archived = pathname === `${base}/archived`;
  const roles = pathname === `${base}/roles`;
  return {
    title: OWNER_NAV_COPY.team,
    subtitle: OWNER_NAV_COPY.teamSubtitle,
    mobileSubtitle: OWNER_NAV_COPY.teamMobileSubtitle,
    tabs: {
      label: OWNER_NAV_COPY.teamTabsLabel,
      tabs: [
        { label: OWNER_NAV_COPY.teamTabs.active, href: base, isActive: !archived && !roles },
        { label: OWNER_NAV_COPY.teamTabs.archived, href: `${base}/archived`, isActive: archived },
        { label: OWNER_NAV_COPY.teamTabs.roles, href: `${base}/roles`, isActive: roles },
      ],
    },
  };
}

function resolveServicesHeading(
  pathname: string,
  prefix: string,
  workspaceName: string,
): PageHeading {
  const servicesPrefix = `${prefix}/services`;
  const rest = pathname.slice(servicesPrefix.length).split("/").filter(Boolean).join("/");
  const tabs = [
    { href: servicesPrefix, label: OWNER_NAV_COPY.serviceTabs.services, isActive: rest === "" },
    {
      href: `${servicesPrefix}/categories`,
      label: OWNER_NAV_COPY.serviceTabs.categories,
      isActive: rest === "categories",
    },
    {
      href: `${servicesPrefix}/items`,
      label: OWNER_NAV_COPY.serviceTabs.items,
      isActive: rest === "items",
    },
  ] as const;
  const activeTab = tabs.find((tab) => tab.isActive);
  if (!activeTab)
    return { title: OWNER_NAV_COPY.services, subtitle: OWNER_NAV_COPY.servicesSubtitle };
  return {
    title: activeTab.label,
    subtitle: OWNER_NAV_COPY.servicesSubtitle,
    breadcrumbs: [
      { label: workspaceName, href: prefix },
      ...(rest === "" ? [] : [{ label: OWNER_NAV_COPY.services, href: servicesPrefix }]),
      { label: activeTab.label },
    ],
    tabs: { label: OWNER_NAV_COPY.servicesTabsLabel, tabs },
  };
}

export function OwnerNavBottom({ workspaceId, pathname }: Readonly<OwnerNavProps>) {
  return (
    <SidebarNavGroup>
      <OwnerNavItems
        workspaceId={workspaceId}
        pathname={pathname}
        items={[
          ["message-templates", OWNER_NAV_COPY.messageTemplates, "message-square-text"],
          ["photo-sources", OWNER_NAV_COPY.photoSources, "folder-open"],
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
      | "folder-open"
      | "layout-grid"
      | "message-square-text"
      | "package"
      | "receipt"
      | "settings"
      | "user-round-cog"
      | "users"
    ),
  ])[];
}>) {
  return items.map(([section, label, icon]) => {
    const href = workspaceHref(workspaceId, section);
    return (
      <NavItem
        key={href}
        href={href}
        label={label}
        icon={icon}
        isActive={isCurrentSection(pathname, href, section)}
      />
    );
  });
}

/** A section stays active on its nested routes (e.g. a template editor); the Dashboard does not. */
function isCurrentSection(pathname: string, href: string, section: string): boolean {
  return pathname === href || (section.length > 0 && pathname.startsWith(`${href}/`));
}

function workspaceHref(workspaceId: string, section: string): string {
  return section.length > 0 ? `/w/${workspaceId}/${section}` : `/w/${workspaceId}`;
}
