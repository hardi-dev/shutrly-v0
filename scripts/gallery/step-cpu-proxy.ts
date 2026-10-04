// F-09 R5, not shipped: a LOCAL proxy for the CPU of one sync step (ADR-018 point 2). It times the
// pure work of a step (parse of Drive list pages with Zod, the walker, JSON of the cursor) with
// process.cpuUsage. It is NOT a Workers measurement: V8 on a laptop is faster than a Workers
// isolate, and DB and TLS work are not included.
import { driveListSchema } from "@/adapters/source/google-drive-provider/google-drive-provider.schema";
import type { FolderListing } from "@/features/gallery/domain/sync-plan/sync-plan.types";
import { startCursor, walkStep } from "@/features/gallery/domain/sync-step/sync-step";

const PAGE = 1000;

function page(offset: number): string {
  const files = Array.from({ length: PAGE }, (_, i) => ({
    id: `1AbCdEfGhIjKlMnOpQrStUvWx${String(offset + i).padStart(6, "0")}`,
    name: `IMG_${String(offset + i).padStart(6, "0")}.jpg`,
    mimeType: "image/jpeg",
  }));
  return JSON.stringify({ files, nextPageToken: "tok" });
}

async function oneStep(pages: number): Promise<number> {
  const raw = Array.from({ length: pages }, (_, n) => page(n * PAGE));
  const before = process.cpuUsage();
  let calls = 0;
  const list = (): Promise<FolderListing> => {
    const parsed = driveListSchema.parse(JSON.parse(raw[calls]));
    calls += 1;
    return Promise.resolve({
      ok: true,
      entries: parsed.files.map((f) => ({ ...f, resourceKey: null })),
      nextPageToken: calls < pages ? "tok" : null,
    });
  };
  const step = await walkStep(list, startCursor({ folderId: "root", resourceKey: null }, "x"));
  if (!step.ok) throw new Error("step failed");
  JSON.stringify(step.cursor);
  const used = process.cpuUsage(before);
  return (used.user + used.system) / 1000;
}

async function main(): Promise<void> {
  for (const pages of [1, 3]) {
    await oneStep(pages);
    const runs: number[] = [];
    for (let n = 0; n < 7; n += 1) runs.push(await oneStep(pages));
    runs.sort((a, b) => a - b);
    console.log(
      `${String(pages * PAGE)} entries: median ${runs[3].toFixed(1)} ms CPU, max ${runs[6].toFixed(1)} ms`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "failed");
  process.exitCode = 1;
});
