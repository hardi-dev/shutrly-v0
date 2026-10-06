// Copy shared by several client screens (F-10).
export const CLIENT_COPY = {
  home: "Beranda",
  allPhotos: "Semua foto",
  finalDelivery: "Hasil akhir",
  groupStatus: { OPEN: "Terbuka", SUBMITTED: "Dikirim", LOCKED: "Dikunci" },
  defaultUnit: "foto",
  usageOpen: (usage: number, limit: number, unit: string) =>
    `${String(usage)} dari ${String(limit)} ${unit} dipilih`,
  usageSubmitted: (usage: number, unit: string) =>
    `${String(usage)} ${unit} dikirim · menunggu fotografer`,
  usageLocked: (usage: number, unit: string) => `${String(usage)} ${unit} · dikunci fotografer`,
} as const;
