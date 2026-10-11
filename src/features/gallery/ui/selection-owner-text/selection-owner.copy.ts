// Source: copy-deck.md §15 "Selection card", "Selection actions", "Owner warning" and "Selection confirmation"; §14.2 for the open-group allowance.
// Rows marked PROPOSED have no deck row yet; they are listed in copy-deck.md §15.x for Owner review.
export const SELECTION_OWNER_COPY_NAMESPACE = "selectionOwner";

export const SELECTION_OWNER_COPY = {
  namespace: SELECTION_OWNER_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      cardTitle: "Client selections",
      pageMeta: "See the client’s photo selections and lock them when finished.",
      cardNotPublished: "The client chooses photos through the gallery.",
      // PROPOSED (pending Owner review): the export's note under the card in the not-published state.
      cardNotPublishedNote: "The client can choose once the gallery is published.",
      // PROPOSED (pending Owner review): a package with no selectable items.
      cardNoItems: "This package has no photo selection items.",
      // PROPOSED (pending Owner review): the open card line.
      cardOpen: "Selections per package item.",
      // PROPOSED (pending Owner review): the review card line counts the sections sent.
      cardReview:
        "{count, plural, one {The client has sent one section.} other {The client has sent # sections.}}",
      // PROPOSED (pending Owner review): the final card line.
      cardFinal: "Selections are final.",
      viewPicks: "View selections",
      reviewPicks: "Review selections",
      // PROPOSED (pending Owner review): the status chips of a group.
      statusOpen: "Open",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      statusSubmitted: "Sent",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      statusLocked: "Locked",
      // PROPOSED (pending Owner review): the group's usage line, built from the unit word.
      usage: "{usage} of {limit} {unit}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      usageOpen: "{usage} of {limit} {unit} selected",
      notes: "{count, plural, one {# note} other {# notes}}",
      // PROPOSED (pending Owner review): the date of a sent group.
      sentOn: "sent {date}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      defaultUnit: "photos",
      // PROPOSED (pending Owner review): the waiting state of a group.
      waitingTitle: "Waiting for the client to choose",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      waitingBody: "The client hasn’t sent selections yet.",
      // PROPOSED (pending Owner review): the banner when a group was sent.
      sentBannerTitle: "{names} sent their selections",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      sentBannerBody: "Review the selections, then lock them so they can’t change.",
      namesJoin: " and ",
      lockPicks: "Lock selections",
      closePicks: "Close selections",
      moreThumbs: "+{count}",
      // PROPOSED (pending Owner review): the group page subtitle.
      detailSubtitle: "Photos the client chose.",
      copyNames: "Copy file names",
      // PROPOSED (pending Owner review): the copy toast and its failure for the file-name list.
      copiedTitle: "File name list copied",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      copyFailedTitle: "List couldn’t be copied",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      copyFailedBody: "Copy the file names manually.",
      // PROPOSED (pending Owner review): the open-group alert; the body is the deck's owner warning.
      openAlertTitle: "Selections are still open",
      openAlertBody:
        "The client can still change selections until they submit or you close the group.",
      // Deck §15 "Owner warning": the missing-photo alert.
      missingTitle:
        "{count, plural, one {# selected photo is no longer in Drive.} other {# selected photos are no longer in Drive.}}",
      missingBody: "They still count.",
      // PROPOSED (pending Owner review): the summary block of the group page.
      summaryTitle: "Summary",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      summaryStatus: "Status",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      summaryUsed: "Used",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      summaryTime: "Time",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      summaryNotes: "Notes",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      notesPhotos: "{count, plural, one {# photo with a note} other {# photos with notes}}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      timeChanged: "Changed {when}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      timeSent: "Sent {when}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      timeLocked: "Locked {when}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      timeNone: "No selections yet",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      picksTitle: "Chosen photos",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      picksMetaCount: "{picks, plural, one {# photo} other {# photos}}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      picksMetaCountNotes:
        "{picks, plural, one {# photo} other {# photos}} · {withNotes, plural, one {# with a note} other {# with notes}}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      picksMetaQuantity:
        "{picks, plural, one {# photo} other {# photos}} · print quantity is written on each photo",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      clientNote: "Client note",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      quantity: "× {quantity}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      missingOnPhone: "Missing in Drive",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      emptyTitle: "No photos chosen yet",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      emptyBody: "The client hasn’t chosen photos for this section yet.",
      // Deck §15 "Selection confirmation": lock.
      lockTitle: "Lock selections for {name}?",
      lockDescription: "The client can’t change them again.",
      // PROPOSED (pending Owner review): the lock body.
      lockBody:
        "Once locked, the selections can’t be reopened, and add-ons can’t raise this group’s limit.",
      // Deck §15 "Selection confirmation": close.
      closeTitle: "Close selections for {name}?",
      closeDescription: "The group will be locked with the current selections.",
      // PROPOSED (pending Owner review): the close body.
      closeBody:
        "The client hasn’t sent yet. The group will be locked with {usage} {unit} chosen and can’t be reopened.",
      // PROPOSED (pending Owner review): the results of the lock and the close.
      lockedToast: "{name} locked",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      closedToast: "{name} closed",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      staleToast: "The selection status has changed. The page has reloaded.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      lockFailed: "Selections aren’t locked yet. Try again.",
    },
    id: {
      cardTitle: "Pilihan klien",
      pageMeta: "Lihat pilihan foto klien dan kunci setelah selesai.",
      cardNotPublished: "Klien memilih foto lewat galeri.",
      cardNotPublishedNote: "Klien baru bisa memilih setelah galeri dipublikasikan.",
      cardNoItems: "Paket proyek ini tidak punya item pilihan foto.",
      cardOpen: "Pilihan per bagian paket.",
      cardReview:
        "{count, plural, one {Klien sudah mengirim satu bagian.} other {Klien sudah mengirim # bagian.}}",
      cardFinal: "Pilihan sudah final.",
      viewPicks: "Lihat pilihan",
      reviewPicks: "Tinjau pilihan",
      statusOpen: "Terbuka",
      statusSubmitted: "Dikirim",
      statusLocked: "Dikunci",
      usage: "{usage} dari {limit} {unit}",
      usageOpen: "{usage} dari {limit} {unit} dipilih",
      notes: "{count, plural, other {# catatan}}",
      sentOn: "dikirim {date}",
      defaultUnit: "foto",
      waitingTitle: "Menunggu klien memilih",
      waitingBody: "Klien belum mengirim pilihan.",
      sentBannerTitle: "{names} sudah dikirim klien",
      sentBannerBody: "Periksa pilihan, lalu kunci agar tidak berubah.",
      namesJoin: " dan ",
      lockPicks: "Kunci pilihan",
      closePicks: "Tutup pilihan",
      moreThumbs: "+{count}",
      detailSubtitle: "Foto yang klien pilih.",
      copyNames: "Salin nama file",
      copiedTitle: "Daftar nama file disalin",
      copyFailedTitle: "Daftar belum tersalin",
      copyFailedBody: "Salin nama file secara manual.",
      openAlertTitle: "Pilihan masih terbuka",
      openAlertBody: "Klien masih bisa mengubah pilihan sampai mengirim atau kamu menutupnya.",
      missingTitle: "{count, plural, other {# foto pilihan tidak ada lagi di Drive.}}",
      missingBody: "Foto tetap dihitung.",
      summaryTitle: "Ringkasan",
      summaryStatus: "Status",
      summaryUsed: "Terpakai",
      summaryTime: "Waktu",
      summaryNotes: "Catatan",
      notesPhotos: "{count, plural, other {# foto bercatatan}}",
      timeChanged: "Diubah {when}",
      timeSent: "Dikirim {when}",
      timeLocked: "Dikunci {when}",
      timeNone: "Belum ada pilihan",
      picksTitle: "Foto pilihan",
      picksMetaCount: "{picks, plural, other {# foto}}",
      picksMetaCountNotes:
        "{picks, plural, other {# foto}} · {withNotes, plural, other {# dengan catatan}}",
      picksMetaQuantity: "{picks, plural, other {# foto}} · jumlah cetak tertulis di tiap foto",
      clientNote: "Catatan klien",
      quantity: "× {quantity}",
      missingOnPhone: "Hilang di Drive",
      emptyTitle: "Belum ada foto dipilih",
      emptyBody: "Klien belum memilih foto untuk bagian ini.",
      lockTitle: "Kunci pilihan {name}?",
      lockDescription: "Klien tidak bisa mengubahnya lagi.",
      lockBody:
        "Setelah dikunci, pilihan tidak bisa dibuka lagi dan add-on tidak bisa menambah batas grup ini.",
      closeTitle: "Tutup pilihan {name}?",
      closeDescription: "Grup dikunci dengan pilihan saat ini.",
      closeBody:
        "Klien belum mengirim. Grup dikunci dengan {usage} {unit} terpilih dan tidak bisa dibuka lagi.",
      lockedToast: "{name} dikunci",
      closedToast: "{name} ditutup",
      staleToast: "Status pilihan sudah berubah. Halaman dimuat ulang.",
      lockFailed: "Pilihan belum terkunci. Coba lagi.",
    },
  },
} as const;
