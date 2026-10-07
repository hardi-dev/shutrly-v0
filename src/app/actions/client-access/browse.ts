"use server";

import type { SignedOut } from "@/composition/gallery/client-gallery-flow/client-gallery-flow";
import {
  browseClientPhotosEntry,
  listProofDownloadsEntry,
} from "@/composition/gallery/client-gallery-flow/client-gallery-flow";
import type { ClientBrowsePageView } from "@/features/gallery/application/use-cases/browse-client-photos/browse-client-photos.types";
import type { ProofDownloadView } from "@/features/gallery/application/use-cases/list-proof-downloads/list-proof-downloads.types";

export async function browseClientPhotosAction(
  token: string,
  query: unknown,
): Promise<ClientBrowsePageView | SignedOut> {
  return browseClientPhotosEntry(token, query);
}

export async function listProofDownloadsAction(
  token: string,
): Promise<readonly ProofDownloadView[] | SignedOut> {
  return listProofDownloadsEntry(token);
}
