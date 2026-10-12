// Source: copy-deck.md §16 "Add-ons" and §5.7 "Platform-owned default items" (the default unit). Copied
// verbatim. Rows the deck does not cover keep the same text in both languages and are marked DECK GAP.
export const ADD_ON_COPY_NAMESPACE = "bookingAddOn";

export const ADD_ON_COPY = {
  namespace: ADD_ON_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      cardTitle: "Add-on",
      cardDescription: "Extra requested by the client.",
      add: "Add add-on",
      empty: "No add-ons yet. Add one when the client requests extra photos or services.",
      lockedNote:
        "{names} is locked, so the add-on can’t increase its limit. Add-ons without a group can still be created.",
      noGroup: "No group",
      meta: "{group} · {quantity} × {unitPrice} = {total}",
      statusDraft: "Draft",
      statusApproved: "Approved",
      statusCancelled: "Cancelled",
      actionsLabel: "Actions for {description}",
      approve: "Approve",
      deleteDraft: "Delete draft",
      cancelAddOn: "Cancel add-on",
      sheetMeta: "{status} · {total}",
      formTitle: "Add an add-on",
      formDescription: "An add-on increases the client’s selection limit after approval.",
      descriptionLabel: "Description",
      // DECK GAP: no deck row for the description placeholder.
      descriptionPlaceholder: "Contoh: Tambahan 5 foto edit",
      descriptionHelper: "Shown in the add-on list, not to the client.",
      // DECK GAP: no deck row for the target-group label.
      targetLabel: "Tambah ke grup",
      targetHelper: "This group’s limit increases after approval.",
      quantityLabel: "Quantity",
      quantityHelper: "Whole-number quantity.",
      priceLabel: "Unit price",
      pricePrefix: "Rp",
      priceHelper: "Full rupiah amount.",
      totalLabel: "Total",
      formCancel: "Cancel",
      saveDraft: "Save draft",
      // DECK GAP: no deck rows for the toasts; the same text is used in both languages.
      draftSavedTitle: "Draf add-on disimpan",
      approvedTitle: "Add-on disetujui",
      cancelledTitle: "Add-on dibatalkan",
      deletedTitle: "Draf add-on dihapus",
      projectStatusTitle: "Proyek ini tidak bisa diberi add-on.",
      addOnStatusTitle: "Add-on ini sudah berubah. Muat ulang halaman.",
      targetLockedTitle: "Grup sudah dikunci, add-on tidak bisa disetujui.",
      failedTitle: "Gagal menyimpan. Coba lagi.",
      approveTitle: "Approve this add-on?",
      approveDescription: "{description} · {total}",
      approveLimit: "The {group} limit increases from {from} to {to}.",
      approveReopen: "Submitted selections reopen so the client can add photos and send again.",
      approveNoInvoice: "No invoice has been created.",
      approveConfirm: "Approve",
      cancelTitle: "Cancel this add-on?",
      // DECK GAP: no deck row for the cancel description with its approval date.
      cancelDescription: "{description} · disetujui {date}",
      cancelLimit:
        "The {group} limit drops from {from} to {to}. Cancellation is refused if the client selected more than {to} {unit}.",
      cancelNoGroup: "This add-on does not change the client’s selection limit.",
      cancelBack: "Back",
      cancelConfirm: "Cancel add-on",
      refusedTitle: "Add-on can’t be cancelled",
      refusedDescription: "The limit would be lower than the client’s selections.",
      // DECK GAP: the deck row has no usage numbers; AC-ADD-005 requires them, so the first two
      // sentences carry the usage and the deck sentence follows.
      refusedBody:
        "The client has selected {usage} {unit}. Cancelling this add-on lowers the limit to {limit}. Ask the client to remove photos first.",
      // DECK GAP: no deck row for the refusal confirm button.
      refusedConfirm: "Mengerti",
      defaultUnit: "photos",
      // DECK GAP: no deck row for the generic fallback error.
      fieldGeneric: "Isi nilai yang valid.",
      descriptionEmpty: "Description is required.",
      // DECK GAP: no deck row for the description length limit.
      descriptionTooLong: "Deskripsi maksimal 100 karakter.",
      quantityMinimum: "Quantity must be at least 1 and a whole number.",
      // DECK GAP: no deck rows for the remaining quantity messages.
      quantityNotWhole: "Jumlah harus bilangan bulat.",
      quantityTooLarge: "Jumlah maksimal 9.999.",
      quantityInvalid: "Enter a valid number.",
      unitPriceEmpty: "Isi harga satuan.",
      unitPriceNegative: "Harga tidak boleh negatif.",
      unitPriceNotWhole: "Harga dalam rupiah bulat, tanpa koma.",
      unitPriceTooLarge: "Total maksimal Rp 999.999.999.999.",
      unitPriceInvalid: "Enter a valid price in whole rupiah.",
      targetLocked: "This group is locked. Choose another group or no group.",
      // DECK GAP: no deck row for the unknown-group message.
      targetNotOption: "Pilih grup dari daftar.",
    },
    id: {
      cardTitle: "Add-on",
      cardDescription: "Tambahan yang klien minta.",
      add: "Tambah add-on",
      empty: "Belum ada add-on. Tambahkan saat klien minta foto atau layanan ekstra.",
      lockedNote:
        "{names} sudah dikunci, jadi add-on tidak bisa menambah batasnya. Add-on tanpa grup tetap bisa dibuat.",
      noGroup: "Tanpa grup",
      meta: "{group} · {quantity} × {unitPrice} = {total}",
      statusDraft: "Draf",
      statusApproved: "Disetujui",
      statusCancelled: "Dibatalkan",
      actionsLabel: "Tindakan untuk {description}",
      approve: "Setujui",
      deleteDraft: "Hapus draf",
      cancelAddOn: "Batalkan add-on",
      sheetMeta: "{status} · {total}",
      formTitle: "Tambah add-on",
      formDescription: "Add-on menambah batas pilihan klien setelah disetujui.",
      descriptionLabel: "Deskripsi",
      descriptionPlaceholder: "Contoh: Tambahan 5 foto edit",
      descriptionHelper: "Tampil di daftar add-on, tidak untuk klien.",
      targetLabel: "Tambah ke grup",
      targetHelper: "Batas grup ini naik setelah add-on disetujui.",
      quantityLabel: "Jumlah",
      quantityHelper: "Bilangan bulat.",
      priceLabel: "Harga satuan",
      pricePrefix: "Rp",
      priceHelper: "Rupiah penuh.",
      totalLabel: "Total",
      formCancel: "Batal",
      saveDraft: "Simpan draf",
      draftSavedTitle: "Draf add-on disimpan",
      approvedTitle: "Add-on disetujui",
      cancelledTitle: "Add-on dibatalkan",
      deletedTitle: "Draf add-on dihapus",
      projectStatusTitle: "Proyek ini tidak bisa diberi add-on.",
      addOnStatusTitle: "Add-on ini sudah berubah. Muat ulang halaman.",
      targetLockedTitle: "Grup sudah dikunci, add-on tidak bisa disetujui.",
      failedTitle: "Gagal menyimpan. Coba lagi.",
      approveTitle: "Setujui add-on?",
      approveDescription: "{description} · {total}",
      approveLimit: "Batas {group} naik dari {from} menjadi {to}.",
      approveReopen:
        "Pilihan yang sudah dikirim dibuka lagi supaya klien bisa menambah foto dan mengirim ulang.",
      approveNoInvoice: "Belum ada invoice dibuat.",
      approveConfirm: "Setujui",
      cancelTitle: "Batalkan add-on?",
      cancelDescription: "{description} · disetujui {date}",
      cancelLimit:
        "Batas {group} turun dari {from} menjadi {to}. Pembatalan ditolak jika klien sudah memilih lebih dari {to} {unit}.",
      cancelNoGroup: "Add-on ini tidak mengubah batas pilihan klien.",
      cancelBack: "Kembali",
      cancelConfirm: "Batalkan add-on",
      refusedTitle: "Add-on belum bisa dibatalkan",
      refusedDescription: "Batas akan lebih kecil dari pilihan klien.",
      refusedBody:
        "Klien sudah memilih {usage} {unit}. Jika add-on ini dibatalkan, batas turun menjadi {limit}. Minta klien melepas foto lebih dulu.",
      refusedConfirm: "Mengerti",
      defaultUnit: "foto",
      fieldGeneric: "Isi nilai yang valid.",
      descriptionEmpty: "Deskripsi wajib diisi.",
      descriptionTooLong: "Deskripsi maksimal 100 karakter.",
      quantityMinimum: "Jumlah minimal 1 dan harus bilangan bulat.",
      quantityNotWhole: "Jumlah harus bilangan bulat.",
      quantityTooLarge: "Jumlah maksimal 9.999.",
      quantityInvalid: "Isi angka yang valid.",
      unitPriceEmpty: "Isi harga satuan.",
      unitPriceNegative: "Harga tidak boleh negatif.",
      unitPriceNotWhole: "Harga dalam rupiah bulat, tanpa koma.",
      unitPriceTooLarge: "Total maksimal Rp 999.999.999.999.",
      unitPriceInvalid: "Isi harga yang valid dalam rupiah bulat.",
      targetLocked: "Grup ini sudah dikunci. Pilih grup lain atau tanpa grup.",
      targetNotOption: "Pilih grup dari daftar.",
    },
  },
} as const;

