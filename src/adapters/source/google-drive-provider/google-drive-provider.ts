import "server-only";

import type {
  DownloadResult,
  FolderInfo,
  GallerySourceProviderPort,
  ProviderFileRef,
  ThumbnailResult,
  ThumbnailSize,
} from "@/features/gallery/application/ports/gallery-source-provider/gallery-source-provider.port";
import type { DriveFolderRef } from "@/features/gallery/domain/drive-folder-link/drive-folder-link.types";
import { DRIVE_FOLDER_MIME } from "@/features/gallery/domain/sync-plan/sync-plan";
import type {
  FolderListing,
  ProviderFailureCode,
} from "@/features/gallery/domain/sync-plan/sync-plan.types";

import {
  driveErrorSchema,
  driveFileSchema,
  driveListSchema,
  driveThumbnailSchema,
} from "./google-drive-provider.schema";

const FILES = "https://www.googleapis.com/drive/v3/files";
const LIST_FIELDS = "nextPageToken,files(id,name,mimeType,resourceKey,shortcutDetails/targetId)";
const PAGE_SIZE = "1000";
const RATE_REASONS = ["rateLimitExceeded", "userRateLimitExceeded"];
const THUMB_HOST_SUFFIX = ".googleusercontent.com";
const SIZES: Readonly<Record<ThumbnailSize, string>> = { thumb: "=s400", preview: "=s1600" };
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_TOO_MANY = 429;

type Fetch = (url: string, init?: RequestInit) => Promise<Response>;
interface KeyedRef {
  readonly id: string;
  readonly resourceKey: string | null;
}
type DriveCall = { ok: true; json: unknown } | { ok: false; code: ProviderFailureCode };

function headersFor(refs: readonly KeyedRef[]): HeadersInit {
  const keys = refs.flatMap((ref) => (ref.resourceKey ? [`${ref.id}/${ref.resourceKey}`] : []));
  return keys.length === 0 ? {} : { "X-Goog-Drive-Resource-Keys": keys.join(",") };
}

async function failureOf(response: Response): Promise<ProviderFailureCode> {
  if (response.status === HTTP_TOO_MANY) return "RATE_LIMITED";
  if (response.status !== HTTP_FORBIDDEN && response.status !== HTTP_NOT_FOUND)
    return "UNAVAILABLE";
  const parsed = driveErrorSchema.safeParse(await response.json().catch(() => null));
  const reasons = parsed.success ? (parsed.data.error.errors ?? []).map((e) => e.reason) : [];
  return reasons.some((reason) => reason !== undefined && RATE_REASONS.includes(reason))
    ? "RATE_LIMITED"
    : "NOT_PUBLIC";
}

async function call(fetchFn: Fetch, url: string, headers: HeadersInit): Promise<DriveCall> {
  try {
    const response = await fetchFn(url, { headers });
    if (!response.ok) return { ok: false, code: await failureOf(response) };
    return { ok: true, json: await response.json() };
  } catch {
    // Network failures carry the URL (and so the key) in their message: never forward them.
    return { ok: false, code: "UNAVAILABLE" };
  }
}

function fileUrl(fileId: string, fields: string, key: string): string {
  const params = new URLSearchParams({ fields, supportsAllDrives: "true", key });
  return `${FILES}/${encodeURIComponent(fileId)}?${params.toString()}`;
}

async function getFolder(fetchFn: Fetch, key: string, folder: DriveFolderRef): Promise<FolderInfo> {
  const ref = { id: folder.folderId, resourceKey: folder.resourceKey };
  const result = await call(
    fetchFn,
    fileUrl(folder.folderId, "id,name,mimeType", key),
    headersFor([ref]),
  );
  if (!result.ok) return result;
  const file = driveFileSchema.safeParse(result.json);
  if (!file.success) return { ok: false, code: "UNAVAILABLE" };
  // A file link, or a file opened through open?id=, can't be listed as a folder.
  if (file.data.mimeType !== DRIVE_FOLDER_MIME) return { ok: false, code: "NOT_PUBLIC" };
  return { ok: true, name: file.data.name };
}

