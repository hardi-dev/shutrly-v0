import { vi } from "vitest";

import type { GalleryPageActions } from "@/features/gallery/ui/gallery-actions/gallery-actions.types";

/** Mocked gallery page actions; pass the ones a test drives. */
export function fakePageActions(overrides: Partial<GalleryPageActions> = {}): GalleryPageActions {
  return {
    proposeAction: vi.fn(),
    checkFolderAction: vi.fn(),
    linkSourceAction: vi.fn(),
    syncSourceAction: vi.fn(),
    browseAction: vi.fn(),
    ...overrides,
  };
}
