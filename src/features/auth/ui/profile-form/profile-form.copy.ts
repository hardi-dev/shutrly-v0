// DECK GAP: no §3 pending row for 'saving'. Source: copy-deck.md §3. 'saving' reuses the §2.5 pending CTA ('Saving…' / 'Menyimpan…') because §3 has no pending row; reported as a derived string.
export const PROFILE_FORM_COPY_NAMESPACE = "authProfileForm";

export const PROFILE_FORM_COPY = {
  namespace: PROFILE_FORM_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      email: "Email address",
      name: "Display name",
      save: "Save changes",
      saving: "Saving…",
      saved: "Profile updated.",
    },
    id: {
      email: "Alamat email",
      name: "Nama tampilan",
      save: "Simpan perubahan",
      saving: "Menyimpan…",
      saved: "Profil diperbarui.",
    },
  },
} as const;
