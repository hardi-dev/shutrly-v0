import "server-only";

import { notFound } from "next/navigation";
import { z } from "zod";

import type { ThumbnailSize } from "@/features/gallery/application/ports/gallery-source-provider/gallery-source-provider.port";
import { browseClientPhotos } from "@/features/gallery/application/use-cases/browse-client-photos/browse-client-photos";
import type { ClientBrowsePageView } from "@/features/gallery/application/use-cases/browse-client-photos/browse-client-photos.types";
import { getClientHome } from "@/features/gallery/application/use-cases/get-client-home/get-client-home";
import type { ClientHomeView } from "@/features/gallery/application/use-cases/get-client-home/get-client-home.types";
import { serveClientPhoto } from "@/features/gallery/application/use-cases/serve-client-photo/serve-client-photo";
import { logger } from "@/shared/logging/logger";

import { withSignedInClient } from "../client-gallery-scope/client-gallery-scope";
import type { ClientScopeResult } from "../client-gallery-scope/client-gallery-scope.types";

const SIZES: readonly ThumbnailSize[] = ["thumb", "preview"];
const photoIdSchema = z.uuid();

// F-09 D-10 / F-10 D-8: a short private browser cache, never a shared one (C-103).
export const CLIENT_MEDIA_HEADERS = {
  "Cache-Control": "private, max-age=600",
  "X-Content-Type-Options": "nosniff",
} as const;

/** A client action's answer once the session ended: the page reloads to the gate. */
export interface SignedOut {
  readonly kind: "SIGNED_OUT";
}

const SIGNED_OUT: SignedOut = { kind: "SIGNED_OUT" };
const ROOT_QUERY = { kind: "PROOF", sourceId: null, path: "", search: "", cursor: null };

/** What the *Semua foto* page loads on the server. */
export interface ClientBrowseLoad {
  readonly home: ClientHomeView;
  readonly firstPage: ClientBrowsePageView | null;
}

/** Loads Beranda (or the landing decision) for a client page (A-24, A-31). @param rawToken - the untrusted route token @returns the gate outcome with the home view */
export function loadClientHomeEntry(rawToken: string): Promise<ClientScopeResult<ClientHomeView>> {
  return withSignedInClient(rawToken, (client, scope) => getClientHome(scope, client));
}

/** Loads the *Semua foto* page: the landing decision for its breadcrumb and the root page; a failed first page becomes null so the page shows its retry state (A-31, D-15). @param rawToken - the untrusted route token @returns the gate outcome with both */
export function loadClientBrowseEntry(
  rawToken: string,
): Promise<ClientScopeResult<ClientBrowseLoad>> {
  return withSignedInClient(rawToken, async (client, scope) => {
    const home = await getClientHome(scope, client);
    try {
      return { home, firstPage: await browseClientPhotos(scope, client, ROOT_QUERY) };
    } catch {
      logger.error("client.browse_failed", { workspaceId: client.workspaceId });
      return { home, firstPage: null };
    }
  });
}

/** Reads one *Semua foto* page for the signed-in client (D-15, AC-ACC-011). @param rawToken - the untrusted route token @param query - untrusted browse query @returns the page, or SIGNED_OUT */
export async function browseClientPhotosEntry(
  rawToken: string,
  query: unknown,
): Promise<ClientBrowsePageView | SignedOut> {
  const result = await withSignedInClient(rawToken, (client, scope) =>
    browseClientPhotos(scope, client, query),
  );
  return result.kind === "SIGNED_IN" ? result.value : SIGNED_OUT;
}

/** Streams the image fallback for a photo the signed-in client may see; anything else is an empty 404 (D-15, AC-ACC-013). @param rawToken - the untrusted route token @param rawPhotoId - untrusted photo id @param rawSize - untrusted size @returns the image response */
export async function serveClientPhotoEntry(
  rawToken: string,
  rawPhotoId: string,
  rawSize: string,
): Promise<Response> {
  const size = SIZES.find((candidate) => candidate === rawSize);
  const photoId = photoIdSchema.safeParse(rawPhotoId);
  if (!size || !photoId.success) notFound();
  const result = await withSignedInClient(rawToken, async (client, scope) => {
    try {
      return await serveClientPhoto(scope, client, photoId.data, size);
    } catch {
      logger.error("client.media_failed", { workspaceId: client.workspaceId });
      return { ok: false } as const;
    }
  });
  if (result.kind !== "SIGNED_IN" || !result.value.ok) notFound();
  return new Response(result.value.body, {
    headers: { ...CLIENT_MEDIA_HEADERS, "Content-Type": result.value.contentType },
  });
}
