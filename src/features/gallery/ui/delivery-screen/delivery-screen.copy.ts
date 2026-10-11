// Source: copy-deck.md §14.3 "Final delivery — built delivery feature" (heading, lead, groups, download, load failure). Copied verbatim.
// Rows marked PROPOSED have no deck row yet (bulk download, progress and viewer text); they are listed in copy-deck.md §14.3.x for Owner review.
export const DELIVERY_SCREEN_COPY_NAMESPACE = "deliveryScreen";

export const DELIVERY_SCREEN_COPY = {
  namespace: DELIVERY_SCREEN_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: {
      title: "Your final photos",
      subtitle: "Your photos are ready to download.",
      download: "Download",
      // PROPOSED (pending Owner review): bulk download, not yet designed in the deck.
      downloadAll: "Download all ({count, plural, one {# photo} other {# photos}})",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      pickSeveral: "Choose several",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      readyTitle: "Final photos are ready",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      readyBody: "Download one by one, several, or all at once.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      cardTitle: "Final photos",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      groupMeta: "{count, plural, one {# file} other {# files}} · {name}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      groupTab: "{name} · {count}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      editedMeta: "{count, plural, one {# edited photo} other {# edited photos}}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      printMeta: "{count, plural, one {# print file} other {# print files}}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      kindLabel: "File type",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      editedTab: "Edited · {count}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      printTab: "Print · {count}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      confirmTitle: "Download all {count, plural, one {# photo} other {# photos}}?",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      confirmDescription: "Your browser downloads the files one at a time.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      confirmBody: "If asked, allow multiple downloads. Keep this page open until it finishes.",
      cancel: "Cancel",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      confirm: "Download all",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      progressTitle: "Downloading final photos",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      running: "Running",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      progress: "{done} of {total} photos done",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      stop: "Stop downloads",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      failedTitle:
        "{count, plural, one {# photo couldn’t be downloaded} other {# photos couldn’t be downloaded}}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      failedBody: "{names} couldn’t be downloaded. The other photos were saved.",
      retry: "Try again",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      failedBadge: "Failed",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      failedMeta: "Couldn’t download",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      selectedTitle: "{count, plural, one {# photo selected} other {# photos selected}}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      downloadSelected: "Download {count, plural, one {# photo} other {# photos}}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      viewerMeta: "Final photos · {kind} · {position} of {total}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      downloadPhoto: "Download photo",
      // Deck §14.3 names the edited and print groups.
      edited: "Edited photos",
      print: "Print files",
      tileDownload: "Download {fileName}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      tileSelect: "Select {fileName}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      downloadMenu: "Download options",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      viewerMissing: "This photo isn’t available.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      emptyKind: "No files here yet.",
      // Deck §14.3 "Load failure".
      loadFailed: "Photos couldn’t be loaded. Try again.",
    },
    id: {
      title: "Hasil akhir fotomu",
      subtitle: "Fotomu sudah siap diunduh.",
      download: "Unduh",
      downloadAll: "Unduh semua ({count, plural, other {# foto}})",
      pickSeveral: "Pilih beberapa",
      readyTitle: "Hasil akhir sudah tersedia",
      readyBody: "Unduh satu per satu, beberapa, atau semuanya sekaligus.",
      cardTitle: "Foto hasil akhir",
      groupMeta: "{count, plural, other {# file}} · {name}",
      groupTab: "{name} · {count}",
      editedMeta: "{count, plural, other {# foto hasil edit}}",
      printMeta: "{count, plural, other {# file cetak}}",
      kindLabel: "Jenis file",
      editedTab: "Hasil edit · {count}",
      printTab: "Cetak · {count}",
      confirmTitle: "Unduh semua {count, plural, other {# foto}}?",
      confirmDescription: "Peramban Anda mengunduh file satu per satu.",
      confirmBody:
        "Jika diminta, izinkan unduhan berganda. Jangan tutup halaman ini sampai selesai.",
      cancel: "Batal",
      confirm: "Unduh semua",
      progressTitle: "Mengunduh hasil akhir",
      running: "Berjalan",
      progress: "{done} dari {total} foto selesai",
      stop: "Hentikan unduhan",
      failedTitle: "{count, plural, other {# foto gagal diunduh}}",
      failedBody: "{names} tidak bisa diunduh. Foto lain sudah masuk.",
      retry: "Coba lagi",
      failedBadge: "Gagal",
      failedMeta: "Gagal diunduh",
      selectedTitle: "{count, plural, other {# foto dipilih}}",
      downloadSelected: "Unduh {count, plural, other {# foto}}",
      viewerMeta: "Hasil akhir · {kind} · {position} dari {total}",
      downloadPhoto: "Unduh foto",
      edited: "Hasil edit",
      print: "File cetak",
      tileDownload: "Unduh {fileName}",
      tileSelect: "Pilih {fileName}",
      downloadMenu: "Pilihan unduhan",
      viewerMissing: "Foto ini tidak tersedia.",
      emptyKind: "Belum ada file di sini.",
      loadFailed: "Foto belum bisa dimuat. Coba lagi.",
    },
  },
} as const;

export { CLIENT_COPY_NAMESPACE as DELIVERY_SHARED_NAMESPACE } from "../client-copy/client-copy.copy";
