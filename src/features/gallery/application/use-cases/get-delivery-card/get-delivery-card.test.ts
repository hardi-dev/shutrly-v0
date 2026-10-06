import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type { DeliveryFacts } from "../../ports/delivery-reader/delivery-reader.port";
import { getDeliveryCard } from "./get-delivery-card";

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };
const NOW = new Date("2026-10-07T10:00:00Z");
const GALLERY = {
  status: "PUBLISHED",
  expiresAt: null,
  finalDeliveryPublishedAt: null,
  editedCount: 24,
  printCount: 6,
} as const;
const FACTS: DeliveryFacts = {
  projectTitle: "Wisuda Rina",
  projectStatus: "POST_PROCESSING",
  completedAt: null,
  gallery: GALLERY,
};

const run = (facts: DeliveryFacts | null) =>
  getDeliveryCard(
    { reader: { findFacts: vi.fn(() => Promise.resolve(facts)) }, now: NOW },
    CONTEXT,
    "p",
  );

describe("getDeliveryCard (hasilakhirowner-kartu)", () => {
  it("B: ready with the finished-file counts, no Tandai selesai", async () => {
    expect(await run(FACTS)).toMatchObject({
      state: "READY",
      editedCount: 24,
      printCount: 6,
      canComplete: false,
    });
  });

  it("AC-DEL-007 C: published on a delivered project offers Tandai selesai", async () => {
    const at = new Date("2026-10-05T10:10:00Z");
    const card = await run({
      ...FACTS,
      projectStatus: "DELIVERED",
      gallery: { ...GALLERY, finalDeliveryPublishedAt: at },
    });
    expect(card).toMatchObject({
      state: "PUBLISHED",
      publishedAt: at.toISOString(),
      canComplete: true,
    });
  });

  it("E: an expired gallery is not active", async () => {
    const card = await run({
      ...FACTS,
      gallery: { ...GALLERY, expiresAt: new Date("2026-10-01T00:00:00Z") },
    });
    expect(card.state).toBe("GALLERY_INACTIVE");
  });

  it("C-101 another workspace's project is not found", async () => {
    await expect(run(null)).rejects.toThrow(GalleryError);
  });
});
