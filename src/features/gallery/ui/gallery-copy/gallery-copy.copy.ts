// Source: copy-deck.md §10 "Gallery management — Owner" (§10.1–10.8), §9.1 for the sources card, §1 for shared actions, §15 for the access card. Copied verbatim.
// Shared by owner and client routes (surface "shared"). Rows marked PROPOSED have no deck row yet; see copy-deck.md §15.x.
export const GALLERY_COPY_NAMESPACE = "gallery";

export const GALLERY_COPY = {
  namespace: GALLERY_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: {
      cardTitle: "Gallery",
      cardDescription: "Project photos from your Google Drive folders.",
      cardEmptyTitle: "No gallery yet",
      cardEmptyBody:
        "Create a password-protected gallery, then link the project’s Google Drive folders.",
      cardDraftProjectTitle: "Galleries are available after booking",
      cardDraftProjectBody: "Confirm the booking, then create a gallery for this project.",
      cardCancelledTitle: "Gallery unavailable",
      cardCancelledBody: "This project is canceled, so a gallery can’t be created.",
      create: "Create gallery",
      manage: "Manage gallery",
      manageMobile: "Manage",
      view: "View gallery",
      factStatus: "Status",
      factPassword: "Password",
      factSources: "Sources",
      factPhotos: "Photos",
      factExpiry: "Expiry",
      copyPassword: "Copy password",
      copiedTitle: "Password copied",
      copyFailedTitle: "Password couldn’t be copied",
      copyFailedBody: "Copy the password manually.",
      sourceCount: "{count, plural, one {# folder} other {# folders}}",
      noSources: "No folders yet",
      // PROPOSED (pending Owner review): the combined proof and finished count (F-21).
      photoCounts: "{proof} selection photos · {finished} final files",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      photoCountsMissing: "{proof} selection photos ({missing} missing) · {finished} final files",
      missingSuffix: " ({count} missing)",
      expiryNone: "No expiry",
      expiryPast: "{date} (expired)",
      expiryNoneMeta: "No expiry",
      expiryDays: "{count, plural, one {# day} other {# days}} after publishing",
      expiryOn: "Expires on {date}",
      expiredSince: "Expired since {date}",
      // PROPOSED (pending Owner review): the proof count shown in the card's summary.
      proofCount: "{count, plural, one {# selection photo} other {# selection photos}}",
      statusDraft: "Draft",
      statusPublished: "Published",
      statusExpired: "Expired",
      statusArchived: "Archived",
      pageTitle: "Gallery",
      createDialogTitle: "Create gallery",
      accessDescription: "Clients use the gallery link and this password to open the gallery.",
      passwordLabel: "Gallery password",
      passwordHelper:
        "Generated for you. You can change it to 6–64 characters and view it on this page.",
      regenerate: "Generate again",
      expiryLabel: "Expiry",
      expiryOptionNone: "No expiry",
      expiryOptionDate: "Until a date",
      expiryOptionDays: "For a number of days",
      expiryDateLabel: "Expiry date",
      expiryDateHelper: "The gallery expires at the end of that day. You can change it later.",
      expiryDaysLabel: "Number of days",
      expiryDaysHelperDraft: "Counted from publishing. You can change it later.",
      expiryDaysHelperLive: "Counted from when you save.",
      cancel: "Cancel",
      createdTitle: "Gallery created",
      createdBody: "Add a Google Drive folder to get started.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      createdWithFolderBody: "The Google Drive folder is syncing.",
      errorTooShort: "Use at least 6 characters.",
      errorTooLong: "Use no more than 64 characters.",
      errorRequired: "Fill in this field.",
      errorInvalid: "Check this field and try again.",
      errorNotWhole: "Enter a whole number of days.",
      errorOutOfRange: "Enter between 1 and 3,650 days.",
      errorPastDate: "Choose today or a later date.",
      errorNotDrive: "Paste a Google Drive folder link.",
      errorNotFolder: "This is a file link. Paste a Google Drive folder link.",
      errorFolderLinked: "This folder is already in this gallery.",
      errorSourceInactive: "This source is no longer active. Choose another source.",
      fieldTooLongLabel: "Use no more than 60 characters for the label.",
      fieldTooLongLink: "This link is too long.",
      refusedNotAllowed: "Confirm the project’s booking before creating a gallery.",
      refusedAlreadyExists: "This project already has a gallery.",
      refusedInvalidState: "The gallery has changed. Reload the page.",
      refusedLastActiveSource: "A published gallery needs at least one active folder.",
      // PROPOSED (pending Owner review): a folder with picks cannot be removed.
      refusedHasPicks: "The client has already chosen photos from this folder.",
      refusedSyncInProgress: "This folder is already syncing.",
      refusedRateLimited: "Too many sync requests. Try again in a moment.",
      saveFailedTitle: "Changes couldn’t be saved",
      saveFailedBody: "Check your connection, then try again.",
      retry: "Try again",
      sourcesTitle: "Photo sources",
      sourcesDescription: "Link publicly shared Drive folders, then sync to read their photos.",
      sourcesEmptyTitle: "No folders yet",
      sourcesEmptyBody:
        "Link a project folder. Photos are for selection unless you map a subfolder to a package item; files in mapped subfolders are final files.",
      sourcesEmptyBodyMobile: "Link the project’s Google Drive folder.",
      addFolder: "Add folder",
      addFolderMobile: "Add",
      photosTitle: "Photos",
      photosDescriptionEmpty: "Photos appear after syncing, ordered by filename.",
      photosDescriptionMobile: "Ordered by filename.",
      photosEmptyTitle: "No photos yet",
      photosEmptyBody: "Photos appear here after the folder is synced.",
      photosDescription:
        "The first 8 photos. View all to browse folders, search and preview photos.",
      viewAll: "View all photos",
      viewAllMobile: "All photos",
      visibilityDraft: "Visible to clients after publishing.",
      visibilityPublished: "Visible to clients now.",
      visibilityExpired: "Hidden from clients while the gallery is expired.",
      visibilityArchived: "Hidden from clients.",
      visibilityCancelled: "Won’t be visible to clients.",
      visibilityHidden: "Hidden until final delivery. Clients can’t select these photos.",
      visibilityMissing: "Missing photos are hidden until found again.",
      visibilityFoldedEdited:
        "Hidden until final delivery. `edited` folders are merged into their parent folder.",
      visibilityFoldedPrint:
        "Hidden until final delivery. `print` folders are merged into their parent folder.",
      accessTitle: "Client access",
      rotatePassword: "Change password",
      rotatePasswordMobile: "Change",
      publish: "Publish gallery",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      galleryMenu: "Gallery menu",
      galleryMenuTitle: "Gallery",
      syncAll: "Sync all",
      syncAllRunning: "Syncing…",
      sync: "Sync",
      sourceMenu: "Actions for {name}",
      sourceFallbackName: "Google Drive folder",
      chipSynced: "Synced",
      chipSyncing: "Syncing",
      chipFailed: "Failed",
      chipNever: "Not synced yet",
      chipRemoved: "Unlinked",
      chipArchived: "Archived",
      sourceSyncing: "Syncing…",
      sourceQueued: "Waiting…",
      sourceRemovedAt: "Unlinked {when} · {photos} photos hidden from clients",
      sourceLastSyncedShort: "Last synced {when}",
      sourceSyncedAt: "Synced {when}",
      sourceSyncProgress: "Syncing… {done} of {total} folders",
      syncStopped: "Sync stopped before finishing.",
      syncErrorNotPublic: "Share the folder with “Anyone with the link”, then sync again.",
      syncErrorRateLimited:
        "Google Drive is limiting requests. Sync couldn’t finish. Try again later.",
      syncErrorUnavailable: "Google Drive can’t be reached. Sync couldn’t finish. Try again later.",
      syncErrorTooLarge:
        "This folder is too large to sync. Split it into smaller folders, then add them.",
      syncDoneTitle: "Sync complete",
      syncDoneBody: "{count, plural, one {# folder synced.} other {# folders synced.}}",
      syncFailedNames: "Couldn’t read {names}.",
      syncFailedTitle: "Sync failed",
      syncFailedBody: "Google Drive can’t be reached. Sync couldn’t finish. Try again later.",
      linkDialogTitle: "Add folder",
      linkDialogDescription:
        "Photos stay available for selection unless their subfolder is mapped to a package item. Mapped files are final files.",
      linkSourceLabel: "Source",
      linkSourceHelper: "Active sources only.",
      linkLabel: "Google Drive folder link",
      linkPlaceholder: "https://drive.google.com/drive/folders/…",
      linkHelper: "Share the folder with “Anyone with the link”.",
      labelLabel: "Label",
      labelPlaceholder: "e.g. Graduation session",
      labelHelper: "Leave blank to use the Drive folder name.",
      publicLinkTitle: "Drive links bypass the gallery password",
      publicLinkBody:
        "Anyone with the folder link can view the photos directly. Share the gallery link with clients, not the Drive link.",
      folderInUseTitle: "Another project uses this folder",
      folderInUseBody:
        "This folder is also linked to {projects}. Clients of both projects may see the same photos.",
      folderInUseConfirm: "Add anyway",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      createFolderTitle: "Google Drive folder",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      createFolderHelper: "Optional. You can also add one later on the gallery page.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      createFolderInUseConfirm: "Create gallery anyway",
      linkedTitle: "Folder added",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      previewPosition: "{position} of {total}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      previewMissingBadge: "Missing",
      previewMissing: "File not found in Google Drive",
      previewMissingNote: "Hidden from clients until found again during sync.",
      loadingGallery: "Loading gallery…",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      menuSheetMeta: "{status} · {project}",
      openInDrive: "Open in Google Drive",
      openInDriveMobile: "Open in Drive",
      publishDialogTitle: "Publish this gallery?",
      publishDialogBody:
        "Folders are checked again now. After that, clients can open the gallery using its link and password.",
      publishExpiry: "Expiry: {text}.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      publishDescription: "{body} {expiry}",
      publishRefusedTitle: "This gallery isn’t ready to publish",
      publishRefusedNone: "No readable folders were found during the check.",
      publishRefusedHint:
        "Check that the folder is shared with “Anyone with the link”, then try again.",
      close: "Close",
      publishedTitle: "Gallery published",
      publishedBody: "Share the gallery link and password with your client.",
      expiryDialogTitle: "Gallery expiry",
      expiryDialogBody:
        "After expiry, clients can’t open the gallery until you change its expiry settings.",
      expirySave: "Save",
      expirySavedTitle: "Expiry saved",
      reopenedTitle: "Gallery reopened",
      changeExpiry: "Change expiry",
      rotateDialogTitle: "Change gallery password",
      rotateDialogBody:
        "The old password stops working immediately. Clients viewing the gallery must enter the new password.",
      rotateLabel: "New password",
      rotateHelper: "Generated for you. You can change it to 6–64 characters.",
      rotatedTitle: "Password changed",
      rotatedBody: "Share the new password with your client. The old password no longer works.",
      deleteFolder: "Unlink folder",
      deleteFolderTitle: "Unlink {name}?",
      deleteFolderBody:
        "{count, plural, one {# photo will be hidden from clients.} other {# photos will be hidden from clients.}} The Drive folder stays unchanged. To use this folder again, add it as a new folder.",
      deleteLastHint: "A published gallery needs at least one active folder.",
      folderDeletedTitle: "Folder unlinked",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      renameFolder: "Edit folder",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      renameDialogTitle: "Edit folder",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      renameDialogDescription: "The folder name and the subfolders that hold final files.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      renamedTitle: "Folder saved",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      mappingTitle: "Final-file subfolders",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      mappingHelper:
        "Choose the Drive subfolder for each package item. Subfolders you don’t choose stay selection photos.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      mappingNone: "Not chosen",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      mappingNoFolders: "No subfolders yet. Sync this folder first, then map them here.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      mappingNoItemsTitle: "This package has no items for selection photos yet",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      mappingNoItemsBody: "Add items in Package items first.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      mappingNoItemsAction: "Open package items",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      mappingLoadFailed: "Subfolders couldn’t be loaded. Try again.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      newFoldersTitle:
        "{count, plural, one {# new subfolder} other {# new subfolders}} in {source}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      newFoldersBody: "{folders}. Map them to package items if they hold final files.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      mapFolders: "Map",
      save: "Save",
      saving: "Saving…",
      archiveDialogTitle: "Archive this gallery?",
      archiveDialogBody:
        "Clients will no longer be able to open it. An archived gallery can’t be published again.",
      archive: "Archive gallery",
      archivedTitle: "Gallery archived",
      deleteDialogTitle: "Delete this draft gallery?",
      deleteDialogBody:
        "The gallery, {folders} folders and {photos} photo records will be deleted from Shutrly. Google Drive files stay unchanged.",
      deleteGallery: "Delete gallery",
      deletedTitle: "Draft gallery deleted",
      expiredAlertTitle: "Gallery expired since {date}",
      expiredAlertBody:
        "Set a new expiry date or remove expiry to reopen it with the same link and password.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      cancelledAlertTitle: "Project canceled",
      cancelledAlertBody:
        "This draft can’t be published, synced or edited. You can still delete it.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      archivedAlertTitle: "Gallery archived",
      archivedAlertBody:
        "You can view this gallery, but can’t sync or edit it. Clients can’t open it.",
      cardFailedTitle:
        "{count, plural, one {# folder couldn’t be synced} other {# folders couldn’t be synced}}",
      cardFailedBody: "{names} couldn’t be read. Open the gallery for details.",
      allPhotosTitle: "All photos",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      allPhotosDescription: "{project} · {totals}",
      kindTabProof: "Selection photos",
      kindTabEdited: "Edited photos",
      kindTabPrint: "Print photos",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      kindLowerProof: "selection",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      kindLowerEdited: "edited",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      kindLowerPrint: "print",
      tabLabel: "{kind} ({count})",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      segmentLabel: "{kind} {count}",
      kindsLabel: "Photo types",
      breadcrumbRoot: "All folders",
      breadcrumbLabel: "Folder location",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      crumbFolders:
        "{folders, plural, =0 {· {photos} photos} other {· # folders · {photos} photos}}",
      folderCount: "{count} photos",
      searchLabel: "Search filenames",
      clearSearch: "Clear search",
      searchSummary: "{count} photos match “{text}”",
      searchEmptyTitle: "No photos matching “{text}”",
      searchEmptyBody:
        "Try another part of the filename, or clear the search to return to folders.",
      folderEmptyTitle: "No photos here yet",
      folderEmptyBody: "Photos of this type appear after the folder is synced.",
      loadingMore: "Loading more photos…",
      browseFailedTitle: "Photos couldn’t be loaded",
      sourceProof: "{count} selection photos",
      sourceMissing: "{count} missing",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      sourceFinished: "{count} final files",
      sourceIgnored: "{count} ignored",
      sourceTooDeep: "{count} folders exceed the depth limit",
      sourceLastSyncedAt: "Last synced {when}",
      sourceNever: "Not synced yet",
    },
    id: {
      cardTitle: "Galeri",
      cardDescription: "Foto proyek dari folder Google Drive kamu.",
      cardEmptyTitle: "Belum ada galeri",
      cardEmptyBody: "Buat galeri dengan kata sandi, lalu tautkan folder Google Drive proyek ini.",
      cardDraftProjectTitle: "Galeri tersedia setelah pemesanan dikonfirmasi",
      cardDraftProjectBody: "Konfirmasi pemesanan dulu, lalu buat galeri untuk proyek ini.",
      cardCancelledTitle: "Galeri tidak tersedia",
      cardCancelledBody: "Proyek ini dibatalkan, jadi galeri tidak bisa dibuat.",
      create: "Buat galeri",
      manage: "Kelola galeri",
      manageMobile: "Kelola",
      view: "Lihat galeri",
      factStatus: "Status",
      factPassword: "Kata sandi",
      factSources: "Sumber",
      factPhotos: "Foto",
      factExpiry: "Kedaluwarsa",
      copyPassword: "Salin kata sandi",
      copiedTitle: "Kata sandi disalin",
      copyFailedTitle: "Kata sandi belum tersalin",
      copyFailedBody: "Salin kata sandi secara manual.",
      sourceCount: "{count, plural, other {# folder}}",
      noSources: "Belum ada folder",
      photoCounts: "{proof} foto pilihan · {finished} hasil akhir",
      photoCountsMissing: "{proof} foto pilihan ({missing} hilang) · {finished} hasil akhir",
      missingSuffix: " ({count} hilang)",
      expiryNone: "Tanpa kedaluwarsa",
      expiryPast: "{date} (kedaluwarsa)",
      expiryNoneMeta: "Tanpa kedaluwarsa",
      expiryDays: "{count, plural, other {# hari}} setelah dipublikasikan",
      expiryOn: "Kedaluwarsa pada {date}",
      expiredSince: "Kedaluwarsa sejak {date}",
      proofCount: "{count, plural, other {# foto pilihan}}",
      statusDraft: "Draf",
      statusPublished: "Dipublikasikan",
      statusExpired: "Kedaluwarsa",
      statusArchived: "Diarsipkan",
      pageTitle: "Galeri",
      createDialogTitle: "Buat galeri",
      accessDescription: "Klien membuka galeri dengan tautan dan kata sandi ini.",
      passwordLabel: "Kata sandi galeri",
      passwordHelper:
        "Dibuat otomatis. Bisa diganti dengan 6–64 karakter dan dilihat di halaman ini.",
      regenerate: "Buat ulang",
      expiryLabel: "Kedaluwarsa",
      expiryOptionNone: "Tanpa kedaluwarsa",
      expiryOptionDate: "Sampai tanggal",
      expiryOptionDays: "Selama beberapa hari",
      expiryDateLabel: "Tanggal kedaluwarsa",
      expiryDateHelper: "Galeri kedaluwarsa di akhir hari itu. Bisa diubah nanti.",
      expiryDaysLabel: "Jumlah hari",
      expiryDaysHelperDraft: "Dihitung sejak galeri dipublikasikan. Bisa diubah nanti.",
      expiryDaysHelperLive: "Dihitung sejak disimpan.",
      cancel: "Batal",
      createdTitle: "Galeri dibuat",
      createdBody: "Tambahkan folder Google Drive untuk mulai.",
      createdWithFolderBody: "Folder Google Drive sedang disinkronkan.",
      errorTooShort: "Gunakan minimal 6 karakter.",
      errorTooLong: "Gunakan maksimal 64 karakter.",
      errorRequired: "Isi kolom ini.",
      errorInvalid: "Cek isian ini, lalu coba lagi.",
      errorNotWhole: "Isi jumlah hari dengan angka bulat.",
      errorOutOfRange: "Isi antara 1 dan 3.650 hari.",
      errorPastDate: "Pilih hari ini atau tanggal setelahnya.",
      errorNotDrive: "Tempel tautan folder Google Drive.",
      errorNotFolder: "Ini tautan file. Tempel tautan folder Google Drive.",
      errorFolderLinked: "Folder ini sudah ada di galeri ini.",
      errorSourceInactive: "Sumber ini sudah tidak aktif. Pilih sumber lain.",
      fieldTooLongLabel: "Label maksimal 60 karakter.",
      fieldTooLongLink: "Tautan ini terlalu panjang.",
      refusedNotAllowed: "Konfirmasi pemesanan proyek sebelum membuat galeri.",
      refusedAlreadyExists: "Proyek ini sudah punya galeri.",
      refusedInvalidState: "Galeri sudah berubah. Muat ulang halaman.",
      refusedLastActiveSource: "Galeri yang dipublikasikan butuh minimal satu folder aktif.",
      refusedHasPicks: "Ada foto dari folder ini yang sudah dipilih klien.",
      refusedSyncInProgress: "Folder ini sedang disinkronkan.",
      refusedRateLimited: "Terlalu banyak permintaan sinkronisasi. Coba lagi sebentar lagi.",
      saveFailedTitle: "Perubahan belum tersimpan",
      saveFailedBody: "Cek koneksi, lalu coba lagi.",
      retry: "Coba lagi",
      sourcesTitle: "Sumber foto",
      sourcesDescription:
        "Tautkan folder Drive yang dibagikan lewat tautan publik, lalu sinkronkan untuk membaca fotonya.",
      sourcesEmptyTitle: "Belum ada folder",
      sourcesEmptyBody:
        "Tautkan folder proyek. Foto digunakan untuk pilihan kecuali subfolder dipetakan ke item paket; file di subfolder yang dipetakan menjadi hasil akhir.",
      sourcesEmptyBodyMobile: "Tautkan folder Google Drive proyek ini.",
      addFolder: "Tambah folder",
      addFolderMobile: "Tambah",
      photosTitle: "Foto",
      photosDescriptionEmpty: "Foto muncul setelah sinkronisasi, urut nama file.",
      photosDescriptionMobile: "Urut nama file.",
      photosEmptyTitle: "Belum ada foto",
      photosEmptyBody: "Foto muncul di sini setelah folder disinkronkan.",
      photosDescription:
        "Cuplikan 8 foto pertama. Buka semua untuk menjelajah folder, mencari, dan melihat pratinjau.",
      viewAll: "Lihat semua foto",
      viewAllMobile: "Semua foto",
      visibilityDraft: "Terlihat oleh klien setelah galeri dipublikasikan.",
      visibilityPublished: "Terlihat oleh klien sekarang.",
      visibilityExpired: "Disembunyikan dari klien selama galeri kedaluwarsa.",
      visibilityArchived: "Disembunyikan dari klien.",
      visibilityCancelled: "Tidak akan terlihat oleh klien.",
      visibilityHidden:
        "Disembunyikan sampai hasil akhir dikirim. Foto ini tidak bisa dipilih klien.",
      visibilityMissing: "Foto yang hilang disembunyikan sampai ditemukan lagi.",
      visibilityFoldedEdited:
        "Disembunyikan sampai hasil akhir dikirim. Folder `edited` digabung ke folder induknya.",
      visibilityFoldedPrint:
        "Disembunyikan sampai hasil akhir dikirim. Folder `print` digabung ke folder induknya.",
      accessTitle: "Akses klien",
      rotatePassword: "Ganti kata sandi",
      rotatePasswordMobile: "Ganti",
      publish: "Publikasikan galeri",
      galleryMenu: "Menu galeri",
      galleryMenuTitle: "Galeri",
      syncAll: "Sinkronkan semua",
      syncAllRunning: "Menyinkronkan…",
      sync: "Sinkronkan",
      sourceMenu: "Tindakan untuk {name}",
      sourceFallbackName: "Folder Google Drive",
      chipSynced: "Disinkronkan",
      chipSyncing: "Menyinkronkan",
      chipFailed: "Gagal",
      chipNever: "Belum disinkronkan",
      chipRemoved: "Dilepas",
      chipArchived: "Diarsipkan",
      sourceSyncing: "Menyinkronkan…",
      sourceQueued: "Menunggu giliran…",
      sourceRemovedAt: "Dilepas {when} · {photos} foto disembunyikan dari klien",
      sourceLastSyncedShort: "Terakhir disinkronkan {when}",
      sourceSyncedAt: "Disinkronkan {when}",
      sourceSyncProgress: "Menyinkronkan… {done} dari {total} folder",
      syncStopped: "Sinkronisasi berhenti sebelum selesai.",
      syncErrorNotPublic:
        "Bagikan folder sebagai “Siapa saja yang memiliki link”, lalu sinkronkan lagi.",
      syncErrorRateLimited:
        "Google Drive sedang membatasi permintaan. Sinkronisasi belum selesai. Coba lagi nanti.",
      syncErrorUnavailable:
        "Google Drive belum bisa dihubungi. Sinkronisasi belum selesai. Coba lagi nanti.",
      syncErrorTooLarge:
        "Folder ini terlalu besar untuk disinkronkan. Pecah menjadi beberapa folder, lalu tambahkan lagi.",
      syncDoneTitle: "Sinkronisasi selesai",
      syncDoneBody: "{count, plural, other {# folder disinkronkan.}}",
      syncFailedNames: "{names} belum bisa dibaca.",
      syncFailedTitle: "Sinkronisasi gagal",
      syncFailedBody:
        "Google Drive belum bisa dihubungi. Sinkronisasi belum selesai. Coba lagi nanti.",
      linkDialogTitle: "Tambah folder",
      linkDialogDescription:
        "Foto tetap tersedia untuk dipilih kecuali subfoldernya dipetakan ke item paket. File yang dipetakan menjadi hasil akhir.",
      linkSourceLabel: "Sumber",
      linkSourceHelper: "Hanya sumber aktif.",
      linkLabel: "Tautan folder Google Drive",
      linkPlaceholder: "https://drive.google.com/drive/folders/…",
      linkHelper: "Bagikan folder sebagai “Siapa saja yang memiliki link”.",
      labelLabel: "Label",
      labelPlaceholder: "Contoh: Sesi wisuda",
      labelHelper: "Kosongkan untuk memakai nama folder dari Drive.",
      publicLinkTitle: "Tautan Drive melewati kata sandi galeri",
      publicLinkBody:
        "Siapa pun yang punya tautan folder bisa melihat fotonya langsung. Bagikan tautan galeri ke klien, bukan tautan Drive.",
      folderInUseTitle: "Folder ini dipakai proyek lain",
      folderInUseBody:
        "Folder ini juga tertaut ke {projects}. Klien kedua proyek bisa melihat foto yang sama.",
      folderInUseConfirm: "Tetap tambahkan",
      createFolderTitle: "Folder Google Drive",
      createFolderHelper: "Opsional. Bisa juga ditambahkan nanti di halaman galeri.",
      createFolderInUseConfirm: "Tetap buat galeri",
      linkedTitle: "Folder ditambahkan",
      previewPosition: "{position} dari {total}",
      previewMissingBadge: "Hilang",
      previewMissing: "File tidak ditemukan di Google Drive",
      previewMissingNote: "Disembunyikan dari klien sampai ditemukan lagi saat sinkronisasi.",
      loadingGallery: "Memuat galeri…",
      menuSheetMeta: "{status} · {project}",
      openInDrive: "Buka di Google Drive",
      openInDriveMobile: "Buka di Drive",
      publishDialogTitle: "Publikasikan galeri ini?",
      publishDialogBody:
        "Folder dicek ulang sekarang. Setelah itu, klien bisa membuka galeri dengan tautan dan kata sandinya.",
      publishExpiry: "Kedaluwarsa: {text}.",
      publishDescription: "{body} {expiry}",
      publishRefusedTitle: "Galeri belum bisa dipublikasikan",
      publishRefusedNone: "Tidak ada folder yang bisa dibaca saat dicek ulang.",
      publishRefusedHint:
        "Pastikan folder dibagikan sebagai “Siapa saja yang memiliki link”, lalu coba lagi.",
      close: "Tutup",
      publishedTitle: "Galeri dipublikasikan",
      publishedBody: "Bagikan tautan galeri dan kata sandi ke klien.",
      expiryDialogTitle: "Kedaluwarsa galeri",
      expiryDialogBody:
        "Setelah kedaluwarsa, klien tidak bisa membuka galeri sampai kamu mengubah pengaturannya.",
      expirySave: "Simpan",
      expirySavedTitle: "Kedaluwarsa disimpan",
      reopenedTitle: "Galeri dibuka lagi",
      changeExpiry: "Ubah kedaluwarsa",
      rotateDialogTitle: "Ganti kata sandi galeri",
      rotateDialogBody:
        "Kata sandi lama langsung tidak berlaku. Klien yang sedang membuka galeri harus memasukkan kata sandi baru.",
      rotateLabel: "Kata sandi baru",
      rotateHelper: "Dibuat otomatis. Bisa diganti dengan 6–64 karakter.",
      rotatedTitle: "Kata sandi diganti",
      rotatedBody: "Bagikan kata sandi baru ke klien. Kata sandi lama tidak berlaku lagi.",
      deleteFolder: "Lepas folder",
      deleteFolderTitle: "Lepas {name}?",
      deleteFolderBody:
        "{count, plural, other {# foto disembunyikan dari klien.}} Folder di Drive tidak berubah. Untuk memakainya lagi, tambahkan sebagai folder baru.",
      deleteLastHint: "Galeri yang dipublikasikan butuh minimal satu folder aktif.",
      folderDeletedTitle: "Folder dilepas",
      renameFolder: "Edit folder",
      renameDialogTitle: "Edit folder",
      renameDialogDescription: "Nama folder dan subfolder yang berisi hasil akhir.",
      renamedTitle: "Folder disimpan",
      mappingTitle: "Subfolder hasil akhir",
      mappingHelper:
        "Pilih subfolder Drive untuk tiap item paket. Subfolder yang tidak dipilih tetap foto pilihan.",
      mappingNone: "Belum dipilih",
      mappingNoFolders: "Belum ada subfolder. Sinkronkan folder ini dulu, lalu petakan di sini.",
      mappingNoItemsTitle: "Paket proyek ini belum punya item untuk pilihan foto",
      mappingNoItemsBody: "Tambahkan item di Isi paket dulu.",
      mappingNoItemsAction: "Buka Isi paket",
      mappingLoadFailed: "Subfolder belum bisa dimuat. Coba lagi.",
      newFoldersTitle: "{count, plural, other {# subfolder baru}} di {source}",
      newFoldersBody: "{folders}. Petakan ke item paket bila berisi hasil akhir.",
      mapFolders: "Petakan",
      save: "Simpan",
      saving: "Menyimpan…",
      archiveDialogTitle: "Arsipkan galeri ini?",
      archiveDialogBody:
        "Klien tidak bisa membuka galeri lagi. Galeri yang diarsipkan tidak bisa dipublikasikan kembali.",
      archive: "Arsipkan galeri",
      archivedTitle: "Galeri diarsipkan",
      deleteDialogTitle: "Hapus galeri draf ini?",
      deleteDialogBody:
        "Galeri, {folders} folder, dan data {photos} foto dihapus dari Shutrly. File Google Drive tidak berubah.",
      deleteGallery: "Hapus galeri",
      deletedTitle: "Galeri draf dihapus",
      expiredAlertTitle: "Galeri kedaluwarsa sejak {date}",
      expiredAlertBody:
        "Atur tanggal baru atau hapus kedaluwarsa untuk membukanya lagi dengan tautan dan kata sandi yang sama.",
      cancelledAlertTitle: "Proyek dibatalkan",
      cancelledAlertBody:
        "Draf ini tidak bisa dipublikasikan, disinkronkan, atau diubah. Kamu masih bisa menghapusnya.",
      archivedAlertTitle: "Galeri diarsipkan",
      archivedAlertBody:
        "Galeri ini bisa dilihat, tetapi tidak bisa disinkronkan atau diubah. Klien tidak bisa membukanya.",
      cardFailedTitle: "{count, plural, other {# folder belum bisa disinkronkan}}",
      cardFailedBody: "{names} belum bisa dibaca. Buka galeri untuk melihat penyebabnya.",
      allPhotosTitle: "Semua foto",
      allPhotosDescription: "{project} · {totals}",
      kindTabProof: "Foto pilihan",
      kindTabEdited: "Hasil edit",
      kindTabPrint: "Foto cetak",
      kindLowerProof: "pilihan",
      kindLowerEdited: "hasil edit",
      kindLowerPrint: "cetak",
      tabLabel: "{kind} ({count})",
      segmentLabel: "{kind} {count}",
      kindsLabel: "Jenis foto",
      breadcrumbRoot: "Semua folder",
      breadcrumbLabel: "Lokasi folder",
      crumbFolders: "{folders, plural, =0 {· {photos} foto} other {· # folder · {photos} foto}}",
      folderCount: "{count} foto",
      searchLabel: "Cari nama file",
      clearSearch: "Hapus pencarian",
      searchSummary: "{count} foto cocok dengan “{text}”",
      searchEmptyTitle: "Tidak ada foto yang cocok dengan “{text}”",
      searchEmptyBody:
        "Coba bagian lain dari nama file, atau hapus pencarian untuk kembali ke folder.",
      folderEmptyTitle: "Belum ada foto di sini",
      folderEmptyBody: "Foto jenis ini muncul setelah folder disinkronkan.",
      loadingMore: "Memuat foto berikutnya…",
      browseFailedTitle: "Foto belum bisa dimuat",
      sourceProof: "{count} foto pilihan",
      sourceMissing: "{count} hilang",
      sourceFinished: "{count} hasil akhir",
      sourceIgnored: "{count} diabaikan",
      sourceTooDeep: "{count} folder melewati batas kedalaman",
      sourceLastSyncedAt: "Terakhir disinkronkan {when}",
      sourceNever: "Belum disinkronkan",
    },
  },
} as const;

