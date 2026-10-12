// Source: copy-deck.md §4.2 "Workspace creation and switching" and §1 "Common actions" (Retry).
// Copied verbatim. The count uses ICU plurals; Indonesian has only the `other` form.
export const WORKSPACE_SWITCHER_COPY_NAMESPACE = "workspaceSwitcher";

export const WORKSPACE_SWITCHER_COPY = {
  namespace: WORKSPACE_SWITCHER_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      menuLabel: "Switch workspace",
      trigger: "Choose workspace",
      create: "Create workspace",
      failed: "Couldn’t switch workspaces",
      failedBody: "You’re still in {workspaceName}.",
      count: "{count, plural, one {# workspace} other {# workspaces}}",
      retry: "Try again",
    },
    id: {
      menuLabel: "Pindah ruang kerja",
      trigger: "Pilih ruang kerja",
      create: "Buat ruang kerja",
      failed: "Belum bisa pindah ruang kerja",
      failedBody: "Kamu masih di {workspaceName}.",
      count: "{count, plural, other {# ruang kerja}}",
      retry: "Coba lagi",
    },
  },
} as const;
