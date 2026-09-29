export const WORKSPACE_SWITCHER_COPY = {
  menuLabel: "Pindah workspace",
  trigger: "Pilih workspace",
  create: "Buat workspace",
  failed: "Gagal pindah workspace",
  failedBody: (workspaceName: string) => `Kamu masih di ${workspaceName}.`,
  count: (total: number) => `${String(total)} workspace`,
  retry: "Coba lagi",
} as const;
