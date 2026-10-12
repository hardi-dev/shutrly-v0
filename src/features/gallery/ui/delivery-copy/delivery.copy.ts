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
      publish: "Publish final files",
      complete: "Mark complete",
      noFilesNote:
        "No final files have synced yet. Create and map the Drive final-file subfolder, then sync the gallery.",
      inactiveNote: "The gallery must be published before the client can open final files.",
      // PROPOSED (pending Owner review): the item counts of the readiness rows.
      itemCount: "{count, plural, one {# file} other {# files}}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      itemFiles: "{count, plural, one {# file} other {# files}} {name}",
      and: " and ",
      // PROPOSED (pending Owner review): the published and completed rows.
      publishedTitle: "Published {when}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      publishedMeta: "The client can download {files}.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      completedTitle: "Completed {when}",
      completedMeta: "The gallery stays open while it remains published.",
      // PROPOSED (pending Owner review): the status chips; PUBLISHED reuses the gallery status row (§10.1).
      chipReady: "Ready",
      chipPublished: "Published",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      chipCompleted: "Completed",
      // PROPOSED (pending Owner review): the project header of a delivered project.
      headerMeta: "Final files published {when}",
      // PROPOSED (pending Owner review): the publish dialog title; the description and body are deck rows.
      publishTitle: "Publish final files?",
      publishDescription: "The client can download through the same link and password.",
      publishBody: "The project becomes Delivered.",
      publishConfirm: "Publish final files",
      // PROPOSED (pending Owner review): the complete dialog.
      completeTitle: "Mark the project complete?",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      completeDescription: "Project {title} will be marked Completed.",
      completeBody: "The gallery stays open while it remains published.",
      // PROPOSED (pending Owner review): the refusal dialog; the reasons use deck readiness rows where they exist.
      refusedTitle: "Final files can’t be published yet",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      refusedDescription: "Check the following first.",
      reasonNoFinishedFile: "No final files have synced yet.",
      reasonGalleryNotPublished:
        "The gallery must be published before the client can open final files.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      reasonProjectStatus: "This project’s status can’t be changed to Delivered.",
      refusedConfirm: "Got it",
      // PROPOSED (pending Owner review): the toasts after each action.
      publishedToast: "Final files published",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      completedToast: "Project marked complete",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      staleToast: "The project status has changed. Reload the page.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      failedToast: "Couldn’t save. Try again.",
    },
    id: {
      cardTitle: "Hasil akhir",
      cardDescription: "Unduhan untuk klien.",
      publish: "Publikasikan hasil akhir",
      complete: "Tandai selesai",
      noFilesNote:
        "Belum ada hasil akhir yang tersinkron. Buat subfolder hasil akhir di Drive, petakan ke item paket lewat Edit folder, lalu sinkronkan galeri.",
      inactiveNote: "Galeri harus dipublikasikan lebih dulu supaya klien bisa membuka hasil akhir.",
      itemCount: "{count, plural, other {# file}}",
      itemFiles: "{count, plural, other {# file}} {name}",
      and: " dan ",
      publishedTitle: "Dipublikasikan {when}",
      publishedMeta: "Klien bisa mengunduh {files}.",
      completedTitle: "Selesai {when}",
      completedMeta: "Galeri tetap terbuka selama masih dipublikasikan.",
      chipReady: "Siap",
      chipPublished: "Dipublikasikan",
      chipCompleted: "Selesai",
      headerMeta: "Hasil akhir dipublikasikan {when}",
      publishTitle: "Publikasikan hasil akhir?",
      publishDescription: "Klien bisa mengunduh lewat link dan password yang sama.",
      publishBody: "Status proyek menjadi Terkirim.",
      publishConfirm: "Publikasikan hasil akhir",
      completeTitle: "Tandai proyek selesai?",
      completeDescription: "Proyek {title} akan berstatus Selesai.",
      completeBody: "Galeri tetap terbuka selama masih dipublikasikan.",
      refusedTitle: "Hasil akhir belum bisa dipublikasikan",
      refusedDescription: "Periksa hal berikut lebih dulu.",
      reasonNoFinishedFile: "Belum ada hasil akhir yang tersinkron.",
      reasonGalleryNotPublished:
        "Galeri harus dipublikasikan lebih dulu supaya klien bisa membuka hasil akhir.",
      reasonProjectStatus: "Status proyek ini tidak bisa diubah menjadi Terkirim.",
      refusedConfirm: "Mengerti",
      publishedToast: "Hasil akhir dipublikasikan",
      completedToast: "Proyek ditandai selesai",
      staleToast: "Status proyek sudah berubah. Muat ulang halaman.",
      failedToast: "Gagal menyimpan. Coba lagi.",
    },
  },
} as const;
