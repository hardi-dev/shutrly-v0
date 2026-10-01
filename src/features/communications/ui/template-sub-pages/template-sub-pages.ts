import {
  TEMPLATE_TYPES,
  templateSlugOf,
} from "@/features/communications/domain/template-type/template-type";
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";

import { TEMPLATE_COPY, TEMPLATE_PAGE_COPY } from "../template-copy/template-copy.copy";
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
 * @param workspaceId - the route workspace ID
 * @returns one heading per template editor
 */
export function messageTemplateSubPages(workspaceId: string): readonly TemplateSubPage[] {
  const parent = { label: TEMPLATE_PAGE_COPY.parent, href: messageTemplatesHref(workspaceId) };
  return TEMPLATE_TYPES.map((type) => ({
    path: messageTemplateHref(workspaceId, type),
    title: TEMPLATE_COPY[type].label,
    subtitle: `${TEMPLATE_COPY[type].purpose} ${TEMPLATE_PAGE_COPY.sendNote}`,
    parent,
  }));
}
