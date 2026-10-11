// Preview sample data (A-6). Identities and links stay unchanged in both languages (deck §11.2); the
// real brand name replaces brandName, and the password is always masked (BR-MSG-003).
// The timestamp is sample data too: its locale and time policy is not agreed yet.
export const PREVIEW_TIME = "10.24";

export const PREVIEW_SAMPLE = {
  clientName: "Rina & Dimas",
  projectTitle: "Wedding Rina & Dimas",
  galleryUrl: "https://shutrly.app/g/k7Qm…",
  galleryPassword: "••••••",
  invoiceNumber: "AW-0012",
  invoiceTotal: "Rp 12.500.000",
  invoiceBalance: "Rp 6.250.000",
  invoiceUrl: "https://shutrly.app/i/p3Xz…",
} as const;
