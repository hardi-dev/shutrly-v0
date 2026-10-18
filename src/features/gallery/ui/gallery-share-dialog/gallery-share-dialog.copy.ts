// Source: copy-draft.md › Iteration 6 (galleryShare rows, AC-GFL-021 to 025), Owner-approved; copy-deck.md §10.9 is to be added. Copied verbatim.
export const GALLERY_SHARE_DIALOG_COPY_NAMESPACE = "galleryShare";

export const GALLERY_SHARE_DIALOG_COPY = {
  namespace: GALLERY_SHARE_DIALOG_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: {
      title: "Send link to client",
      description:
        "Check the message, then send it from WhatsApp. Shutrly doesn’t send anything itself.",
      recipientLabel: "To",
      recipientValue: "{name} · {phone}",
      recipientNoNumber: "{name} · no WhatsApp number",
      passwordNote:
        "The gallery password is in this message. Anyone who gets it can open the gallery.",
      editTemplate: "Edit template",
      copyMessage: "Copy message",
      copiedTitle: "Message copied",
      copiedBody: "Paste it into WhatsApp.",
      copyFailed: "Couldn’t copy the message. Copy it from the message box.",
      openWhatsapp: "Open WhatsApp",
      noNumberTitle: "{name} doesn’t have a WhatsApp number yet",
      noNumberBody:
        "Add a number in the client’s details to open WhatsApp. You can still copy the message.",
      addNumber: "Add WhatsApp number",
      loading: "Preparing the message…",
      errorTitle: "The gallery link can’t be sent yet",
      errorBody: "Try again in a moment. The gallery can’t be shared right now.",
      close: "Close",
    },
    id: {
      title: "Kirim link ke klien",
      description:
        "Periksa pesannya, lalu kirim dari WhatsApp. Shutrly tidak mengirim apa pun sendiri.",
      recipientLabel: "Kepada",
      recipientValue: "{name} · {phone}",
      recipientNoNumber: "{name} · belum ada nomor WhatsApp",
      passwordNote:
        "Kata sandi galeri ikut di pesan ini. Siapa pun yang menerima pesan ini bisa membuka galeri.",
      editTemplate: "Ubah template",
      copyMessage: "Salin pesan",
      copiedTitle: "Pesan disalin",
      copiedBody: "Tempel di WhatsApp.",
      copyFailed: "Pesan tidak bisa disalin. Salin manual dari kotak pesan.",
      openWhatsapp: "Buka WhatsApp",
      noNumberTitle: "{name} belum punya nomor WhatsApp",
      noNumberBody:
        "Tambahkan nomor di data klien untuk membuka WhatsApp. Kamu tetap bisa menyalin pesannya.",
      addNumber: "Tambah nomor WhatsApp",
      loading: "Menyiapkan pesan…",
      errorTitle: "Link galeri belum bisa dikirim",
      errorBody: "Coba lagi sebentar lagi. Galeri belum bisa dibagikan saat ini.",
      close: "Tutup",
    },
  },
} as const;
