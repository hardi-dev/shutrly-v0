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
    publishAction: vi.fn(),
    setExpiryAction: vi.fn(),
    rotatePasswordAction: vi.fn(),
    deleteSourceAction: vi.fn(),
    renameSourceAction: vi.fn(),
    folderMappingAction: vi.fn(() => Promise.resolve({ folders: [], items: [], mappings: [] })),
    setFolderMappingAction: vi.fn(),
    archiveAction: vi.fn(),
    deleteDraftAction: vi.fn(),
    ...overrides,
  };
}
