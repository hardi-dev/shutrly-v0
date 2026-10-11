// Source: copy-deck.md §14.2 "Client selections" (usage line, "All photos" from §1). Shared by the client gallery screens.
// Rows marked PROPOSED have no deck row yet; they are listed in copy-deck.md §14.4 for Owner review.
export const CLIENT_COPY_NAMESPACE = "galleryClient";

export const CLIENT_COPY = {
  namespace: CLIENT_COPY_NAMESPACE,
  surface: "gallery",
  messages: {
    en: {
      // PROPOSED (pending Owner review)
      home: "Home",
      allPhotos: "All photos",
      // PROPOSED (pending Owner review)
      finalDelivery: "Final photos",
      // PROPOSED (pending Owner review)
      groupStatusOpen: "Open",
      groupStatusSubmitted: "Submitted",
      groupStatusLocked: "Locked",
      // PROPOSED (pending Owner review)
      defaultUnit: "photos",
      usageOpen: "{usage} of {limit} {unit} selected",
      // PROPOSED (pending Owner review)
      usageReview: "{usage} of {limit} {unit} · {remaining} left",
      // PROPOSED (pending Owner review)
      usageSubmitted: "{usage} {unit} submitted · waiting for your photographer",
      // PROPOSED (pending Owner review)
      usageLocked: "{usage} {unit} · locked by your photographer",
    },
    id: {
      home: "Beranda",
      allPhotos: "Semua foto",
      finalDelivery: "Hasil akhir",
      groupStatusOpen: "Terbuka",
      groupStatusSubmitted: "Dikirim",
      groupStatusLocked: "Dikunci",
      defaultUnit: "foto",
      usageOpen: "{usage} dari {limit} {unit} dipilih",
      usageReview: "{usage} dari {limit} {unit} · sisa {remaining}",
      usageSubmitted: "{usage} {unit} dikirim · menunggu fotografer",
      usageLocked: "{usage} {unit} · dikunci fotografer",
    },
  },
} as const;
