import type { DriveFolderLinkResult } from "./drive-folder-link.types";

export const DRIVE_FOLDER_ID_PATTERN = /^[\w-]{10,200}$/;
export const DRIVE_LINK_MAX_LENGTH = 2048;
const DRIVE_HOSTS = ["drive.google.com", "docs.google.com"];
const FOLDER_PATH = /^\/drive(?:\/u\/\d+)?\/folders\/([^/]+)\/?$/;

function toUrl(text: string): URL | null {
  try {
    return new URL(text.trim());
  } catch {
    return null;
  }
}

function folderIdOf(url: URL): string | null {
  const match = FOLDER_PATH.exec(url.pathname);
  if (match) return match[1];
  if (url.pathname === "/open") return url.searchParams.get("id");
  return null;
}

/** Reads the folder ID and optional resource key from a Drive folder link (BR-SRC-002, AC-GAL-009). @param text - the pasted link @returns the folder reference, NOT_DRIVE or NOT_A_FOLDER */
export function parseDriveFolderLink(text: string): DriveFolderLinkResult {
  const url = toUrl(text);
  if (!url || url.protocol !== "https:" || !DRIVE_HOSTS.includes(url.hostname)) {
    return { ok: false, code: "NOT_DRIVE" };
  }
  const folderId = folderIdOf(url);
  if (folderId === null || !DRIVE_FOLDER_ID_PATTERN.test(folderId)) {
    return { ok: false, code: "NOT_A_FOLDER" };
  }
  return { ok: true, folderId, resourceKey: url.searchParams.get("resourcekey") };
}
export const GALLERY_SOURCE_LABEL_MAX = 60;

/** Builds the Owner-only *Buka di Google Drive* link of a file (D-11, BR-SRC-003 covers client responses only). @param fileId - the Drive file ID @param resourceKey - the file's resource key, if any @returns the Drive viewer URL */
export function driveFileUrl(fileId: string, resourceKey: string | null): string {
  const base = `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view`;
  return resourceKey === null ? base : `${base}?resourcekey=${encodeURIComponent(resourceKey)}`;
}
