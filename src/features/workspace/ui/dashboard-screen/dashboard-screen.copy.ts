// Source: copy-deck.md §4.3 "Dashboard" rows. Copied verbatim. The placeholder rows (greeting,
// description, empty state, CTA) are retired by F-26 (2026-10-15); the overview has its own copy.
export const DASHBOARD_COPY_NAMESPACE = "workspaceDashboard";

export const DASHBOARD_COPY = {
  namespace: DASHBOARD_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      created: "Workspace created",
    },
    id: {
      created: "Ruang kerja dibuat",
    },
  },
} as const;
