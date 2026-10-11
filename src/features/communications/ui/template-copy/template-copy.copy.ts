import type {
  TemplateGroup,
  TemplateType,
} from "@/features/communications/domain/template-type/template-type.types";

// Source: copy-deck.md §11 "Message templates and WhatsApp defaults" (§11.1 to §11.3). Copied verbatim.
// ICU quoting: '{{' and '}}' keep the braces literal, so a placeholder such as {{variableName}} is
// written as '{{'{variable}'}}' when the name is an argument, or quoted whole when it is fixed text.
export const TEMPLATE_COPY_NAMESPACE = "messageTemplates";

export const TEMPLATE_COPY = {
  namespace: TEMPLATE_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      pageParent: "Message templates",
      sendNote: "You send each message yourself through WhatsApp.",
      subPageSubtitle: "{purpose} {sendNote}",
      galleryGroupTitle: "Galleries",
      galleryGroupDescription: "For galleries and final photos.",
      invoiceGroupTitle: "Invoices",
      invoiceGroupDescription: "For client invoices.",
      galleryShareLabel: "Share gallery",
      galleryShareBody: "For when the gallery is ready for client selections.",
      selectionReminderLabel: "Selection reminder",
      selectionReminderBody: "Remind clients to finish choosing their photos.",
      finalDeliveryLabel: "Final delivery",
      finalDeliveryBody: "For when final photos are ready to download.",
      invoiceShareLabel: "Share invoice",
      invoiceShareBody: "For when an invoice has been issued.",
      paymentReminderLabel: "Payment reminder",
      paymentReminderBody: "For invoices with an outstanding balance.",
      listLoading: "Loading message templates…",
      contentTitle: "Message content",
      contentDescription:
        "Placeholders are replaced with project details when you prepare a message.",
      mobileTitle: "Message",
      contentLabel: "Message content",
      helper: "Copy variables exactly as shown below, including the double braces.",
      mobileHelper: "Copy variables exactly as shown below.",
      counter: "{length, number} / {max, number}",
      variablesTitle: "Insert project details",
      variablesHint: "Click to insert at the cursor. Required variables must be included.",
      mobileVariablesHint: "Tap to insert at the cursor.",
      requiredMarker: "Required",
      insertVariable: "Insert '{{'{name}'}}'",
      insertRequiredVariable: "Insert '{{'{name}'}}', required",
      viewLabel: "Message view",
      edit: "Edit",
      preview: "Preview",
      previewDescription: "Check how the message reads using sample project details.",
      previewRegion: "Message preview",
      passwordNote: "The gallery password is filled in when you prepare the sharing message.",
      previewError: "Fix the template to see the preview again.",
      restore: "Restore default wording",
      save: "Save",
      saving: "Saving…",
      savedTitle: "Template saved",
      savedBody: "{templateName} will use the updated wording.",
      serverErrorTitle: "Template couldn’t be saved",
      serverErrorBody: "Your message is still here. Try saving again.",
      retry: "Try again",
      unsavedTitle: "Discard your changes?",
      unsavedDescription:
        "Changes to {templateName} haven’t been saved. Leaving will discard them.",
      unsavedMobileDescription: "Changes to {templateName} haven’t been saved.",
      keepEditing: "Keep editing",
      discardChanges: "Discard changes",
      problemEmpty: "Enter a message.",
      problemTooLong: "Use no more than {max, number} characters.",
      problemMalformed:
        "Write variables as '{{variableName}}', without spaces, for example '{{clientName}}'.",
      problemUnknownVariable:
        "'{{'{variable}'}}' isn’t supported in {templateName}. Use a variable from the list below.",
      problemMissingRequired: "Include '{{'{variable}'}}' so the client can open the {target}.",
      targetGallery: "gallery",
      targetInvoice: "invoice",
      problemGeneric: "This message couldn’t be saved. Check its content.",
    },
    id: {
      pageParent: "Templat pesan",
      sendNote: "Kamu tetap mengirim setiap pesan sendiri lewat WhatsApp.",
      subPageSubtitle: "{purpose} {sendNote}",
      galleryGroupTitle: "Galeri",
      galleryGroupDescription: "Untuk galeri dan hasil akhir.",
      invoiceGroupTitle: "Tagihan",
      invoiceGroupDescription: "Untuk tagihan klien.",
      galleryShareLabel: "Bagikan galeri",
      galleryShareBody: "Untuk galeri yang siap dipilih klien.",
      selectionReminderLabel: "Pengingat pilihan foto",
      selectionReminderBody: "Ingatkan klien untuk menyelesaikan pilihan fotonya.",
      finalDeliveryLabel: "Hasil akhir",
      finalDeliveryBody: "Untuk hasil akhir yang siap diunduh.",
      invoiceShareLabel: "Bagikan tagihan",
      invoiceShareBody: "Untuk tagihan yang sudah diterbitkan.",
      paymentReminderLabel: "Pengingat pembayaran",
      paymentReminderBody: "Untuk tagihan yang belum lunas.",
      listLoading: "Memuat templat pesan…",
      contentTitle: "Isi pesan",
      contentDescription: "Penanda diganti dengan data proyek saat kamu menyiapkan pesan.",
      mobileTitle: "Pesan",
      contentLabel: "Isi pesan",
      helper: "Tulis variabel persis seperti di bawah, termasuk kurung kurawal gandanya.",
      mobileHelper: "Tulis variabel persis seperti di bawah.",
      counter: "{length, number} / {max, number}",
      variablesTitle: "Sisipkan data proyek",
      variablesHint: "Klik untuk menyisipkan di posisi kursor. Variabel wajib harus ada di pesan.",
      mobileVariablesHint: "Ketuk untuk menyisipkan di posisi kursor.",
      requiredMarker: "Wajib",
      insertVariable: "Sisipkan '{{'{name}'}}'",
      insertRequiredVariable: "Sisipkan '{{'{name}'}}', wajib",
      viewLabel: "Tampilan pesan",
      edit: "Ubah",
      preview: "Pratinjau",
      previewDescription: "Cek tampilan pesan dengan data proyek contoh.",
      previewRegion: "Pratinjau pesan",
      passwordNote: "Kata sandi galeri terisi saat kamu menyiapkan pesan untuk dibagikan.",
      previewError: "Perbaiki isi templat agar pratinjau muncul lagi.",
      restore: "Kembalikan teks bawaan",
      save: "Simpan",
      saving: "Menyimpan…",
      savedTitle: "Templat disimpan",
      savedBody: "{templateName} akan memakai isi terbaru.",
      serverErrorTitle: "Templat belum tersimpan",
      serverErrorBody: "Isi pesanmu masih ada. Coba simpan lagi.",
      retry: "Coba lagi",
      unsavedTitle: "Buang perubahanmu?",
      unsavedDescription:
        "Perubahan pada {templateName} belum disimpan. Kalau keluar, perubahannya akan hilang.",
      unsavedMobileDescription: "Perubahan pada {templateName} belum disimpan.",
      keepEditing: "Lanjut mengedit",
      discardChanges: "Buang perubahan",
      problemEmpty: "Isi pesan.",
      problemTooLong: "Gunakan maksimal {max, number} karakter.",
      problemMalformed:
        "Tulis variabel sebagai '{{variableName}}' tanpa spasi, misalnya '{{clientName}}'.",
      problemUnknownVariable:
        "'{{'{variable}'}}' tidak bisa dipakai di {templateName}. Pilih variabel dari daftar di bawah.",
      problemMissingRequired: "Sertakan '{{'{variable}'}}' agar klien bisa membuka {target}.",
      targetGallery: "galeri",
      targetInvoice: "tagihan",
      problemGeneric: "Pesan ini belum bisa disimpan. Cek isinya.",
    },
  },
} as const;

