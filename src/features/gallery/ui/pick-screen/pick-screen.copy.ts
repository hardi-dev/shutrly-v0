// Source: copy-deck.md §14.2 "Client selections" (usage, allowance and selection wording); the rest has no deck row yet. Rows marked PROPOSED are listed in copy-deck.md §14.4.
// The client's shared copy (Beranda, Semua foto) and the browse failure copy are read through the re-exports below.
export const PICK_COPY_NAMESPACE = "pickScreen";

export { CLIENT_BROWSE_COPY_NAMESPACE as PICK_BROWSE_NAMESPACE } from "../client-browse-screen/client-browse-screen.copy";
export { CLIENT_COPY_NAMESPACE as PICK_SHARED_NAMESPACE } from "../client-copy/client-copy.copy";

export const PICK_COPY = {
  namespace: PICK_COPY_NAMESPACE,
  surface: "gallery",
  messages: {
    en: {
      // PROPOSED (pending Owner review)
      subtitle: "Choose up to {limit} {unit}.",
      // PROPOSED (pending Owner review)
      subtitleQuantity: "Choose up to {limit} {unit}. Set the quantities in Review.",
      // PROPOSED (pending Owner review)
      review: "Review",
      // PROPOSED (pending Owner review)
      cardTitle: "Photos",
      // PROPOSED (pending Owner review)
      cardMeta: "{total, plural, one {# photo} other {# photos}} · tap a photo to pick it",
      // PROPOSED (pending Owner review): the segmented control's accessible name
      filterLabel: "Show photos",
      filterAll: "All photos",
      // PROPOSED (pending Owner review)
      filterPicked: "Picked",
      // PROPOSED (pending Owner review)
      limitTitle: "Pick limit reached",
      // PROPOSED (pending Owner review)
      limitBody: "{name} already has {usage} of {limit}. Remove one photo to pick another.",
      // PROPOSED (pending Owner review)
      quantity: "× {quantity}",
      // PROPOSED (pending Owner review)
      otherGroupQuantity: "{name} × {quantity}",
      markerJoin: " · ",
      // PROPOSED (pending Owner review)
      note: "Note",
      // PROPOSED (pending Owner review)
      noteAdd: "Add a note for {fileName}",
      // PROPOSED (pending Owner review)
      noteEdit: "Edit the note for {fileName}",
      // PROPOSED (pending Owner review)
      pickedEmptyTitle: "No photos picked yet",
      // PROPOSED (pending Owner review)
      pickedEmptyBody: "Tap photos under All photos to pick them.",
      // PROPOSED (pending Owner review)
      rateLimited: "Too many changes. Try again in a moment.",
      // PROPOSED (pending Owner review): a refused pick never names the reason (TD › Error Handling)
      refused: "This photo can’t be picked.",
      // PROPOSED (pending Owner review): the request failed, the pick was undone
      failed: "The pick wasn’t saved. Try again.",
    },
    id: {
      subtitle: "Pilih hingga {limit} {unit}.",
      subtitleQuantity: "Pilih hingga {limit} {unit}. Atur jumlahnya di Tinjau.",
      review: "Tinjau",
      cardTitle: "Foto",
      cardMeta: "{total, plural, other {# foto}} · ketuk foto untuk memilih",
      filterLabel: "Tampilkan foto",
      filterAll: "Semua foto",
      filterPicked: "Dipilih",
      limitTitle: "Batas pilihan tercapai",
      limitBody: "{name} sudah {usage} dari {limit}. Lepas satu foto untuk memilih yang lain.",
      quantity: "× {quantity}",
      otherGroupQuantity: "{name} × {quantity}",
      markerJoin: " · ",
      note: "Catatan",
      noteAdd: "Tambah catatan untuk {fileName}",
      noteEdit: "Ubah catatan untuk {fileName}",
      pickedEmptyTitle: "Belum ada foto dipilih",
      pickedEmptyBody: "Ketuk foto di Semua foto untuk memilih.",
      rateLimited: "Terlalu banyak perubahan, coba lagi sebentar.",
      refused: "Foto ini tidak bisa dipilih.",
      failed: "Pilihan belum tersimpan. Coba lagi.",
    },
  },
} as const;
