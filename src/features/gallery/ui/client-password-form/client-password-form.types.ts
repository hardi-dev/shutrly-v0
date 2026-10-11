import type { useTranslations } from "next-intl";

import type { ClientSignInInput } from "@/features/gallery/application/schemas/client-sign-in/client-sign-in.types";
import type { ClientSignInActionResult } from "@/features/gallery/application/use-cases/sign-in-gallery/sign-in-gallery.types";

export interface ClientPasswordFormProps {
  /** The sign-in server action; it redirects on success. */
  readonly action: (values: ClientSignInInput) => Promise<ClientSignInActionResult>;
}

/** The password form translate function, passed into helpers that run outside a component. */
export type PasswordTranslate = ReturnType<typeof useTranslations>;
