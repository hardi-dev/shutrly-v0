"use client";

import { useTranslations } from "next-intl";

import { NavItem } from "@/ui/patterns/nav-item/nav-item";
import { SidebarNavGroup } from "@/ui/patterns/sidebar/sidebar";

import { OWNER_NAV_COPY_NAMESPACE } from "./owner-nav.copy";
import type {
  ActiveNavState,
  OwnerNavProps,
  OwnerNavTranslator,
  PageHeading,
} from "./owner-nav.types";

/**
 * The Owner navigation copy. The shell reads its menu labels through this hook too.
 * @returns the translate function for the owner-nav namespace
 */
export function useOwnerNavTranslations(): OwnerNavTranslator {
  return useTranslations(OWNER_NAV_COPY_NAMESPACE);
}

/** Renders the complete Owner workspace navigation with route-aware active states. @param props - workspace route context @returns the navigation items */
export function OwnerNav({ workspaceId, pathname }: Readonly<OwnerNavProps>) {
  const t = useOwnerNavTranslations();
  return (
    <SidebarNavGroup>
      <OwnerNavItems
        workspaceId={workspaceId}
        pathname={pathname}
        items={[
          ["", t("dashboard"), "layout-grid"],
          ["projects", t("projects"), "folder-kanban"],
          ["clients", t("clients"), "users"],
          ["invoices", t("invoices"), "receipt"],
        ]}
      />
      <SidebarNavGroup label={t("catalog")}>
        <OwnerNavItems
          workspaceId={workspaceId}
          pathname={pathname}
          items={[
            ["services", t("services"), "package"],
            ["team", t("team"), "user-round-cog"],
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

const SECTION_TITLE_KEYS: Readonly<Record<string, string>> = {
  projects: "projects",
  clients: "clients",
  invoices: "invoices",
  services: "services",
  "message-templates": "messageTemplates",
  "photo-sources": "photoSources",
  search: "search",
  notifications: "notifications",
};

/**
 * Resolves the Page Header title and subtitle for a workspace pathname.
 * @param pathname - the current pathname
 * @param workspaceId - the workspace in the URL
 * @param workspaceName - the workspace name used in the dashboard subtitle
 * @param t - the owner-nav translate function
 * @returns the heading, or null outside the workspace routes
 */
export function resolvePageHeading(
  pathname: string,
  workspaceId: string,
  workspaceName: string,
  t: OwnerNavTranslator,
): PageHeading | null {
  const prefix = `/w/${workspaceId}`;
  if (pathname === prefix || pathname === `${prefix}/`) {
    return { title: t("dashboard"), subtitle: t("dashboardSubtitle") };
  }
  if (!pathname.startsWith(`${prefix}/`)) return null;
  const section = pathname.slice(prefix.length).split("/")[1] ?? "";
  if (section === "settings") {
    return { title: t("settings"), subtitle: t("settingsSubtitle") };
  }
  if (section === "message-templates") {
    return { title: t("messageTemplates"), subtitle: t("messageTemplatesSubtitle") };
  }
  if (section === "photo-sources") {
    return { title: t("photoSources"), subtitle: t("photoSourcesSubtitle") };
  }
  if (section === "clients") return resolveClientsHeading(pathname, prefix, t);
  if (section === "projects") return resolveProjectsHeading(pathname, prefix, t);
  if (section === "team") return resolveTeamHeading(pathname, prefix, t);
  if (section === "services") return resolveServicesHeading(pathname, prefix, workspaceName, t);
  const titleKey = SECTION_TITLE_KEYS[section];
  return titleKey ? { title: t(titleKey), subtitle: t("comingSoonSubtitle") } : null;
}

function resolveProjectsHeading(
  pathname: string,
  prefix: string,
  t: OwnerNavTranslator,
): PageHeading {
  const base = `${prefix}/projects`;
  const rest = pathname.slice(base.length).split("/").filter(Boolean).join("/");
  const tabs = [
    { label: t("projectTabActive"), href: base, isActive: rest === "" },
    {
      label: t("projectTabCompleted"),
      href: `${base}/completed`,
      isActive: rest === "completed",
    },
    {
      label: t("projectTabCancelled"),
      href: `${base}/cancelled`,
      isActive: rest === "cancelled",
    },
  ];
  // Proyek baru and a project's detail are sub-pages: they set their own heading and have no tabs.
  if (!tabs.some((tab) => tab.isActive)) return { title: t("projects") };
  return {
    title: t("projects"),
    subtitle: t("projectsSubtitle"),
    mobileSubtitle: t("projectsMobileSubtitle"),
    tabs: { label: t("projectsTabsLabel"), tabs },
  };
}

function resolveClientsHeading(
  pathname: string,
  prefix: string,
  t: OwnerNavTranslator,
): PageHeading {
  const archived = pathname === `${prefix}/clients/archived`;
  return {
    title: t("clients"),
    subtitle: t("clientsSubtitle"),
    mobileSubtitle: t("clientsMobileSubtitle"),
    tabs: {
      label: t("clientsTabsLabel"),
      tabs: [
        { label: t("clientTabActive"), href: `${prefix}/clients`, isActive: !archived },
        {
          label: t("clientTabArchived"),
          href: `${prefix}/clients/archived`,
          isActive: archived,
        },
      ],
    },
  };
}

function resolveTeamHeading(pathname: string, prefix: string, t: OwnerNavTranslator): PageHeading {
  const base = `${prefix}/team`;
  const archived = pathname === `${base}/archived`;
  const roles = pathname === `${base}/roles`;
  return {
    title: t("team"),
    subtitle: t("teamSubtitle"),
    mobileSubtitle: t("teamMobileSubtitle"),
    tabs: {
      label: t("teamTabsLabel"),
      tabs: [
        { label: t("teamTabActive"), href: base, isActive: !archived && !roles },
        { label: t("teamTabArchived"), href: `${base}/archived`, isActive: archived },
        { label: t("teamTabRoles"), href: `${base}/roles`, isActive: roles },
      ],
    },
  };
}

function resolveServicesHeading(
  pathname: string,
  prefix: string,
  workspaceName: string,
  t: OwnerNavTranslator,
): PageHeading {
  const servicesPrefix = `${prefix}/services`;
  const rest = pathname.slice(servicesPrefix.length).split("/").filter(Boolean).join("/");
  const tabs = [
    { href: servicesPrefix, label: t("serviceTabServices"), isActive: rest === "" },
    {
      href: `${servicesPrefix}/categories`,
      label: t("serviceTabCategories"),
      isActive: rest === "categories",
    },
    {
      href: `${servicesPrefix}/items`,
      label: t("serviceTabItems"),
      isActive: rest === "items",
    },
  ] as const;
  const activeTab = tabs.find((tab) => tab.isActive);
  if (!activeTab) return { title: t("services"), subtitle: t("servicesSubtitle") };
  return {
    title: activeTab.label,
    subtitle: t("servicesSubtitle"),
    breadcrumbs: [
      { label: workspaceName, href: prefix },
      ...(rest === "" ? [] : [{ label: t("services"), href: servicesPrefix }]),
      { label: activeTab.label },
    ],
    tabs: { label: t("servicesTabsLabel"), tabs },
  };
}

export function OwnerNavBottom({ workspaceId, pathname }: Readonly<OwnerNavProps>) {
  const t = useOwnerNavTranslations();
  return (
    <SidebarNavGroup>
      <OwnerNavItems
        workspaceId={workspaceId}
        pathname={pathname}
        items={[
          ["message-templates", t("messageTemplates"), "message-square-text"],
          ["photo-sources", t("photoSources"), "folder-open"],
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
