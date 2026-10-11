// Source: copy-deck.md §14.2 "Client selections" (usage and allowance wording); the viewer pick copy has no deck row yet. Rows marked PROPOSED are listed in copy-deck.md §14.4.
export const VIEWER_PICK_COPY_NAMESPACE = "viewerPick";

export { CLIENT_COPY_NAMESPACE as VIEWER_SHARED_NAMESPACE } from "../client-copy/client-copy.copy";

export const VIEWER_PICK_COPY = {
  namespace: VIEWER_PICK_COPY_NAMESPACE,
  surface: "gallery",
  messages: {
    en: {
      // PROPOSED (pending Owner review)
      pickFor: "Pick for…",
      // PROPOSED (pending Owner review)
      note: "Note",
      // PROPOSED (pending Owner review)
      noteLabel: "Note for {fileName} in {groupName}",
      // PROPOSED (pending Owner review)
      usage: "{usage} of {limit} {unit}",
      // PROPOSED (pending Owner review)
      hintOpen: "tap to pick",
      // PROPOSED (pending Owner review)
      hintPicked: "already picked",
      // PROPOSED (pending Owner review)
      hintPickedQuantity: "already picked × {quantity}",
      descriptionJoin: " · ",
      // PROPOSED (pending Owner review)
      sheetMeta: "{fileName} · saved automatically",
      sheetCount: "{usage}/{limit}",
      // PROPOSED (pending Owner review)
      pickedIn: "Picked in: {entries}",
      // PROPOSED (pending Owner review)
      pickedQuantity: "{name} × {quantity}",
      // PROPOSED (pending Owner review)
      pickedWithNote: "{entry} · has a note",
      entriesJoin: ", ",
      // PROPOSED (pending Owner review)
      limitReached: "Pick limit reached",
      // PROPOSED (pending Owner review)
      groupClosed: "Picks already sent",
      // PROPOSED (pending Owner review)
      rateLimited: "Too many changes. Try again in a moment.",
      // PROPOSED (pending Owner review): a refused pick never names the reason (TD › Error Handling)
      refused: "This photo can’t be picked.",
      // PROPOSED (pending Owner review)
      failed: "The pick wasn’t saved. Try again.",
    },
    id: {
      pickFor: "Pilih untuk…",
      note: "Catatan",
      noteLabel: "Catatan untuk {fileName} di {groupName}",
      usage: "{usage} dari {limit} {unit}",
      hintOpen: "ketuk untuk memilih",
      hintPicked: "sudah dipilih",
      hintPickedQuantity: "sudah dipilih × {quantity}",
      descriptionJoin: " · ",
      sheetMeta: "{fileName} · tersimpan otomatis",
      sheetCount: "{usage}/{limit}",
      pickedIn: "Dipilih di: {entries}",
      pickedQuantity: "{name} × {quantity}",
      pickedWithNote: "{entry} · ada catatan",
      entriesJoin: ", ",
      limitReached: "Batas pilihan tercapai",
      groupClosed: "Pilihan sudah dikirim",
      rateLimited: "Terlalu banyak perubahan, coba lagi sebentar.",
      refused: "Foto ini tidak bisa dipilih.",
      failed: "Pilihan belum tersimpan. Coba lagi.",
    },
  },
} as const;
