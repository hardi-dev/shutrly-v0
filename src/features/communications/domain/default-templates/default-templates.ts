import type { AppLocale } from "@/shared/locale/locale.types";

import type { TemplateType } from "../template-type/template-type.types";

// Platform default messages, English and Indonesian, copied verbatim from the approved copy deck
// (copy-deck.md §11.4, Owner-reviewed 2026-10-10). Migration 0003 keeps its own frozen copy;
// tests/config/message-template-backfill.test.ts pins it.
export const DEFAULT_TEMPLATE_CONTENT: Readonly<
  Record<AppLocale, Readonly<Record<TemplateType, string>>>
> = {
  en: {
    GALLERY_SHARE:
      "Hi {{clientName}},\n\nYour gallery for {{projectTitle}} from {{brandName}} is ready:\n{{galleryUrl}}\n\nPassword: {{galleryPassword}}\n\nChoose your favorite photos. Thank you!",
    SELECTION_REMINDER:
      "Hi {{clientName}},\n\nA reminder from {{brandName}}: your photo selections for {{projectTitle}} aren’t complete yet.\nContinue choosing here:\n{{galleryUrl}}\n\nThank you!",
    FINAL_DELIVERY:
      "Hi {{clientName}},\n\nYour final photos for {{projectTitle}} from {{brandName}} are ready to download:\n{{galleryUrl}}\n\nPassword: {{galleryPassword}}\n\nThank you for choosing us to capture your moments!",
    INVOICE_SHARE:
      "Hi {{clientName}},\n\nInvoice {{invoiceNumber}} for {{projectTitle}} from {{brandName}} has been issued.\nTotal: {{invoiceTotal}}\n\nView the invoice and payment details:\n{{invoiceUrl}}\n\nThank you!",
    PAYMENT_REMINDER:
      "Hi {{clientName}},\n\nA reminder from {{brandName}}: invoice {{invoiceNumber}} for {{projectTitle}} has an outstanding balance of {{invoiceBalance}}.\n\nView the invoice and payment details:\n{{invoiceUrl}}\n\nThank you!",
  },
  id: {
    GALLERY_SHARE:
      "Halo {{clientName}},\n\nGaleri {{projectTitle}} dari {{brandName}} sudah bisa dibuka:\n{{galleryUrl}}\n\nKata sandi: {{galleryPassword}}\n\nPilih foto favoritmu, ya. Terima kasih!",
    SELECTION_REMINDER:
      "Halo {{clientName}},\n\nPengingat dari {{brandName}}: pilihan foto untuk {{projectTitle}} belum selesai.\nLanjutkan memilih di sini:\n{{galleryUrl}}\n\nTerima kasih!",
    FINAL_DELIVERY:
      "Halo {{clientName}},\n\nHasil akhir {{projectTitle}} dari {{brandName}} sudah siap diunduh:\n{{galleryUrl}}\n\nKata sandi: {{galleryPassword}}\n\nTerima kasih sudah memercayakan momenmu kepada kami!",
    INVOICE_SHARE:
      "Halo {{clientName}},\n\nTagihan {{invoiceNumber}} untuk {{projectTitle}} dari {{brandName}} sudah terbit.\nTotal: {{invoiceTotal}}\n\nLihat tagihan dan informasi pembayaran:\n{{invoiceUrl}}\n\nTerima kasih!",
    PAYMENT_REMINDER:
      "Halo {{clientName}},\n\nPengingat dari {{brandName}}: tagihan {{invoiceNumber}} untuk {{projectTitle}} belum lunas.\nSisa tagihan: {{invoiceBalance}}\n\nLihat tagihan dan informasi pembayaran:\n{{invoiceUrl}}\n\nTerima kasih!",
  },
};
