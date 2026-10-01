// Field errors from the v3 frames (editor-unknown-variable-sgWML, editor-required-link-v1nCP).
// EMPTY, TOO_LONG, MALFORMED and the generic fallback are not in Pencil.
export const TEMPLATE_PROBLEM_COPY = {
  empty: "Isi pesan tidak boleh kosong.",
  tooLong: (max: string) => `Isi pesan maksimal ${max} karakter.`,
  malformed: "Tulis variabel sebagai {{namaVariabel}} tanpa spasi, misalnya {{clientName}}.",
  unknownVariable: (variable: string, template: string) =>
    `{{${variable}}} tidak bisa dipakai di ${template}. Pakai variabel dari daftar di bawah.`,
  missingRequired: (variable: string, target: string) =>
    `Pesan ini wajib memuat {{${variable}}} agar klien bisa membuka ${target}.`,
  gallery: "gallery",
  invoice: "invoice",
  fallback: "Isi pesan belum bisa disimpan.",
} as const;
