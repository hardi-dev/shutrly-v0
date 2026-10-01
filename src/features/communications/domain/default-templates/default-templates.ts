import type { TemplateType } from "../template-type/template-type.types";

// A-10 platform defaults (Indonesian). GALLERY_SHARE is the approved design copy; the others follow
// its pattern (Owner 2026-10-01: "fix it for me based on your recommendation"). Migration 0003
// repeats these strings; a test in tests/config keeps them equal.
export const DEFAULT_TEMPLATE_CONTENT: Readonly<Record<TemplateType, string>> = {
  GALLERY_SHARE:
    "Halo {{clientName}},\n\nGallery untuk {{projectTitle}} dari {{brandName}} sudah bisa dibuka:\n{{galleryUrl}}\n\nPassword: {{galleryPassword}}\n\nSilakan pilih foto favoritmu. Terima kasih!",
  SELECTION_REMINDER:
    "Halo {{clientName}},\n\nPengingat dari {{brandName}}: pilihan foto untuk {{projectTitle}} belum selesai. Lanjutkan memilih di sini:\n{{galleryUrl}}\n\nTerima kasih!",
  FINAL_DELIVERY:
    "Halo {{clientName}},\n\nFoto akhir {{projectTitle}} dari {{brandName}} sudah siap diunduh:\n{{galleryUrl}}\n\nPassword: {{galleryPassword}}\n\nTerima kasih sudah memercayakan momenmu kepada kami!",
  INVOICE_SHARE:
    "Halo {{clientName}},\n\nInvoice {{invoiceNumber}} untuk {{projectTitle}} dari {{brandName}} sudah terbit.\nTotal: {{invoiceTotal}}\n\nLihat dan bayar invoice di sini:\n{{invoiceUrl}}\n\nTerima kasih!",
  PAYMENT_REMINDER:
    "Halo {{clientName}},\n\nPengingat dari {{brandName}}: invoice {{invoiceNumber}} untuk {{projectTitle}} masih memiliki sisa tagihan {{invoiceBalance}}.\n\nDetail dan pembayaran:\n{{invoiceUrl}}\n\nTerima kasih!",
};
