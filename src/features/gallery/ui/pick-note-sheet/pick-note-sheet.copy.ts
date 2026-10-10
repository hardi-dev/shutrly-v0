export const PICK_NOTE_COPY = {
  title: (fileName: string) => `Catatan untuk ${fileName}`,
  description: "Opsional. Tulis apa yang ingin diubah fotografer dari foto ini.",
  pickedFor: (groupName: string) => `Dipilih untuk ${groupName}`,
  label: "Catatan",
  helper: (count: number, max: number) => `Opsional · ${String(count)}/${String(max)}`,
  save: "Simpan catatan",
  // not in Pencil: client-side length check and server refusals
  tooLong: (max: number) => `Catatan paling banyak ${String(max)} karakter.`,
  failed: "Catatan belum tersimpan. Coba lagi.",
  rateLimited: "Terlalu banyak perubahan, coba lagi sebentar.",
} as const;
