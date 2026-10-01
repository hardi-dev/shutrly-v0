// editor-unsaved-KKHgt (desktop Modal) and T96gnV (phone Bottom Sheet).
export const UNSAVED_CHANGES_COPY = {
  title: "Buang perubahan?",
  description: (template: string) =>
    `Perubahan pada ${template} belum disimpan dan akan hilang kalau kamu keluar.`,
  mobileDescription: (template: string) => `Perubahan pada ${template} belum disimpan.`,
  stay: "Lanjut mengedit",
  leave: "Buang perubahan",
} as const;
