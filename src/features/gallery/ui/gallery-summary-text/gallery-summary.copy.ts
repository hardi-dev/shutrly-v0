// Source: copy-deck.md §10.1 (gallery card status and photo summary) and §15 (owner gallery summaries). Copied verbatim where a row exists.
// Rows marked PROPOSED have no deck row yet; they are listed in copy-deck.md §15.x for Owner review.
export const GALLERY_SUMMARY_COPY_NAMESPACE = "ownerGallerySummary";

export const GALLERY_SUMMARY_COPY = {
  namespace: GALLERY_SUMMARY_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      // PROPOSED (pending Owner review): one group's usage on the card, *name used/limit*.
      groupUsage: "{name} {usage}/{limit}",
      // PROPOSED (pending Owner review): the selection state words of the card row.
      allLocked: "all locked",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      allLockedMobile: "All groups locked",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      sent: "{count, plural, one {# sent} other {# sent}}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      sentMobile: "{count, plural, one {# group sent} other {# groups sent}}",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      open: "open",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      openMobile: "The client is choosing",
      // PROPOSED (pending Owner review): one package item's count on the card, *count name*.
      item: "{count} {name}",
      // PROPOSED (pending Owner review): the final delivery row's meta.
      ready: "{files} ready",
      // PROPOSED (pending Owner review): no deck row yet; see copy-deck.md section 15.x.
      readyMobile: "Ready to publish",
      // PROPOSED (pending Owner review): the published row's meta, from the Published status (§10.1).
      published: "Published {when}",
    },
    id: {
      groupUsage: "{name} {usage}/{limit}",
      allLocked: "semua dikunci",
      allLockedMobile: "Semua grup dikunci",
      sent: "{count, plural, other {# dikirim}}",
      sentMobile: "{count, plural, other {# grup dikirim}}",
      open: "terbuka",
      openMobile: "Klien sedang memilih",
      item: "{count} {name}",
      ready: "{files} siap",
      readyMobile: "Siap dipublikasikan",
      published: "Dipublikasikan {when}",
    },
  },
} as const;
