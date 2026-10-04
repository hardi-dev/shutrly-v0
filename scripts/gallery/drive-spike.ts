// F-09 Slice 0 spike (plan R-1/R-2), not shipped: lists a public Drive folder tree with an API
// key and fetches one thumbnail without OAuth. Prints counts and timings only, never the key or
// a URL (C-103).
// Usage: GOOGLE_DRIVE_API_KEY=… pnpm exec tsx scripts/gallery/drive-spike.ts <folderId>
import { z } from "zod";

const DRIVE = "https://www.googleapis.com/drive/v3/files";
const FOLDER = "application/vnd.google-apps.folder";
const MAX_DEPTH = 5;

const fileSchema = z.object({ id: z.string(), name: z.string(), mimeType: z.string() });
const pageSchema = z.object({
  files: z.array(fileSchema).default([]),
  nextPageToken: z.string().optional(),
});
const thumbnailSchema = z.object({ thumbnailLink: z.string().optional() });

type DriveFile = z.infer<typeof fileSchema>;
type ListPage = z.infer<typeof pageSchema>;

interface QueuedFolder {
  id: string;
  depth: number;
}

interface WalkResult {
  calls: number;
  images: DriveFile[];
  ignored: number;
  tooDeep: number;
}

async function listPage(key: string, folderId: string, pageToken?: string): Promise<ListPage> {
  const params = new URLSearchParams({
    q: `'${folderId}' in parents and trashed=false`,
    pageSize: "1000",
    fields: "nextPageToken,files(id,name,mimeType,resourceKey,shortcutDetails/targetId)",
    key,
  });
  if (pageToken) params.set("pageToken", pageToken);
  const response = await fetch(`${DRIVE}?${params.toString()}`);
  if (!response.ok) throw new Error(`files.list failed with HTTP ${String(response.status)}`);
  return pageSchema.parse(await response.json());
}

function tally(result: WalkResult, queue: QueuedFolder[], parent: QueuedFolder, page: ListPage) {
  for (const file of page.files) {
    if (file.mimeType !== FOLDER) {
      if (file.mimeType.startsWith("image/")) result.images.push(file);
      else result.ignored += 1;
    } else if (parent.depth + 1 > MAX_DEPTH) result.tooDeep += 1;
    else queue.push({ id: file.id, depth: parent.depth + 1 });
  }
}

async function walk(key: string, rootId: string): Promise<WalkResult> {
  const result: WalkResult = { calls: 0, images: [], ignored: 0, tooDeep: 0 };
  const queue: QueuedFolder[] = [{ id: rootId, depth: 0 }];
  for (let next = queue.shift(); next; next = queue.shift()) {
    let pageToken: string | undefined;
    do {
      const page = await listPage(key, next.id, pageToken);
      result.calls += 1;
      tally(result, queue, next, page);
      pageToken = page.nextPageToken;
    } while (pageToken);
  }
  return result;
}

async function probeThumbnail(key: string, fileId: string): Promise<string> {
  const params = new URLSearchParams({ fields: "thumbnailLink", key });
  const meta = await fetch(`${DRIVE}/${fileId}?${params.toString()}`);
  if (!meta.ok) return `files.get HTTP ${String(meta.status)}`;
  const { thumbnailLink } = thumbnailSchema.parse(await meta.json());
  if (!thumbnailLink) return "no thumbnailLink";
  const host = new URL(thumbnailLink).hostname;
  const image = await fetch(thumbnailLink.replace(/=s\d+$/, "=s400"), { redirect: "manual" });
  const bytes = (await image.arrayBuffer()).byteLength;
  const type = image.headers.get("content-type") ?? "?";
  return `host *${host.slice(host.indexOf("."))} · HTTP ${String(image.status)} · ${type} · ${String(bytes)} B`;
}

async function main(key: string, folderId: string): Promise<void> {
  const started = performance.now();
  const tree = await walk(key, folderId);
  const seconds = ((performance.now() - started) / 1000).toFixed(1);
  console.log(`list calls: ${String(tree.calls)} · ${seconds} s`);
  console.log(`images: ${String(tree.images.length)} · ignored: ${String(tree.ignored)}`);
  console.log(`folders deeper than ${String(MAX_DEPTH)}: ${String(tree.tooDeep)}`);
  const first = tree.images.at(0);
  console.log(`thumbnail: ${first ? await probeThumbnail(key, first.id) : "no image"}`);
}

function fail(error: unknown): void {
  console.error(error instanceof Error ? error.message : "spike failed");
  process.exitCode = 1;
}

const [folderId] = process.argv.slice(2);
const key = process.env.GOOGLE_DRIVE_API_KEY;
if (!folderId || !key) {
  console.error("Usage: GOOGLE_DRIVE_API_KEY=… tsx scripts/gallery/drive-spike.ts <folderId>");
  process.exitCode = 2;
} else {
  main(key, folderId).catch(fail);
}
