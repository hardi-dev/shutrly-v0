// Source: copy-deck.md §14.3 "Final delivery" (download and download-photo names, load failure) and §14.2 for the browse wording. Rows marked PROPOSED have no deck row yet; see copy-deck.md §14.4.
export const CLIENT_BROWSE_COPY_NAMESPACE = "clientBrowse";

export { CLIENT_COPY_NAMESPACE as BROWSE_SHARED_NAMESPACE } from "../client-copy/client-copy.copy";
export { VIEWER_PICK_COPY_NAMESPACE as BROWSE_VIEWER_PICK_NAMESPACE } from "../viewer-pick-actions/viewer-pick-actions.copy";

export const CLIENT_BROWSE_COPY = {
  namespace: CLIENT_BROWSE_COPY_NAMESPACE,
  surface: "gallery",
  messages: {
    en: {
      // PROPOSED (pending Owner review)
      subtitle: "Browse your photos. Open a photo to pick it for a package part.",
      // PROPOSED (pending Owner review)
      subtitleNoGroups: "See all your photos.",
      // PROPOSED (pending Owner review)
      cardTitle: "Photos",
      // PROPOSED (pending Owner review)
      cardMeta: "{photos, plural, one {# photo} other {# photos}}",
      // PROPOSED (pending Owner review)
      cardMetaFolders:
        "{photos, plural, one {# photo} other {# photos}} · {folders, plural, one {# folder} other {# folders}}",
      // PROPOSED (pending Owner review)
      folderMeta: "{name} · {photos, plural, one {# photo} other {# photos}}",
      // PROPOSED (pending Owner review)
      searchMeta: "{count, plural, one {# result} other {# results}}",
      // PROPOSED (pending Owner review)
      searchPlaceholder: "Search file names",
      // PROPOSED (pending Owner review)
      searchLabel: "Search file names",
      // PROPOSED (pending Owner review)
      rootLabel: "All folders",
      // PROPOSED (pending Owner review)
      rootSummary:
        "All folders · {folders, plural, one {# folder} other {# folders}}, {photos, plural, one {# photo} other {# photos}}",
      // PROPOSED (pending Owner review)
      searchSummary: "{count, plural, one {# photo matches} other {# photos match}} “{text}”",
      // PROPOSED (pending Owner review)
      folderCount: "{count, plural, one {# photo} other {# photos}}",
      // PROPOSED (pending Owner review): not in Pencil
      folderFallbackName: "Folder",
      // PROPOSED (pending Owner review)
      failedTitle: "Photos couldn’t be loaded",
      // PROPOSED (pending Owner review)
      failedBody: "Check your connection, then try again.",
      retry: "Try again",
      // PROPOSED (pending Owner review)
      unavailableTitle: "Photos can’t be shown yet",
      // PROPOSED (pending Owner review)
      unavailableBody: "We couldn’t get the photos right now.",
      emptyTitle: "No photos yet",
      // Owner-approved (F-27 copy draft, iteration 7).
      emptyBody: "The photographer hasn’t added photos to this gallery yet. Try again later.",
      // PROPOSED (pending Owner review)
      searchEmptyTitle: "No photos “{text}”",
      // PROPOSED (pending Owner review)
      searchEmptyBody: "Try another file name.",
      // PROPOSED (pending Owner review)
      loadingMore: "Loading more photos…",
      // PROPOSED (pending Owner review)
      viewerMissing: "This photo isn’t available anymore",
      download: "Download",
      // PROPOSED (pending Owner review)
      downloadAll: "Download all",
      // PROPOSED (pending Owner review)
      downloadMenu: "Download options",
      // PROPOSED (pending Owner review)
      pickSeveral: "Pick several",
      // PROPOSED (pending Owner review)
      selectedTitle: "{count, plural, one {# photo selected} other {# photos selected}}",
      // PROPOSED (pending Owner review)
      downloadSelected: "Download {count, plural, one {# photo} other {# photos}}",
      cancel: "Cancel",
      // PROPOSED (pending Owner review)
      pickFor: "Put in…",
      // PROPOSED (pending Owner review)
      pickPhotos: "Pick photos",
      // PROPOSED (pending Owner review)
      pickedTitle:
        "{count, plural, =0 {All photos are already in {group}} other {# photos picked for {group}}}",
      // PROPOSED (pending Owner review)
      pickLimitTitle: "Picks exceed the limit",
      // PROPOSED (pending Owner review)
      pickLimitBody:
        "{remaining, plural, one {# photo is} other {# photos are}} left in this part. Remove some picked photos, then try again.",
      // PROPOSED (pending Owner review)
      pickClosed: "This part’s picks are already sent",
      // PROPOSED (pending Owner review)
      pickRefused: "Photos couldn’t be picked. Try again.",
      // PROPOSED (pending Owner review)
      progressTitle: "Downloading photos",
      // PROPOSED (pending Owner review)
      confirmTitle: "Download all {count, plural, one {# photo} other {# photos}}?",
      tileDownload: "Download {fileName}",
      // PROPOSED (pending Owner review)
      downloadPhoto: "Download photo",
    },
    id: {
      subtitle: "Lihat-lihat foto Anda. Buka foto untuk memilihnya ke bagian paket.",
      subtitleNoGroups: "Lihat semua foto Anda.",
      cardTitle: "Foto",
      cardMeta: "{photos, plural, other {# foto}}",
      cardMetaFolders: "{photos, plural, other {# foto}} · {folders, plural, other {# folder}}",
      folderMeta: "{name} · {photos, plural, other {# foto}}",
      searchMeta: "{count, plural, other {# hasil}}",
      searchPlaceholder: "Cari nama file",
      searchLabel: "Cari nama file",
      rootLabel: "Semua folder",
      rootSummary:
        "Semua folder · {folders, plural, other {# folder}}, {photos, plural, other {# foto}}",
      searchSummary: "{count, plural, other {# foto cocok}} dengan “{text}”",
      folderCount: "{count, plural, other {# foto}}",
      folderFallbackName: "Folder",
      failedTitle: "Foto gagal dimuat",
      failedBody: "Periksa koneksi Anda, lalu coba lagi.",
      retry: "Coba lagi",
      unavailableTitle: "Foto belum bisa ditampilkan",
      unavailableBody: "Kami tidak bisa mengambil foto saat ini.",
      emptyTitle: "Belum ada foto",
      emptyBody: "Fotografer belum menambahkan foto ke galeri ini. Coba lagi nanti.",
      searchEmptyTitle: "Tidak ada foto “{text}”",
      searchEmptyBody: "Coba nama file lain.",
      loadingMore: "Memuat foto lainnya…",
      viewerMissing: "Foto ini tidak tersedia lagi",
      download: "Unduh",
      downloadAll: "Unduh semua",
      downloadMenu: "Pilihan unduhan",
      pickSeveral: "Pilih beberapa",
      selectedTitle: "{count, plural, other {# foto dipilih}}",
      downloadSelected: "Unduh {count, plural, other {# foto}}",
      cancel: "Batal",
      pickFor: "Masukkan ke…",
      pickPhotos: "Pilih foto",
      pickedTitle:
        "{count, plural, =0 {Semua foto sudah ada di {group}} other {# foto dipilih untuk {group}}}",
      pickLimitTitle: "Pilihan melebihi batas",
      pickLimitBody:
        "Sisa {remaining, plural, other {# foto}} di bagian ini. Kurangi foto yang dipilih, lalu coba lagi.",
      pickClosed: "Pilihan bagian ini sudah dikirim",
      pickRefused: "Foto belum bisa dipilih. Coba lagi.",
      progressTitle: "Mengunduh foto",
      confirmTitle: "Unduh semua {count, plural, other {# foto}}?",
      tileDownload: "Unduh {fileName}",
      downloadPhoto: "Unduh foto",
    },
  },
} as const;