/** The gallery status words, keyed by the status code. */
export const GALLERY_STATUS_MESSAGE_KEY = {
  DRAFT: "statusDraft",
  PUBLISHED: "statusPublished",
  EXPIRED: "statusExpired",
  ARCHIVED: "statusArchived",
} as const;

/** What the client sees of the gallery, keyed by the status code. */
export const GALLERY_VISIBILITY_MESSAGE_KEY = {
  DRAFT: "visibilityDraft",
  PUBLISHED: "visibilityPublished",
  EXPIRED: "visibilityExpired",
  ARCHIVED: "visibilityArchived",
} as const;

/** The field error messages, keyed by the server's stable error codes. */
export const GALLERY_ERROR_MESSAGE_KEY = {
  TOO_SHORT: "errorTooShort",
  TOO_LONG: "errorTooLong",
  REQUIRED: "errorRequired",
  INVALID: "errorInvalid",
  NOT_WHOLE: "errorNotWhole",
  OUT_OF_RANGE: "errorOutOfRange",
  PAST_DATE: "errorPastDate",
  NOT_DRIVE: "errorNotDrive",
  NOT_A_FOLDER: "errorNotFolder",
  FOLDER_ALREADY_LINKED: "errorFolderLinked",
  SOURCE_NOT_ACTIVE: "errorSourceInactive",
} as const;

