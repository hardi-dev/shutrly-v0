// Source: copy-deck.md §15 "Client access" (the card, its actions, notes and rotate-link dialog) and §10.2 "Client access". Copied verbatim.
// Rows marked PROPOSED have no deck row yet; they are listed in copy-deck.md §15.x for Owner review.
import { GALLERY_COPY_NAMESPACE } from "../gallery-copy/gallery-copy.copy";

export const PROJECT_ACCESS_COPY_NAMESPACE = "projectAccess";
/** The gallery namespace, for the expiry fact the card shows (read through this sibling). */
export const PROJECT_ACCESS_GALLERY_NAMESPACE = GALLERY_COPY_NAMESPACE;

export const PROJECT_ACCESS_COPY = {
  namespace: PROJECT_ACCESS_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      title: "Client access",
      description: "Link and password for the client.",
      rotateLink: "Change link",
      rotatePassword: "Change password",
      link: "Link",
      password: "Password",
      expiry: "Expires",
      inactive: "Inactive",
      draftNote: "The client can’t open this link until the gallery is published.",
      archivedNote: "The gallery is archived. The link can’t be opened or changed.",
      dialogTitle: "Change the gallery link?",
      dialogDescription: "The old link will stop working.",
      dialogBody: "All shared links, including invoice links, will stop working.",
      dialogNote: "The password won’t change. Share the new link with the client.",
      cancel: "Cancel",
      copyLink: "Copy link",
      copyPassword: "Copy password",
      // PROPOSED (pending Owner review): the copy toast is shared by the link and the password.
      copied: "Copied",
      // PROPOSED (pending Owner review): the link copy failed; the password row (§10.1) covers only the password.
      copyFailedTitle: "Link couldn’t be copied",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      copyFailedBody:
        "The text is selected. Copy it with Ctrl+C or ⌘C, or press and hold, then Copy.",
      // PROPOSED (pending Owner review): the rotate toasts.
      rotatedToast: "New link ready. Share it with the client.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      cancelledToast: "The project was canceled, so the link can’t be changed.",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      failedToast: "Couldn’t change the link. Try again.",
    },
    id: {
      title: "Akses klien",
      description: "Link dan kata sandi untuk klien.",
      rotateLink: "Ganti link",
      rotatePassword: "Ganti kata sandi",
      link: "Link",
      password: "Kata sandi",
      expiry: "Kedaluwarsa",
      inactive: "Tidak aktif",
      draftNote: "Klien belum bisa membuka link ini sampai galeri dipublikasikan.",
      archivedNote: "Galeri diarsipkan. Link tidak bisa dibuka dan tidak bisa diganti.",
      dialogTitle: "Ganti link galeri?",
      dialogDescription: "Link lama berhenti bekerja.",
      dialogBody: "Semua link yang sudah dibagikan, termasuk link invoice, tidak bisa dibuka lagi.",
      dialogNote: "Kata sandi tidak berubah. Bagikan link baru ke klien.",
      cancel: "Batal",
      copyLink: "Salin link",
      copyPassword: "Salin kata sandi",
      copied: "Disalin",
      copyFailedTitle: "Link belum tersalin",
      copyFailedBody:
        "Teksnya sudah ditandai. Salin dengan Ctrl+C atau ⌘C, atau tekan lama lalu Salin.",
      rotatedToast: "Link baru siap. Bagikan ke klien.",
      cancelledToast: "Proyek dibatalkan, link tidak bisa diganti.",
      failedToast: "Gagal mengganti link. Coba lagi.",
    },
  },
} as const;
