// Source: copy-deck.md §14.2 "Client selections" for the note sheet; no deck row exists for the note copy yet. Rows marked PROPOSED are listed in copy-deck.md §14.4.
export const PICK_NOTE_COPY_NAMESPACE = "pickNote";

export const PICK_NOTE_COPY = {
  namespace: PICK_NOTE_COPY_NAMESPACE,
  surface: "gallery",
  messages: {
    en: {
      // PROPOSED (pending Owner review)
      title: "Note for {fileName}",
      // PROPOSED (pending Owner review)
      description: "Optional. Write what you’d like your photographer to change in this photo.",
      // PROPOSED (pending Owner review)
      pickedFor: "Picked for {groupName}",
      // PROPOSED (pending Owner review)
      label: "Note",
      // PROPOSED (pending Owner review)
      helper: "Optional · {count}/{max}",
      // PROPOSED (pending Owner review)
      save: "Save note",
      // PROPOSED (pending Owner review): client-side length check and server refusals
      tooLong: "Notes can be up to {max} characters.",
      // PROPOSED (pending Owner review)
      failed: "The note wasn’t saved. Try again.",
      // PROPOSED (pending Owner review)
      rateLimited: "Too many changes. Try again in a moment.",
    },
    id: {
      title: "Catatan untuk {fileName}",
      description: "Opsional. Tulis apa yang ingin diubah fotografer dari foto ini.",
      pickedFor: "Dipilih untuk {groupName}",
      label: "Catatan",
      helper: "Opsional · {count}/{max}",
      save: "Simpan catatan",
      tooLong: "Catatan paling banyak {max} karakter.",
      failed: "Catatan belum tersimpan. Coba lagi.",
      rateLimited: "Terlalu banyak perubahan, coba lagi sebentar.",
    },
  },
} as const;
