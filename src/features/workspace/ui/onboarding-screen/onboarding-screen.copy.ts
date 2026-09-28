export const ONBOARDING_COPY = {
  title: "Siapkan workspace pertamamu",
  description: "Cukup nama brand. Sisanya bisa dilengkapi nanti.",
  nameLabel: "Nama workspace",
  namePlaceholder: "Contoh: Aster Wedding",
  submit: "Buat workspace",
  preview: "Workspace Anda",
  benefitsLabel: "Yang kamu dapatkan",
  benefits: [
    {
      title: "Ruang terpisah",
      description:
        "Klien, proyek, galeri, dan invoice brand ini tidak bercampur dengan brand lain.",
    },
    {
      title: "Prefiks invoice AW",
      description: "Dibuat dari nama; ubah kapan saja di Pengaturan workspace.",
    },
    {
      title: "Rupiah (IDR)",
      description: "Mata uang default untuk workspace ini.",
    },
  ],
  signedIn: "Masuk sebagai",
  account: (name: string, email: string) => `${name} · ${email}`,
  signOut: "Keluar",
  separator: "·",
} as const;
