import type { TemplateType } from "../template-type/template-type.types";

// A-10 platform defaults (Indonesian). GALLERY_SHARE is the approved design copy; the others
// were reviewed by the Owner before migration 0003, which repeats these strings (a test in
// tests/config keeps them equal).
export const DEFAULT_TEMPLATE_CONTENT: Readonly<Record<TemplateType, string>> = {
  GALLERY_SHARE:
    "Halo {{clientName}},\n\nGallery untuk {{projectTitle}} dari {{brandName}} sudah bisa dibuka:\n{{galleryUrl}}\n\nPassword: {{galleryPassword}}\n\nSilakan pilih foto favoritmu. Terima kasih!",
  SELECTION_REMINDER:
    "Halo {{clientName}}, pengingat dari {{brandName}}: pilihan foto untuk {{projectTitle}} belum selesai.\n\nLanjutkan memilih di sini:\n{{galleryUrl}}\n\nTerima kasih!",
  FINAL_DELIVERY:
    "Halo {{clientName}}, foto akhir {{projectTitle}} sudah siap diunduh di gallery yang sama:\n{{galleryUrl}}\n\nPassword: {{galleryPassword}}\n\nTerima kasih sudah memercayakan momenmu kepada {{brandName}}!",
  INVOICE_SHARE:
    "Halo {{clientName}}, invoice {{invoiceNumber}} untuk {{projectTitle}} sudah terbit.\n\nTotal: {{invoiceTotal}}\nLihat invoice di sini:\n{{invoiceUrl}}\n\nTerima kasih,\n{{brandName}}",
  PAYMENT_REMINDER:
    "Halo {{clientName}}, pengingat dari {{brandName}}: invoice {{invoiceNumber}} masih memiliki sisa tagihan {{invoiceBalance}}.\n\nDetail dan pembayaran:\n{{invoiceUrl}}\n\nTerima kasih!",
};