/** Field-error keys from the server mapped to the flat message keys (AC-ADD-006). */
export const ADD_ON_FIELD_ERROR_MESSAGE_KEY: Readonly<
  Partial<Record<string, Readonly<Partial<Record<string, string>>>>>
> = {
  description: {
    EMPTY: "descriptionEmpty",
    TOO_LONG: "descriptionTooLong",
  },
  quantity: {
    TOO_SMALL: "quantityMinimum",
    EMPTY: "quantityMinimum",
    NOT_WHOLE: "quantityNotWhole",
    TOO_LARGE: "quantityTooLarge",
    INVALID: "quantityInvalid",
  },
  unitPrice: {
    EMPTY: "unitPriceEmpty",
    NEGATIVE: "unitPriceNegative",
    NOT_WHOLE: "unitPriceNotWhole",
    TOO_LARGE: "unitPriceTooLarge",
    INVALID: "unitPriceInvalid",
  },
  selectionGroupId: {
    TARGET_LOCKED: "targetLocked",
    NOT_AN_OPTION: "targetNotOption",
  },
};

/** Stored add-on statuses mapped to their message keys. */
export const ADD_ON_STATUS_MESSAGE_KEY = {
  DRAFT: "statusDraft",
  APPROVED: "statusApproved",
  CANCELLED: "statusCancelled",
} as const;