async function listFolder(
  fetchFn: Fetch,
  key: string,
  folder: DriveFolderRef,
  pageToken: string | null,
): Promise<FolderListing> {
  const params = new URLSearchParams({
    q: `'${folder.folderId}' in parents and trashed=false`,
    pageSize: PAGE_SIZE,
    fields: LIST_FIELDS,
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
    key,
  });
  if (pageToken !== null) params.set("pageToken", pageToken);
  const ref = { id: folder.folderId, resourceKey: folder.resourceKey };
  const result = await call(fetchFn, `${FILES}?${params.toString()}`, headersFor([ref]));
  if (!result.ok) return result;
  const page = driveListSchema.safeParse(result.json);
  if (!page.success) return { ok: false, code: "UNAVAILABLE" };
  const entries = page.data.files.map((file) => ({
    ...file,
    resourceKey: file.resourceKey ?? null,
  }));
  return { ok: true, entries, nextPageToken: page.data.nextPageToken ?? null };
}

function thumbnailUrl(link: string, size: ThumbnailSize): string | null {
  try {
    const url = new URL(link);
    if (url.protocol !== "https:" || !url.hostname.endsWith(THUMB_HOST_SUFFIX)) return null;
    return link.replace(/=s\d+$/, SIZES[size]);
  } catch {
    return null;
  }
}

async function thumbnail(
  fetchFn: Fetch,
  key: string,
  file: ProviderFileRef,
  size: ThumbnailSize,
): Promise<ThumbnailResult> {
  const ref = { id: file.fileId, resourceKey: file.resourceKey };
  const meta = await call(fetchFn, fileUrl(file.fileId, "thumbnailLink", key), headersFor([ref]));
  const parsed = meta.ok ? driveThumbnailSchema.safeParse(meta.json) : null;
  const link = parsed?.success ? parsed.data.thumbnailLink : undefined;
  const url = link === undefined ? null : thumbnailUrl(link, size);
  if (url === null) return { ok: false };
  try {
    // No redirects: a hop to another host could leak or serve something else (TD › Security).
    const image = await fetchFn(url, { redirect: "manual" });
    const contentType = image.headers.get("content-type") ?? "";
    if (!image.ok || !image.body || !contentType.startsWith("image/")) return { ok: false };
    return { ok: true, body: image.body, contentType };
  } catch {
    return { ok: false };
  }
}

/** Streams an original file through Drive v3 `alt=media`; the body is passed on, not buffered (F-10 D-18, spike R-1). @param fetchFn - fetch @param key - the API key @param file - the file and its resource key @returns the stream, or not ok */
async function download(
  fetchFn: Fetch,
  key: string,
  file: ProviderFileRef,
): Promise<DownloadResult> {
  const params = new URLSearchParams({ alt: "media", supportsAllDrives: "true", key });
  const url = `${FILES}/${encodeURIComponent(file.fileId)}?${params.toString()}`;
  try {
    const headers = headersFor([{ id: file.fileId, resourceKey: file.resourceKey }]);
    // No redirects: a hop to another host could serve something else (TD › Security).
    const response = await fetchFn(url, { headers, redirect: "manual" });
    if (!response.ok || !response.body) return { ok: false };
    return {
      ok: true,
      body: response.body,
      contentType: response.headers.get("content-type") ?? "application/octet-stream",
      contentLength: response.headers.get("content-length"),
    };
  } catch {
    // The error message would carry the URL with the key: never forward it.
    return { ok: false };
  }
}

/** Creates the Google Drive provider over Drive v3 with an API key; public folders only (ADR-005, D-6, D-10). @param apiKey - the Worker secret `GOOGLE_DRIVE_API_KEY` @param fetchFn - fetch, injectable for tests @returns the provider port */
export function createGoogleDriveProvider(
  apiKey: string,
  fetchFn: Fetch = fetch,
): GallerySourceProviderPort {
  return {
    getFolder: (folder) => getFolder(fetchFn, apiKey, folder),
    listFolder: (folder, pageToken) => listFolder(fetchFn, apiKey, folder, pageToken),
    thumbnail: (file, size) => thumbnail(fetchFn, apiKey, file, size),
    download: (file) => download(fetchFn, apiKey, file),
  };
}
