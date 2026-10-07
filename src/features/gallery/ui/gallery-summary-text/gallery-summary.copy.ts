// The project page's Galeri card summary rows (owner-7-galeri `r71J5`, `QUSVb`, F-10 Slice 12).
export const GALLERY_SUMMARY_COPY = {
  join: " · ",
  groupUsage: (name: string, usage: number, limit: number) =>
    `${name} ${String(usage)}/${String(limit)}`,
  allLocked: "semua dikunci",
  allLockedMobile: "Semua grup dikunci",
  // not in Pencil: the export draws only the locked and published state
  sent: (count: number) => `${String(count)} dikirim`,
  sentMobile: (count: number) => `${String(count)} grup dikirim`,
  open: "terbuka",
  openMobile: "Klien sedang memilih",
  edited: (count: number) => `${String(count)} edited`,
  print: (count: number) => `${String(count)} print`,
  ready: (files: string) => `${files} siap`,
  readyMobile: "Siap dipublikasikan",
  published: (when: string) => `Dipublikasikan ${when}`,
} as const;
