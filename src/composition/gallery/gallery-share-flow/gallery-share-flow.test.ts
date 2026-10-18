import { beforeEach, describe, expect, it, vi } from "vitest";

import { GalleryError } from "@/features/gallery/application/errors/gallery-errors/gallery-errors";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

vi.mock("@/composition/request-db/request-db", () => ({ withRequestDb: vi.fn() }));
vi.mock("@/composition/workspace/owner-workspace/owner-workspace", () => ({
  verifyOwnerWorkspace: vi.fn(),
}));
vi.mock("@/composition/locale/request-locale/request-locale", () => ({
  getRequestLocale: vi.fn(),
}));
vi.mock("@/features/gallery/application/use-cases/get-gallery-share/get-gallery-share", () => ({
  getGalleryShare: vi.fn(),
}));
vi.mock("@/adapters/crypto/gallery-password-cipher/web-crypto-gallery-password-cipher", () => ({
  createWebCryptoGalleryPasswordCipher: vi.fn(() => ({})),
}));
vi.mock("@/adapters/db/message-template-repository/drizzle-message-template-repository", () => ({
  createDrizzleMessageTemplateRepository: vi.fn(() => ({
    findByType: vi.fn(() =>
      Promise.resolve({
        type: "GALLERY_SHARE",
        isDefault: true,
        content: null,
        updatedAt: new Date(),
      }),
    ),
  })),
}));
vi.mock("@/adapters/db/workspace-repository/drizzle-workspace-repository", () => ({
  createDrizzleWorkspaceRepository: vi.fn(() => ({
    getProfile: vi.fn(() => Promise.resolve({ name: "Aster", brandName: "Aster Wedding" })),
  })),
}));
vi.mock("@/shared/logging/logger", () => ({ logger: { error: vi.fn() } }));

const { withRequestDb } = await import("@/composition/request-db/request-db");
const { verifyOwnerWorkspace } =
  await import("@/composition/workspace/owner-workspace/owner-workspace");
const { getRequestLocale } = await import("@/composition/locale/request-locale/request-locale");
const { getGalleryShare } =
  await import("@/features/gallery/application/use-cases/get-gallery-share/get-gallery-share");
const { logger } = await import("@/shared/logging/logger");
const { loadGalleryShareEntry } = await import("./gallery-share-flow");

const WORKSPACE_ID = "00000000-0000-4000-8000-0000000000aa";
const PROJECT_ID = "00000000-0000-4000-8000-0000000000bb";
const TOKEN = "abcdefghijklmnopqrstuvwxyz0123456789ABC3kQ9";
const LINK = `https://shutrly.app/g/${TOKEN}`;

const SHAREABLE = {
  shareable: true,
  projectTitle: "Wisuda Rina",
  recipient: { name: "Rina Wijaya", whatsappNumber: "6281234567890" },
  password: "mawar-4821",
  link: LINK,
} as const;

function setUp(share: unknown) {
  vi.mocked(verifyOwnerWorkspace).mockResolvedValue({
    context: { workspaceId: asWorkspaceId(WORKSPACE_ID) },
    workspace: { name: "Aster" },
  } as never);
  vi.mocked(getRequestLocale).mockResolvedValue("id");
  vi.mocked(withRequestDb).mockImplementation((work) =>
    work(
      {} as never,
      { env: { GALLERY_PASSWORD_KEY: "k", BETTER_AUTH_URL: "https://shutrly.app" } } as never,
    ),
  );
  if (share instanceof Error) vi.mocked(getGalleryShare).mockRejectedValue(share);
  else vi.mocked(getGalleryShare).mockResolvedValue(share as never);
}

describe("loadGalleryShareEntry (D-9, AC-GFL-021 to 025)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the GALLERY_SHARE text in the Owner's language and builds the wa.me link", async () => {
    setUp(SHAREABLE);
    const entry = await loadGalleryShareEntry(WORKSPACE_ID, PROJECT_ID);
    if (!entry.ok) throw new Error("expected ok");
    expect(entry.recipient).toEqual({ name: "Rina Wijaya", phone: "+62 812-3456-7890" });
    expect(entry.text).toContain("Kata sandi: mawar-4821");
    expect(entry.waUrl).toMatch(/^https:\/\/wa\.me\/6281234567890\?text=/);
    expect(entry.waUrl).toBe(`https://wa.me/6281234567890?text=${encodeURIComponent(entry.text)}`);
  });

  it("returns a null wa.me link and phone for a client without a number (AC-GFL-024)", async () => {
    setUp({ ...SHAREABLE, recipient: { name: "Rina Wijaya", whatsappNumber: null } });
    const entry = await loadGalleryShareEntry(WORKSPACE_ID, PROJECT_ID);
    expect(entry).toMatchObject({ ok: true, recipient: { phone: null }, waUrl: null });
  });

  it("refuses without a password, link or text when sharing is not allowed (AC-GFL-025)", async () => {
    setUp({ shareable: false });
    expect(await loadGalleryShareEntry(WORKSPACE_ID, PROJECT_ID)).toEqual({
      ok: false,
      code: "NOT_SHAREABLE",
    });
  });

  it("maps another workspace's project to NOT_FOUND", async () => {
    setUp(new GalleryError("NOT_FOUND"));
    expect(await loadGalleryShareEntry(WORKSPACE_ID, PROJECT_ID)).toEqual({
      ok: false,
      code: "NOT_FOUND",
    });
  });

  it("rejects a malformed project id before any read", async () => {
    setUp(SHAREABLE);
    expect(await loadGalleryShareEntry(WORKSPACE_ID, "not-a-uuid")).toEqual({
      ok: false,
      code: "NOT_FOUND",
    });
    expect(getGalleryShare).not.toHaveBeenCalled();
  });

  it("fails generically and logs only the IDs, never the password or the link (C-103)", async () => {
    setUp(new Error("boom"));
    expect(await loadGalleryShareEntry(WORKSPACE_ID, PROJECT_ID)).toEqual({
      ok: false,
      code: "FAILED",
    });
    expect(logger.error).toHaveBeenCalledWith("gallery.share_failed", {
      workspaceId: WORKSPACE_ID,
      projectId: PROJECT_ID,
    });
    expect(JSON.stringify(vi.mocked(logger.error).mock.calls)).not.toContain("mawar-4821");
  });
});
