// Source: copy-deck.md §14.1 "Password entry" (title). The description carries the project and studio names and has no deck row yet (PROPOSED, copy-deck.md §14.4).
export const CLIENT_GATE_SCREEN_COPY_NAMESPACE = "clientGate";

export const CLIENT_GATE_SCREEN_COPY = {
  namespace: CLIENT_GATE_SCREEN_COPY_NAMESPACE,
  surface: "gallery",
  messages: {
    en: {
      title: "Open your gallery",
      // PROPOSED (pending Owner review)
      description:
        "{projectTitle} gallery from {studioName}. Your photographer sent the password with this link.",
    },
    id: {
      title: "Buka galerimu",
      description:
        "Galeri {projectTitle} dari {studioName}. Kata sandi dikirim fotografer bersama link ini.",
    },
  },
} as const;
