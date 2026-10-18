// Source: copy-deck.md §15 "Delivery card", "Delivery readiness" and "Publish/complete consequence"; §10.1 for the Published status. Copied verbatim.
// Rows marked PROPOSED have no deck row yet; they are listed in copy-deck.md §15.x for Owner review.
export const DELIVERY_COPY_NAMESPACE = "ownerDelivery";

export const DELIVERY_COPY = {
  namespace: DELIVERY_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      cardTitle: "Final files",
      cardDescription: "Downloads for the client.",
      complete: "Mark as delivered",
      noFilesNote:
        "No final files have synced yet. Create and map the Drive final-file subfolder, then sync the gallery.",
      // PROPOSED (pending Owner review): the item counts of the readiness rows.
      itemCount: "{count, plural, one {# file} other {# files}}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      itemFiles: "{count, plural, one {# file} other {# files}} {name}",
      and: " and ",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      completedTitle: "Delivered {when}",
      completedMeta: "The gallery stays open while it remains published.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      chipCompleted: "Completed",
      // PROPOSED (pending Owner review): the project header of a delivered project.
      headerMeta: "Final files published {when}",
      // PROPOSED (pending Owner review): the complete dialog.
      completeTitle: "Mark this project as delivered?",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      completeDescription: "Project {title} will be marked Delivered.",
      completeBody: "The client can still open the gallery.",
      reasonNoFinishedFile: "No final files are synced yet.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      reasonProjectStatus: "This project’s status can’t be changed to Delivered.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      completedToast: "Project marked as delivered",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      staleToast: "The project status has changed. Reload the page.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      failedToast: "Couldn’t save. Try again.",
      emptyNote:
        "No final files are synced yet. Create a final-files subfolder in Drive, map it to a package item in Edit folder, then sync the gallery.",
      deliveredStatus: "Delivered",
      deliveredRowTitle: "Delivered {when} · {edited} edited photos · {print} print photos",
      readyStatus: "Ready to download",
      readyRowMeta: "{edited} edited photos · {print} print photos · visible to the client",
      refusedCompleteTitle: "This project can’t be marked as delivered yet",
      completeDisabledHint: "No final files are synced yet. Sync the final-files folder first.",
      completeConfirm: "Mark as delivered",
    },
    id: {
      cardTitle: "Hasil akhir",
      cardDescription: "Unduhan untuk klien.",
      complete: "Tandai terkirim",
      noFilesNote:
        "Belum ada hasil akhir yang tersinkron. Buat subfolder hasil akhir di Drive, petakan ke item paket lewat Edit folder, lalu sinkronkan galeri.",
      itemCount: "{count, plural, other {# file}}",
      itemFiles: "{count, plural, other {# file}} {name}",
      and: " dan ",
      completedTitle: "Terkirim {when}",
      completedMeta: "Galeri tetap terbuka selama masih dipublikasikan.",
      chipCompleted: "Selesai",
      headerMeta: "Hasil akhir dipublikasikan {when}",
      completeTitle: "Tandai proyek terkirim?",
      completeDescription: "Proyek {title} akan berstatus Terkirim.",
      completeBody: "Galeri tetap bisa dibuka klien.",
      reasonNoFinishedFile: "Belum ada hasil akhir yang tersinkron.",
      reasonProjectStatus: "Status proyek ini tidak bisa diubah menjadi Terkirim.",
      completedToast: "Proyek ditandai terkirim",
      staleToast: "Status proyek sudah berubah. Muat ulang halaman.",
      failedToast: "Gagal menyimpan. Coba lagi.",
      emptyNote:
        "Belum ada hasil akhir yang tersinkron. Buat subfolder hasil akhir di Drive, petakan ke item paket lewat Edit folder, lalu sinkronkan galeri.",
      deliveredStatus: "Terkirim",
      deliveredRowTitle: "Terkirim {when} · {edited} Foto edit · {print} Foto cetak",
      readyStatus: "Siap diunduh",
      readyRowMeta: "{edited} Foto edit · {print} Foto cetak · terlihat oleh klien",
      refusedCompleteTitle: "Proyek belum bisa ditandai terkirim",
      completeDisabledHint:
        "Belum ada hasil akhir yang tersinkron. Sinkronkan folder hasil akhir dulu.",
      completeConfirm: "Tandai terkirim",
    },
  },
} as const;
