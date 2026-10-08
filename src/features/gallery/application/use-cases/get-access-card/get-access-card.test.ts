import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type { GalleryPasswordCipherPort } from "../../ports/gallery-password-cipher/gallery-password-cipher.port";
import type { GalleryRepositoryPort } from "../../ports/gallery-repository/gallery-repository.port";
import { getAccessCard } from "./get-access-card";

vi.mock("../get-gallery-card/get-gallery-card", () => ({
  getGalleryCard: vi.fn(),
}));
const { getGalleryCard } = await import("../get-gallery-card/get-gallery-card");

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };
const TOKEN = "abcdefghijklmnopqrstuvwxyz0123456789ABC3kQ9";
const GALLERY = {
  id: "g",
  status: "PUBLISHED",
  password: "mawar-4821",
  expiresAt: null,
  expiryDays: null,
  activeSourceCount: 1,
  failedSourceCount: 0,
  failedSourceNames: [],
  counts: { proof: 1, edited: 0, print: 0, missing: 0 },
} as const;

function deps(token: string | null = TOKEN) {
  return {
    galleries: {} as GalleryRepositoryPort,
    cipher: {} as GalleryPasswordCipherPort,
    links: { findToken: vi.fn(() => Promise.resolve(token)) },
    now: new Date(),
    origin: "https://shutrly.app/",
  };
}

describe("getAccessCard (D-20)", () => {
  it("AC-ACC-009 gives the full link to copy and the masked one to show", async () => {
    vi.mocked(getGalleryCard).mockResolvedValue({
      project: { id: "p", title: "Wisuda Rina", status: "DELIVERED" },
      canCreate: false,
      gallery: GALLERY,
    });
    expect(await getAccessCard(deps(), CONTEXT, "p")).toMatchObject({
      state: "ACTIVE",
      link: `https://shutrly.app/g/${TOKEN}`,
      maskedLink: "shutrly.app/g/••••••••3kQ9",
    });
  });

  it("no card before the project has a gallery", async () => {
    vi.mocked(getGalleryCard).mockResolvedValue({
      project: { id: "p", title: "Wisuda Rina", status: "BOOKED" },
      canCreate: true,
      gallery: null,
    });
    expect(await getAccessCard(deps(), CONTEXT, "p")).toBeNull();
  });
});
