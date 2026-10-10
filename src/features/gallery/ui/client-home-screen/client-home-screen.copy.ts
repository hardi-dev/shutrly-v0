export const CLIENT_HOME_COPY = {
  greeting: (firstName: string) => `Halo, ${firstName}`,
  subtitleStart: "Pilih foto untuk paket Anda, lalu kirim ke fotografer.",
  subtitlePartly: (sent: string, open: string) => `${sent} sudah dikirim. Tinggal ${open}.`,
  // not in Pencil
  subtitleAllSent: "Semua pilihan sudah dikirim. Fotografer akan mengabari Anda.",
  subtitleDelivered: "Foto Anda sudah selesai diedit.",
  // not in Pencil: a project with no selection item, after final delivery
  subtitleNoGroups: "Lihat semua foto Anda.",
  listJoin: " dan ",
  finalReadyTitle: "Hasil akhir siap",
  finalReadyBody: (edited: number, print: number) =>
    `${String(edited)} foto edit dan ${String(print)} foto cetak. Unduh satu per satu, beberapa, atau semuanya.`,
  finalReadyAction: "Lihat & unduh",
  photosTitle: "Foto Anda",
  photosDescription: "Lihat semua foto, lalu unduh hasil akhir saat sudah siap.",
  photosDescriptionDelivered: "Lihat semua foto pratinjau dari sesi Anda.",
  allPhotosMeta: (count: number) => `${String(count)} foto · lihat-lihat dan pilih dari pratinjau`,
  // not in Pencil: no groups to pick for
  allPhotosMetaNoGroups: (count: number) => `${String(count)} foto · lihat-lihat pratinjau`,
  finalPendingMeta: "Belum tersedia · muncul di sini setelah foto selesai diedit.",
  pickTitle: "Pilih foto",
  pickDescription: "Satu baris untuk tiap bagian paket Anda. Pilih dan kirim tiap bagian sendiri.",
  actions: { START: "Mulai memilih", CONTINUE: "Lanjut memilih", VIEW: "Lihat pilihan" },
} as const;
