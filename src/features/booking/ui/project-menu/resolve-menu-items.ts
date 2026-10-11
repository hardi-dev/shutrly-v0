/* eslint-disable max-lines-per-function -- one switch maps every menu item kind to its label, icon and action */
import { whatsappChatUrl } from "@/features/booking/domain/whatsapp-number/whatsapp-number";

import type { ProjectTranslate } from "../project-copy/project-copy.types";
import { projectStepCopy } from "../project-step-copy/project-step-copy";
import type { ProjectMenuHandlers, ProjectMenuProps, ResolvedMenuItem } from "./project-menu.types";

function resolve(
  t: ProjectTranslate,
  item: ProjectMenuProps["groups"]["project"][number],
  whatsappNumber: string | null,
  handlers: ProjectMenuHandlers,
): ResolvedMenuItem {
  switch (item.kind) {
    case "STEP": {
      const copy = projectStepCopy(t, item.step);
      return {
        key: item.step,
        item,
        label: copy.label,
        icon: copy.icon,
        isDestructive: false,
        run: () => {
          handlers.onStep(item.step);
        },
      };
    }
    case "EDIT_INFO":
      return {
        key: item.kind,
        item,
        label: t("menuEditInfo"),
        icon: "pencil",
        isDestructive: false,
        run: handlers.onEditInfo,
      };
    case "CHAT_WHATSAPP":
      return {
        key: item.kind,
        item,
        label: t("menuChat"),
        icon: "message-circle",
        isDestructive: false,
        href: whatsappNumber === null ? undefined : whatsappChatUrl(whatsappNumber),
      };
    case "ADD_WHATSAPP_NUMBER":
      return {
        key: item.kind,
        item,
        label: t("menuAddNumber"),
        icon: "message-circle",
        isDestructive: false,
        run: handlers.onAddNumber,
      };
    case "CANCEL":
      return {
        key: item.kind,
        item,
        label: t("menuCancel"),
        icon: "circle-x",
        isDestructive: true,
        run: handlers.onCancel,
      };
    case "DELETE_DRAFT":
      return {
        key: item.kind,
        item,
        label: t("menuDeleteDraft"),
        icon: "trash-2",
        isDestructive: true,
        run: handlers.onDeleteDraft,
      };
  }
}

/**
 * Turns the three menu groups into labelled, iconed entries (D-13, AC-PRJ-027).
 * @param t - the project translator
 * @param props - groups, number and handlers
 * @returns the entries per group
 */
export function resolveMenuGroups(
  t: ProjectTranslate,
  props: Pick<ProjectMenuProps, "groups" | "whatsappNumber" | "handlers">,
) {
  const map = (items: ProjectMenuProps["groups"]["project"]) =>
    items.map((item) => resolve(t, item, props.whatsappNumber, props.handlers));
  return {
    project: map(props.groups.project),
    sendToClient: map(props.groups.sendToClient),
    destructive: map(props.groups.destructive),
  };
}
/* eslint-enable max-lines-per-function -- one switch maps every menu item kind to its label, icon and action */
