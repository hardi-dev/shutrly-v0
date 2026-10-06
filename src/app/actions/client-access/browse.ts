"use server";

import type { SignedOut } from "@/composition/gallery/client-gallery-flow/client-gallery-flow";
import { browseClientPhotosEntry } from "@/composition/gallery/client-gallery-flow/client-gallery-flow";
import type { ClientBrowsePageView } from "@/features/gallery/application/use-cases/browse-client-photos/browse-client-photos.types";

export async function browseClientPhotosAction(
  token: string,
  query: unknown,
): Promise<ClientBrowsePageView | SignedOut> {
  return browseClientPhotosEntry(token, query);
}
