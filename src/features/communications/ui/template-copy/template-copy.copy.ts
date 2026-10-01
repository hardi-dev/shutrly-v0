import type {
  TemplateGroup,
  TemplateType,
} from "@/features/communications/domain/template-type/template-type.types";

// Labels and purpose lines (A-5), from the v3 frames (exports/list-L9tLQ.html).
export const TEMPLATE_COPY = {
  GALLERY_SHARE: { label: "Bagikan gallery", purpose: "Dikirim saat gallery siap dipilih klien." },
  SELECTION_REMINDER: {
    label: "Pengingat seleksi",
    purpose: "Mengingatkan klien menyelesaikan pilihan foto.",
  },
  FINAL_DELIVERY: { label: "Hasil akhir", purpose: "Dikirim saat foto akhir siap diunduh." },
  INVOICE_SHARE: { label: "Bagikan invoice", purpose: "Dikirim saat invoice diterbitkan." },
  PAYMENT_REMINDER: {
    label: "Pengingat pembayaran",
    purpose: "Dikirim saat invoice masih punya sisa tagihan.",
  },
} as const satisfies Record<TemplateType, { label: string; purpose: string }>;

export const TEMPLATE_GROUP_COPY = {
  GALLERY: { title: "Gallery", description: "Untuk gallery dan foto akhir." },
  INVOICE: { title: "Invoice", description: "Untuk tagihan klien." },
} as const satisfies Record<TemplateGroup, { title: string; description: string }>;

export const TEMPLATE_PAGE_COPY = {
  parent: "Template pesan",
  sendNote: "Kamu tetap mengirimnya sendiri dari WhatsApp.",
} as const;
