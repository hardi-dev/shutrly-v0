import { FakeDriveProvider } from "@tests/support/gallery/fake-drive-provider";
import { FakeGallerySourceRepository } from "@tests/support/gallery/fake-gallery-source-repository";
import { WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { vi } from "vitest";

import type { LockedGalleryState } from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";

export const GALLERY_ID = "gallery-1";
export const DRIVE_SOURCE_ID = "66666666-6666-4666-8666-666666666666";

/** A draft gallery on a booked project, the active *Google Drive* source and the fixture Drive. */
export function sourceSetup(gallery: Partial<LockedGalleryState> = {}) {
  const sources = new FakeGallerySourceRepository();
  sources.addGallery(WORKSPACE.workspaceId, {
    galleryId: GALLERY_ID,
    status: "DRAFT",
    expiresAt: null,
    expiryDays: null,
    projectStatus: "BOOKED",
    ...gallery,
  });
  sources.activeWorkspaceSources.add(DRIVE_SOURCE_ID);
  const provider = FakeDriveProvider.withFixture();
  const rateLimiter = {
    hit: vi.fn(() => Promise.resolve(true)),
    peek: vi.fn(() => Promise.resolve(true)),
  };
  const deps = { sources, provider, rateLimiter, now: new Date("2026-10-04T03:00:00Z") };
  return { sources, provider, rateLimiter, deps };
}