/** The label and link length messages of the folder form. */
export const GALLERY_FIELD_TOO_LONG_MESSAGE_KEY = {
  label: "fieldTooLongLabel",
  link: "fieldTooLongLink",
} as const;

/** The domain refusals shown as toasts, keyed by their codes. */
export const GALLERY_REFUSED_MESSAGE_KEY = {
  NOT_ALLOWED_FOR_PROJECT: "refusedNotAllowed",
  ALREADY_EXISTS: "refusedAlreadyExists",
  INVALID_STATE: "refusedInvalidState",
  LAST_ACTIVE_SOURCE: "refusedLastActiveSource",
  HAS_PICKS: "refusedHasPicks",
  SYNC_IN_PROGRESS: "refusedSyncInProgress",
  RATE_LIMITED: "refusedRateLimited",
} as const;

/** The sync failure messages, keyed by the sync error codes. */
export const GALLERY_SYNC_ERROR_MESSAGE_KEY = {
  NOT_PUBLIC: "syncErrorNotPublic",
  RATE_LIMITED: "syncErrorRateLimited",
  UNAVAILABLE: "syncErrorUnavailable",
  TOO_LARGE: "syncErrorTooLarge",
} as const;

/** The source chip of a synced folder, keyed by its state. */
export const GALLERY_SOURCE_CHIP_MESSAGE_KEY = {
  SUCCEEDED: "chipSynced",
  SYNCING: "chipSyncing",
  FAILED: "chipFailed",
  NEVER: "chipNever",
  REMOVED: "chipRemoved",
  ARCHIVED: "chipArchived",
} as const;

/** The visibility note of a folded (edited or print) folder. */
export const GALLERY_VISIBILITY_FOLDED_MESSAGE_KEY = {
  EDITED: "visibilityFoldedEdited",
  PRINT: "visibilityFoldedPrint",
} as const;

/** The tab name of each photo kind. */
export const GALLERY_KIND_TAB_MESSAGE_KEY = {
  PROOF: "kindTabProof",
  EDITED: "kindTabEdited",
  PRINT: "kindTabPrint",
} as const;

/** The lowercase name of each photo kind, used inside a sentence. */
export const GALLERY_KIND_LOWER_MESSAGE_KEY = {
  PROOF: "kindLowerProof",
  EDITED: "kindLowerEdited",
  PRINT: "kindLowerPrint",
} as const;
