// Source: copy-deck.md §14 "Client gallery — built surfaces" for the home entry. Rows marked PROPOSED have no deck row yet; see copy-deck.md §14.4.
export const CLIENT_HOME_COPY_NAMESPACE = "clientHome";

// The shared client copy (Beranda, Semua foto, Hasil akhir) is read through this sibling import.
export { CLIENT_COPY_NAMESPACE as CLIENT_HOME_SHARED_NAMESPACE } from "../client-copy/client-copy.copy";

export const CLIENT_HOME_COPY = {
  namespace: CLIENT_HOME_COPY_NAMESPACE,
  surface: "gallery",
  messages: {
    en: {
      // PROPOSED (pending Owner review)
      greeting: "Hello, {name}",
      // PROPOSED (pending Owner review)
      subtitleStart: "Choose photos for your package, then send them to your photographer.",
      // PROPOSED (pending Owner review)
      subtitlePartly: "{sent} sent. Left to choose: {open}.",
      // PROPOSED (pending Owner review)
      subtitleAllSent: "All selections are sent. Your photographer will let you know.",
      // PROPOSED (pending Owner review)
      subtitleDelivered: "Your photos have been edited.",
      // PROPOSED (pending Owner review)
      subtitleNoGroups: "See all your photos.",
      // PROPOSED (pending Owner review)
      listJoin: " and ",
      // PROPOSED (pending Owner review)
      finalReadyTitle: "Final photos are ready",
      // PROPOSED (pending Owner review)
      finalReadyBody:
        "{edited, plural, one {# edited photo} other {# edited photos}} and {print, plural, one {# print photo} other {# print photos}}. Download one at a time, several, or all.",
      // PROPOSED (pending Owner review)
      finalReadyAction: "View & download",
      // PROPOSED (pending Owner review)
      photosTitle: "Your photos",
      // PROPOSED (pending Owner review)
      photosDescription: "View all photos, then download the final files when they’re ready.",
      // PROPOSED (pending Owner review)
      photosDescriptionDelivered: "View all preview photos from your session.",
      // PROPOSED (pending Owner review)
      allPhotosMeta:
        "{count, plural, one {# photo} other {# photos}} · browse and pick from previews",
      // PROPOSED (pending Owner review)
      allPhotosMetaNoGroups: "{count, plural, one {# photo} other {# photos}} · browse previews",
      // Owner-approved (F-27 copy draft, iteration 7).
      finalUnavailable: "Not available yet · it appears here once the photos are edited.",
      // Owner-approved (F-27 copy draft, iteration 7).
      finalReadyNoDate:
        "{edited, plural, one {# edited photo} other {# edited photos}} · {print, plural, one {# print photo} other {# print photos}}",
      // Owner-approved (F-27 copy draft, iteration 7).
      subtitleNoPhotos: "No photos yet · the photographer hasn’t added any. Try again later.",
      // PROPOSED (pending Owner review)
      pickTitle: "Choose photos",
      // PROPOSED (pending Owner review)
      pickDescription:
        "One row for each part of your package. Choose and send each part on its own.",
      // PROPOSED (pending Owner review)
      actionStart: "Start choosing",
      // PROPOSED (pending Owner review)
      actionContinue: "Continue choosing",
      // PROPOSED (pending Owner review)
      actionView: "View choices",
    },
    id: {
      greeting: "Halo, {name}",
      subtitleStart: "Pilih foto untuk paket Anda, lalu kirim ke fotografer.",
      subtitlePartly: "{sent} sudah dikirim. Tinggal {open}.",
      subtitleAllSent: "Semua pilihan sudah dikirim. Fotografer akan mengabari Anda.",
      subtitleDelivered: "Foto Anda sudah selesai diedit.",
      subtitleNoGroups: "Lihat semua foto Anda.",
      listJoin: " dan ",
      finalReadyTitle: "Hasil akhir siap",
      finalReadyBody:
        "{edited, plural, other {# foto edit}} dan {print, plural, other {# foto cetak}}. Unduh satu per satu, beberapa, atau semuanya.",
      finalReadyAction: "Lihat & unduh",
      photosTitle: "Foto Anda",
      photosDescription: "Lihat semua foto, lalu unduh hasil akhir saat sudah siap.",
      photosDescriptionDelivered: "Lihat semua foto pratinjau dari sesi Anda.",
      allPhotosMeta: "{count, plural, other {# foto}} · lihat-lihat dan pilih dari pratinjau",
      allPhotosMetaNoGroups: "{count, plural, other {# foto}} · lihat-lihat pratinjau",
      finalUnavailable: "Belum tersedia · muncul di sini setelah foto selesai diedit.",
      // Same wording as the EN row, with a plural wrapper so the catalog parity check holds.
      finalReadyNoDate:
        "{edited, plural, other {# Foto edit}} · {print, plural, other {# Foto cetak}}",
      subtitleNoPhotos: "Belum ada foto · fotografer belum menambahkan foto. Coba lagi nanti.",
      pickTitle: "Pilih foto",
      pickDescription:
        "Satu baris untuk tiap bagian paket Anda. Pilih dan kirim tiap bagian sendiri.",
      actionStart: "Mulai memilih",
      actionContinue: "Lanjut memilih",
      actionView: "Lihat pilihan",
    },
  },
} as const;
