import {
  TEMPLATE_TYPES,
  templateSlugOf,
} from "@/features/communications/domain/template-type/template-type";
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";

import {
  TEMPLATE_LABEL_MESSAGE_KEY,
  TEMPLATE_PURPOSE_MESSAGE_KEY,
} from "../template-copy/template-copy.copy";
import type { TemplateTranslate } from "../template-copy/template-copy.types";
import type { TemplateSubPage } from "./template-sub-pages.types";

/**
 * Builds the template list URL of a workspace.
 * @param workspaceId - the route workspace ID
 * @returns the list path
 */
export function messageTemplatesHref(workspaceId: string): string {
  return `/w/${workspaceId}/message-templates`;
}

/**
 * Builds a template editor URL.
 * @param workspaceId - the route workspace ID
 * @param type - the template type
 * @returns the editor path
 */
export function messageTemplateHref(workspaceId: string, type: TemplateType): string {
  return `${messageTemplatesHref(workspaceId)}/${templateSlugOf(type)}`;
}

/**
 * Lists the editor sub-pages the Owner shell shows with a breadcrumb parent and a Compact Bar
 * (F-17 sub-page, design v3).
 * @param t - the template translator, from the server layout
 * @param workspaceId - the route workspace ID
 * @returns one heading per template editor
 */
export function messageTemplateSubPages(
  t: TemplateTranslate,
  workspaceId: string,
): readonly TemplateSubPage[] {
  const parent = { label: t("pageParent"), href: messageTemplatesHref(workspaceId) };
  return TEMPLATE_TYPES.map((type) => ({
    path: messageTemplateHref(workspaceId, type),
    title: t(TEMPLATE_LABEL_MESSAGE_KEY[type]),
    subtitle: t("subPageSubtitle", {
      purpose: t(TEMPLATE_PURPOSE_MESSAGE_KEY[type]),
      sendNote: t("sendNote"),
    }),
    parent,
  }));
}
