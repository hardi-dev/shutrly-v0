export const MENU_STORY_COPY = {
  default: {
    trigger: "Proyek",
    items: {
      prewedding: "Prewedding",
      wedding: "Wedding",
      product: "Produk",
      family: "Keluarga",
    },
  },
  action: {
    trigger: "Tindakan",
    edit: "Ubah proyek",
    duplicate: "Duplikat",
    delete: "Hapus proyek",
  },
  grouped: {
    trigger: "Katalog",
    label: "Katalog",
    services: "Layanan",
    team: "Tim",
  },
} as const;
