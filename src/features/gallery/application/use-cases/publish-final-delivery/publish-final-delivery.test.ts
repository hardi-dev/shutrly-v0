import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type {
  GallerySourceWriter,
  LockedGalleryState,
} from "../../ports/gallery-source-repository/gallery-source-repository.port";
import { publishFinalDelivery } from "./publish-final-delivery";
import type { PublishFinalDeliveryDeps } from "./publish-final-delivery.types";

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };
const NOW = new Date("2026-10-07T10:00:00Z");
const GALLERY: LockedGalleryState = {
  galleryId: "g",
  status: "PUBLISHED",
  expiresAt: null,
  expiryDays: null,
  projectStatus: "POST_PROCESSING",
};

function setup(gallery: Partial<LockedGalleryState> | null, finished = 3) {
  const publish = vi.fn(() => Promise.resolve());
  const writer = {
    countFinishedFiles: vi.fn(() => Promise.resolve(finished)),
    publishFinalDelivery: publish,
  } as unknown as GallerySourceWriter;
  const sources = {
    findGalleryIdByProject: vi.fn(() => Promise.resolve(gallery ? "g" : null)),
    withLockedGallery: vi.fn(
      (_c: unknown, _g: string, work: (s: LockedGalleryState, w: GallerySourceWriter) => unknown) =>
        work({ ...GALLERY, ...gallery }, writer),
    ),
  };
  return { deps: { sources, now: NOW } as unknown as PublishFinalDeliveryDeps, publish };
}

describe("publishFinalDelivery (D-17, BR-DEL-003)", () => {
  it("AC-DEL-001 records final delivery with the actor and time", async () => {
    const { deps, publish } = setup({});
    expect(await publishFinalDelivery(deps, CONTEXT, "owner-1", "p")).toEqual({ ok: true });
    expect(publish).toHaveBeenCalledWith("owner-1", NOW);
  });

  it("AC-DEL-002 refuses without a finished file and writes nothing", async () => {
    const { deps, publish } = setup({}, 0);
    expect(await publishFinalDelivery(deps, CONTEXT, "o", "p")).toEqual({
      ok: false,
      reasons: ["NO_FINISHED_FILE"],
    });
    expect(publish).not.toHaveBeenCalled();
  });

  it("AC-DEL-002 refuses an expired gallery", async () => {
    const { deps } = setup({ expiresAt: new Date("2026-10-01T00:00:00Z") });
    expect(await publishFinalDelivery(deps, CONTEXT, "o", "p")).toEqual({
      ok: false,
      reasons: ["GALLERY_NOT_PUBLISHED"],
    });
  });

  it("A-17 a project without a gallery gets both reasons", async () => {
    const { deps } = setup(null);
    expect(await publishFinalDelivery(deps, CONTEXT, "o", "p")).toEqual({
      ok: false,
      reasons: ["NO_FINISHED_FILE", "GALLERY_NOT_PUBLISHED"],
    });
  });
});
