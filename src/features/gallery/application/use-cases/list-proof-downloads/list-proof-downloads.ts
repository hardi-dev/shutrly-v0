import "server-only";

import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import type { ListProofDownloadsDeps, ProofDownloadView } from "./list-proof-downloads.types";

/**
 * Lists every proof of the signed-in client's gallery for *Unduh semua*, across all folders; the
 * download route serves the originals (F-19, Owner 2026-10-07; BR-ACC-005: no folder link or ID).
 * @param deps - the client reader
 * @param client - the signed-in client context
 * @returns the files with their download URLs
 */
export async function listProofDownloads(
  deps: ListProofDownloadsDeps,
  client: ClientContext,
): Promise<readonly ProofDownloadView[]> {
  const files = await deps.reader.listProofFiles(
    { workspaceId: client.workspaceId },
    client.galleryId,
  );
  return files.map((file) => ({
    id: file.id,
    fileName: file.fileName,
    downloadUrl: `/g/${client.token}/download/${file.id}`,
  }));
}
