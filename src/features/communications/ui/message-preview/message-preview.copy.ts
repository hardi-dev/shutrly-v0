// Preview sample data (A-6) and labels from editor-byw9B. The real brand name replaces
// brandName; the password is always masked (BR-MSG-003).
export const MESSAGE_PREVIEW_COPY = {
  regionLabel: "Pratinjau pesan", // not in Pencil: accessible name (AC-MSG-020)
  time: "10.24",
  passwordNote: "Password gallery diisi saat kamu membagikan pesan.",
  error: "Pratinjau muncul lagi setelah isi template diperbaiki.",
  sample: {
    clientName: "Rina & Dimas",
    projectTitle: "Wedding Rina & Dimas",
    galleryUrl: "https://shutrly.app/g/k7Qm…",
    galleryPassword: "••••••",
    invoiceNumber: "AW-0012",
    invoiceTotal: "Rp 12.500.000",
    invoiceBalance: "Rp 6.250.000",
    invoiceUrl: "https://shutrly.app/i/p3Xz…",
  },
} as const;
