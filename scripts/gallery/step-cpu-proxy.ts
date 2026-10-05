// F-09 R5, not shipped: a LOCAL proxy for the variable CPU of one sync step (ADR-018 point 2). It
// times, with process.cpuUsage, (1) the Drive list parse with Zod, the walker and the cursor JSON,
// and (2) building the 500-row photo upsert statement. It is NOT a Workers measurement: V8 on a
// laptop is faster than a Workers isolate, and the request's fixed cost (session, database
// connection, render) is not included; that was measured on a Workers preview (ADR-018).
import { Pool } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";

import { galleryPhoto } from "@/adapters/db/schema/gallery/gallery";
import { driveListSchema } from "@/adapters/source/google-drive-provider/google-drive-provider.schema";
import type { FolderListing } from "@/features/gallery/domain/sync-plan/sync-plan.types";
import { startCursor, walkStep } from "@/features/gallery/domain/sync-step/sync-step";

const SIZES = [100, 250, 500, 1000, 2000, 3000];

function listing(entries: number): string {
  const files = Array.from({ length: entries }, (_, i) => ({
    id: `1AbCdEfGhIjKlMnOpQrStUvWx${String(i).padStart(6, "0")}`,
    name: `IMG_${String(i).padStart(6, "0")}.jpg`,
    mimeType: "image/jpeg",
  }));
  return JSON.stringify({ files });
}

async function oneStep(entries: number): Promise<number> {
  const raw = listing(entries);
  const before = process.cpuUsage();
  const list = (): Promise<FolderListing> => {
    const parsed = driveListSchema.parse(JSON.parse(raw));
    return Promise.resolve({
      ok: true,
      entries: parsed.files.map((f) => ({ ...f, resourceKey: null })),
      nextPageToken: null,
    });
  };
  const step = await walkStep(list, startCursor({ folderId: "root", resourceKey: null }, "x"));
  if (!step.ok) throw new Error("step failed");
  JSON.stringify(step.cursor);
  const used = process.cpuUsage(before);
  return (used.user + used.system) / 1000;
}

const db = drizzle(new Pool({ connectionString: "postgres://user:pass@localhost/none" }));

function photoRows(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    workspaceId: crypto.randomUUID(),
    galleryId: crypto.randomUUID(),
    gallerySourceId: crypto.randomUUID(),
    externalFileId: `1AbCdEfGhIjKlMnOpQrStUvWx${String(i)}`,
    fileName: `IMG_${String(i)}.jpg`,
    mimeType: "image/jpeg",
    nameSortKey: `img_${String(i)}`,
    kind: "PROOF",
  }));
}

function upsertBuildCost(rows: number): number {
  const before = process.cpuUsage();
  db.insert(galleryPhoto)
    .values(photoRows(rows))
    .onConflictDoUpdate({
      target: [galleryPhoto.gallerySourceId, galleryPhoto.externalFileId],
      set: { fileName: sql`excluded.file_name` },
    })
    .returning({ id: galleryPhoto.id })
    .toSQL();
  const used = process.cpuUsage(before);
  return (used.user + used.system) / 1000;
}

function reportUpsert(): void {
  for (const rows of [100, 500]) {
    for (let warm = 0; warm < 3; warm += 1) upsertBuildCost(rows);
    const runs = Array.from({ length: 15 }, () => upsertBuildCost(rows)).sort((a, b) => a - b);
    console.log(`upsert of ${String(rows)} rows: median ${runs[7].toFixed(1)} ms CPU to build`);
  }
}

async function main(): Promise<void> {
  for (const entries of SIZES) {
    for (let warm = 0; warm < 3; warm += 1) await oneStep(entries);
    const runs: number[] = [];
    for (let n = 0; n < 15; n += 1) runs.push(await oneStep(entries));
    runs.sort((a, b) => a - b);
    const median = runs[7];
    console.log(
      `${String(entries).padStart(5)} entries: median ${median.toFixed(1)} ms CPU (${((median / entries) * 1000).toFixed(1)} ms per 1,000)`,
    );
  }
}

main()
  .then(reportUpsert)
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "failed");
    process.exitCode = 1;
  });
