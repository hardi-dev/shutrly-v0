import "server-only";

import type { ServeClientFileResult } from "@/features/gallery/application/use-cases/serve-client-file/serve-client-file.types";

type ServedFile = Extract<ServeClientFileResult, { ok: true }>;

/** `attachment` with the original name: an ASCII fallback plus the exact UTF-8 name (RFC 6266). @param fileName - the file's name @returns the header value */
function attachment(fileName: string): string {
  const ascii = fileName.replace(/[^\x20-\x7e]|["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

/**
 * The headers of a finished-file download: the upstream type, the original name as an attachment,
 * never cached anywhere (D-18, BR-ACC-005).
 * @param file - the served file
 * @returns the response headers
 */
export function clientFileHeaders(file: ServedFile): Record<string, string> {
  const headers: Record<string, string> = {
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Type": file.contentType,
    "Content-Disposition": attachment(file.fileName),
  };
  if (file.contentLength) headers["Content-Length"] = file.contentLength;
  return headers;
}
