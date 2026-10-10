import type { ClientSignInInput } from "@/features/gallery/application/schemas/client-sign-in/client-sign-in.types";
import type { ClientSignInActionResult } from "@/features/gallery/application/use-cases/sign-in-gallery/sign-in-gallery.types";

export interface ClientPasswordFormProps {
  /** The sign-in server action; it redirects on success. */
  readonly action: (values: ClientSignInInput) => Promise<ClientSignInActionResult>;
}
