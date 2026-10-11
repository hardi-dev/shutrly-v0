// Source: copy-deck.md §3 'Page/section title'. Copied verbatim.
import type { CopyModule } from "@/composition/locale/message-catalog/message-catalog.types";

export const PROFILE_LAYOUT_COPY_NAMESPACE = "ownerProfileLayout";

export const PROFILE_LAYOUT_COPY: CopyModule = {
  namespace: PROFILE_LAYOUT_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      title: "Profile",
    },
    id: {
      title: "Profil",
    },
  },
};