/** The list label and purpose of each template type (deck §11.1). */
export const TEMPLATE_LABEL_MESSAGE_KEY = {
  GALLERY_SHARE: "galleryShareLabel",
  SELECTION_REMINDER: "selectionReminderLabel",
  FINAL_DELIVERY: "finalDeliveryLabel",
  INVOICE_SHARE: "invoiceShareLabel",
  PAYMENT_REMINDER: "paymentReminderLabel",
} as const satisfies Record<TemplateType, string>;

export const TEMPLATE_PURPOSE_MESSAGE_KEY = {
  GALLERY_SHARE: "galleryShareBody",
  SELECTION_REMINDER: "selectionReminderBody",
  FINAL_DELIVERY: "finalDeliveryBody",
  INVOICE_SHARE: "invoiceShareBody",
  PAYMENT_REMINDER: "paymentReminderBody",
} as const satisfies Record<TemplateType, string>;

/** The place a missing required link is named in: the gallery or the invoice (deck §11.3). */
export const TEMPLATE_PROBLEM_TARGET_KEY = {
  GALLERY: "targetGallery",
  INVOICE: "targetInvoice",
} as const satisfies Record<TemplateGroup, string>;

/** The group card title and description of the list (deck §11.1). */
export const TEMPLATE_GROUP_MESSAGE_KEY = {
  GALLERY: { title: "galleryGroupTitle", description: "galleryGroupDescription" },
  INVOICE: { title: "invoiceGroupTitle", description: "invoiceGroupDescription" },
} as const satisfies Record<
  TemplateGroup,
  { readonly title: string; readonly description: string }
>;
