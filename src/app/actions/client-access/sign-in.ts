"use server";

import { signInGalleryEntry } from "@/composition/gallery/client-access-flow/client-access-flow";
import type { ClientSignInInput } from "@/features/gallery/application/schemas/client-sign-in/client-sign-in.types";
import type { ClientSignInActionResult } from "@/features/gallery/application/use-cases/sign-in-gallery/sign-in-gallery.types";

export async function signInGalleryAction(
  token: string,
  values: ClientSignInInput,
): Promise<ClientSignInActionResult> {
  return signInGalleryEntry(token, values);
}
