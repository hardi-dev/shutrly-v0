// Source: copy-deck.md §14.2 "Client selections" (submitting, usage and allowance wording); the rest has no deck row yet. Rows marked PROPOSED are listed in copy-deck.md §14.4.
export const REVIEW_SCREEN_COPY_NAMESPACE = "reviewScreen";

export const REVIEW_COPY = {
  namespace: REVIEW_SCREEN_COPY_NAMESPACE,
  surface: "gallery",
  messages: {
    en: {
      // PROPOSED (pending Owner review)
      title: "Review {name}",
      // PROPOSED (pending Owner review)
      subtitle: "Check your picks. Once sent, they can’t be changed.",
      // PROPOSED (pending Owner review): the read-only view of a sent group
      subtitleSubmitted:
        "Your picks are sent and waiting for your photographer. They can’t be changed.",
      // PROPOSED (pending Owner review): a group the photographer locked
      subtitleLocked: "Your photographer has locked these picks. They can’t be changed.",
      // PROPOSED (pending Owner review)
      breadcrumbCurrent: "Review",
      // PROPOSED (pending Owner review)
      backToPick: "Back to picking",
      // PROPOSED (pending Owner review)
      cardTitle: "Your picks",
      // PROPOSED (pending Owner review)
      cardMetaCount: "{picks, plural, one {# photo} other {# photos}}",
      // PROPOSED (pending Owner review)
      cardMetaQuantity:
        "{picks, plural, one {# photo} other {# photos}} · {usage} {unit}. Set the print count for each photo.",
      // PROPOSED (pending Owner review): the read-only view of a print group
      cardMetaQuantityReadOnly: "{picks, plural, one {# photo} other {# photos}} · {usage} {unit}",
      // PROPOSED (pending Owner review)
      addMore: "Add more photos",
      // PROPOSED (pending Owner review)
      send: "Send {usage} {unit}",
      // PROPOSED (pending Owner review)
      sendEmpty: "Send",
      sending: "Submitting…",
      // PROPOSED (pending Owner review)
      emptyTitle: "No photos picked yet",
      // PROPOSED (pending Owner review): the export's wording names the group's purpose
      emptyBody: "Go back to {name} and tap photos to pick them.",
      // PROPOSED (pending Owner review): a picked photo that went missing, shown so it can be removed
      missingMeta: "Photo unavailable. Remove it from your picks.",
      // PROPOSED (pending Owner review)
      quantityReadOnly: "× {quantity}",
      // PROPOSED (pending Owner review)
      sentToastTitle: "{name} sent",
      // PROPOSED (pending Owner review)
      sentToastBody: "Your photographer will see your picks.",
      // PROPOSED (pending Owner review): a send below the limit keeps the group open
      sentToastBodyOpen:
        "Your photographer will see your picks. {remaining, plural, one {# place} other {# places}} can still be picked.",
      // PROPOSED (pending Owner review)
      groupClosed: "Picks already sent",
      // PROPOSED (pending Owner review)
      limitReached: "Pick limit reached",
      // PROPOSED (pending Owner review)
      rateLimited: "Too many changes. Try again in a moment.",
      // PROPOSED (pending Owner review)
      failed: "The picks weren’t saved. Try again.",
      // PROPOSED (pending Owner review)
      sendFailed: "The picks weren’t sent. Try again.",
      // PROPOSED (pending Owner review): the places left stay open after a send
      confirmTitle: "Send {name} picks?",
      // PROPOSED (pending Owner review)
      confirmDescription: "The places left stay open after you send.",
      // PROPOSED (pending Owner review)
      confirmBody:
        "You’ve picked {usage} of {limit} {unit}. {remaining} places are still open, and you can change your picks until your photographer locks them.",
      // PROPOSED (pending Owner review)
      confirmBack: "Pick more",
      // PROPOSED (pending Owner review)
      noteTitle: "Note for your photographer",
      // PROPOSED (pending Owner review)
      noteEdit: "Edit note",
      // PROPOSED (pending Owner review)
      noteAdd: "Add note",
      // PROPOSED (pending Owner review)
      remove: "Remove {fileName}",
      // PROPOSED (pending Owner review)
      quantityLabel: "Quantity for {fileName}",
      folderSeparator: " › ",
    },
    id: {
      title: "Tinjau {name}",
      subtitle: "Periksa pilihan Anda. Setelah dikirim, pilihan tidak bisa diubah.",
      subtitleSubmitted:
        "Pilihan sudah dikirim dan menunggu fotografer. Pilihan tidak bisa diubah.",
      subtitleLocked: "Pilihan sudah dikunci fotografer. Pilihan tidak bisa diubah.",
      breadcrumbCurrent: "Tinjau",
      backToPick: "Kembali memilih",
      cardTitle: "Pilihan Anda",
      cardMetaCount: "{picks, plural, other {# foto}}",
      cardMetaQuantity:
        "{picks, plural, other {# foto}} · {usage} {unit}. Atur jumlah cetak tiap foto.",
      cardMetaQuantityReadOnly: "{picks, plural, other {# foto}} · {usage} {unit}",
      addMore: "Tambah foto lagi",
      send: "Kirim {usage} {unit}",
      sendEmpty: "Kirim",
      sending: "Mengirim…",
      emptyTitle: "Belum ada foto dipilih",
      emptyBody: "Kembali ke {name} dan ketuk foto untuk memilih.",
      missingMeta: "Foto tidak tersedia. Hapus dari pilihan Anda.",
      quantityReadOnly: "× {quantity}",
      sentToastTitle: "{name} dikirim",
      sentToastBody: "Fotografer akan melihat pilihan Anda.",
      sentToastBodyOpen:
        "Fotografer akan melihat pilihan Anda. Sisa {remaining, plural, other {# tempat}} masih bisa Anda pilih.",
      groupClosed: "Pilihan sudah dikirim",
      limitReached: "Batas pilihan tercapai",
      rateLimited: "Terlalu banyak perubahan, coba lagi sebentar.",
      failed: "Pilihan belum tersimpan. Coba lagi.",
      sendFailed: "Pilihan belum terkirim. Coba lagi.",
      confirmTitle: "Kirim pilihan {name}?",
      confirmDescription: "Sisa tempat tetap terbuka setelah dikirim.",
      confirmBody:
        "Anda baru memilih {usage} dari {limit} {unit}. {remaining} tempat sisanya tetap terbuka, dan pilihan masih bisa diubah sampai fotografer menguncinya.",
      confirmBack: "Pilih lagi",
      noteTitle: "Catatan untuk fotografer",
      noteEdit: "Ubah catatan",
      noteAdd: "Tambah catatan",
      remove: "Hapus {fileName}",
      quantityLabel: "Jumlah {fileName}",
      folderSeparator: " › ",
    },
  },
} as const;

export { CLIENT_COPY_NAMESPACE as REVIEW_SHARED_NAMESPACE } from "../client-copy/client-copy.copy";
