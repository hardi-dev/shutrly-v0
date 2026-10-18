import { describe, expect, it, vi } from "vitest";

import type {
  GalleryProjectStatus,
  GalleryState,
} from "@/features/gallery/domain/gallery-state/gallery-state.types";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type { GalleryPasswordCipherPort } from "../../ports/gallery-password-cipher/gallery-password-cipher.port";
import type { GalleryRepositoryPort } from "../../ports/gallery-repository/gallery-repository.port";
import type { ShareRecipientRecord } from "../../ports/share-recipient-reader/share-recipient-reader.port";
import type { GalleryCardView, GallerySummaryView } from "../gallery-views/gallery-views.types";
import { getGalleryShare } from "./get-gallery-share";
import type { GetGalleryShareDeps } from "./get-gallery-share.types";

vi.mock("../get-gallery-card/get-gallery-card", () => ({
  getGalleryCard: vi.fn(),
}));
const { getGalleryCard } = await import("../get-gallery-card/get-gallery-card");

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };
const TOKEN = "abcdefghijklmnopqrstuvwxyz0123456789ABC3kQ9";
const RECIPIENT: ShareRecipientRecord = { name: "Rina Wijaya", whatsappNumber: "6281234567890" };

function gallery(
  overrides: Partial<{ state: GalleryState; activeSourceCount: number }> = {},
): GallerySummaryView {
  return {
    id: "g",
    state: "OPEN",
    password: "mawar-4821",
    expiresAt: null,
    expiryDays: null,
    activeSourceCount: 1,
    failedSourceCount: 0,
    failedSourceNames: [],
    counts: { proof: 1, edited: 0, print: 0, missing: 0 },
    ...overrides,
  };
}

function card(
  status: GalleryProjectStatus = "BOOKED",
  summary: GallerySummaryView | null = gallery(),
): GalleryCardView {
  return {
    project: { id: "p", title: "Wisuda Rina", status },
    canCreate: false,
    gallery: summary,
  };
}

function deps(token: string | null = TOKEN, recipient: ShareRecipientRecord | null = RECIPIENT) {
  const links = { findToken: vi.fn(() => Promise.resolve(token)) };
  const recipients = { findRecipient: vi.fn(() => Promise.resolve(recipient)) };
  const built: GetGalleryShareDeps = {
    galleries: {} as GalleryRepositoryPort,
    cipher: {} as GalleryPasswordCipherPort,
    links,
    recipients: recipients,
    now: new Date(),
    origin: "https://shutrly.app/",
  };
  return { built, links, recipients };
}

describe("getGalleryShare (BR-GAL-010, AC-GFL-021, AC-GFL-025)", () => {
  it("returns the title, recipient, password and client link for an open gallery", async () => {
    vi.mocked(getGalleryCard).mockResolvedValue(card());
    const { built } = deps();
    expect(await getGalleryShare(built, CONTEXT, "p")).toEqual({
      shareable: true,
      projectTitle: "Wisuda Rina",
      recipient: RECIPIENT,
      password: "mawar-4821",
      link: `https://shutrly.app/g/${TOKEN}`,
    });
  });

  it("refuses a closed gallery without reading the token, the recipient or the password", async () => {
    vi.mocked(getGalleryCard).mockResolvedValue(card("CANCELLED", gallery({ state: "CLOSED" })));
    const { built, links, recipients } = deps();
    expect(await getGalleryShare(built, CONTEXT, "p")).toEqual({ shareable: false });
    expect(links.findToken).not.toHaveBeenCalled();
    expect(recipients.findRecipient).not.toHaveBeenCalled();
  });

  it("refuses an expired gallery", async () => {
    vi.mocked(getGalleryCard).mockResolvedValue(card("BOOKED", gallery({ state: "EXPIRED" })));
    expect(await getGalleryShare(deps().built, CONTEXT, "p")).toEqual({ shareable: false });
  });

  it("refuses a gallery with no active folder", async () => {
    vi.mocked(getGalleryCard).mockResolvedValue(card("BOOKED", gallery({ activeSourceCount: 0 })));
    expect(await getGalleryShare(deps().built, CONTEXT, "p")).toEqual({ shareable: false });
  });

  it("refuses when the project has no gallery", async () => {
    vi.mocked(getGalleryCard).mockResolvedValue(card("BOOKED", null));
    expect(await getGalleryShare(deps().built, CONTEXT, "p")).toEqual({ shareable: false });
  });

  it("propagates NOT_FOUND for another workspace's project", async () => {
    vi.mocked(getGalleryCard).mockRejectedValue(new GalleryError("NOT_FOUND"));
    await expect(getGalleryShare(deps().built, CONTEXT, "p")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("throws NOT_FOUND when the token or the recipient is missing for a shareable gallery", async () => {
    vi.mocked(getGalleryCard).mockResolvedValue(card());
    await expect(getGalleryShare(deps(null).built, CONTEXT, "p")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(getGalleryShare(deps(TOKEN, null).built, CONTEXT, "p")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("returns a null WhatsApp number for a client without one (AC-GFL-024)", async () => {
    vi.mocked(getGalleryCard).mockResolvedValue(card());
    const result = await getGalleryShare(
      deps(TOKEN, { name: "Rina Wijaya", whatsappNumber: null }).built,
      CONTEXT,
      "p",
    );
    expect(result).toMatchObject({ shareable: true, recipient: { whatsappNumber: null } });
  });
});
