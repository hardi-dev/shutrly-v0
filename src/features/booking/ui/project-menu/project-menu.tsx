"use client";
/* eslint-disable max-lines-per-function -- responsive menu renders one section list for both layouts */

import { Fragment, useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuDivider } from "@/ui/patterns/menu/menu-divider";
import { MenuGroupLabel } from "@/ui/patterns/menu/menu-group-label";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { ProjectMenuProps, ResolvedMenuItem } from "./project-menu.types";
import { resolveMenuGroups } from "./resolve-menu-items";

/** The ⋯ menu of a project: an Action Menu on desktop, a Bottom Sheet on phones (AC-PRJ-027). */
export function ProjectMenu(props: Readonly<ProjectMenuProps>) {
  const isMobile = useMobileViewport();
  const label = PROJECT_COPY.menuActions(props.title);
  const groups = resolveMenuGroups(props);
  const sections = [
    { id: "project", items: groups.project, label: null },
    { id: "send", items: groups.sendToClient, label: PROJECT_COPY.menuSendGroup },
    { id: "destructive", items: groups.destructive, label: null },
  ].filter((section) => section.items.length > 0);
  const size = props.variant === "row" ? "sm" : "md";
  if (isMobile) return <MobileMenu label={label} size={size} props={props} sections={sections} />;
  return (
    <MenuTrigger label={label}>
      <IconButton icon="more-horizontal" size={size} aria-label={label} />
      <Menu aria-label={label}>
        {sections.map((section, index) => (
          <Fragment key={section.id}>
            {index > 0 ? <MenuDivider /> : null}
            {section.label ? <MenuGroupLabel>{section.label}</MenuGroupLabel> : null}
            {section.items.map((entry) => (
              <DesktopEntry key={entry.key} entry={entry} />
            ))}
          </Fragment>
        ))}
      </Menu>
    </MenuTrigger>
  );
}

function DesktopEntry({ entry }: Readonly<{ entry: ResolvedMenuItem }>) {
  return (
    <MenuItem
      label={entry.label}
      icon={entry.icon}
      variant={entry.isDestructive ? "destructive" : "default"}
      href={entry.href}
      target={entry.href ? "_blank" : undefined}
      onSelect={entry.run}
    />
  );
}

function MobileMenu({
  label,
  size,
  props,
  sections,
}: Readonly<{
  label: string;
  size: "sm" | "md";
  props: ProjectMenuProps;
  sections: readonly { id: string; items: readonly ResolvedMenuItem[]; label: string | null }[];
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
    setIsOpen(true);
  };
  const run = (entry: ResolvedMenuItem) => () => {
    setIsOpen(false);
    entry.run?.();
  };
  return (
    <>
      <IconButton icon="more-horizontal" size={size} aria-label={label} onPress={handleOpen} />
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title={props.title}
        meta={props.meta}
        variant="actions"
      >
        {sections.map((section) => (
          <Fragment key={section.id}>
            {section.label ? (
              <p className="px-(--space-4) pt-(--space-2) text-(length:--font-size-overline) font-bold uppercase tracking-(--font-letter-spacing-overline) text-(--color-semantic-text-secondary)">
                {section.label}
              </p>
            ) : null}
            {section.items.map((entry) => (
              <SheetItem
                key={entry.key}
                label={entry.label}
                icon={entry.icon}
                variant={entry.isDestructive ? "destructive" : "default"}
                href={entry.href}
                target={entry.href ? "_blank" : undefined}
                onPress={run(entry)}
              />
            ))}
          </Fragment>
        ))}
      </BottomSheet>
    </>
  );
}
/* eslint-enable max-lines-per-function -- responsive menu renders one section list for both layouts */
