// Source: copy-deck.md §1, "Owner navigation and shell" and "Account menu". Copied verbatim.
export const OWNER_SHELL_COPY_NAMESPACE = "ownerShell";

export const OWNER_SHELL_COPY = {
  namespace: OWNER_SHELL_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      mobileMenuTitle: "More",
      search: "Search",
      notifications: "Notifications",
      menu: "Menu",
      logout: "Sign out",
      accountMenu: "Account menu",
      accountGroup: "Account",
      theme: "Theme",
      themeLight: "Light",
      themeDark: "Dark",
      themeSystem: "System",
    },
    id: {
      mobileMenuTitle: "Lainnya",
      search: "Cari",
      notifications: "Notifikasi",
      menu: "Menu",
      logout: "Keluar",
      accountMenu: "Menu akun",
      accountGroup: "Akun",
      theme: "Tema",
      themeLight: "Terang",
      themeDark: "Gelap",
      themeSystem: "Sistem",
    },
  },
} as const;
