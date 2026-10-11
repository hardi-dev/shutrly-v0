// Names the message template namespace the layout reads for the editor sub-page headings.
import { TEMPLATE_COPY_NAMESPACE } from "@/features/communications/ui/template-copy/template-copy.copy";

export const MESSAGE_TEMPLATE_SUB_PAGES_COPY_NAMESPACE = TEMPLATE_COPY_NAMESPACE;

// Source: copy-deck.md §1 "Owner navigation and shell" (Dashboard) and §4.3 (Title). Copied verbatim.
export const WORKSPACE_LAYOUT_COPY_NAMESPACE = "ownerWorkspaceLayout";

export const WORKSPACE_LAYOUT_COPY = {
  namespace: WORKSPACE_LAYOUT_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      title: "Dashboard",
    },
    id: {
      title: "Dasbor",
    },
  },
} as const;
