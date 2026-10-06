// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { ClientBrowsePageView } from "@/features/gallery/application/use-cases/browse-client-photos/browse-client-photos.types";

import type { ClientBrowseAction } from "../use-client-browse/use-client-browse.types";
import { ClientBrowseScreen } from "./client-browse-screen";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const GATE = { studioName: "Studio Senja", projectTitle: "Wisuda Rina", clientFirstName: "Rina" };
const photo = (n: number) => ({
  id: `p-${String(n)}`,
  fileName: `IMG_00${String(n)}.jpg`,
  folderPath: "",
  thumb: { src: `/g/T1/media/p-${String(n)}/thumb` },
  preview: { src: `/g/T1/media/p-${String(n)}/preview` },
  missing: false,
});
const ROOT: ClientBrowsePageView = {
  mode: "FOLDER",
  proofTotal: 24,
  sourceId: "s-1",
  isSingleSource: true,
  folders: [{ name: "Akad", count: 12, sourceId: "s-1", path: "Akad" }],
  summary: { folderCount: 1, photoCount: 2 },
  photos: [photo(1), photo(2)],
  nextCursor: null,
};

function renderScreen(action: ClientBrowseAction, initialPage: ClientBrowsePageView | null = ROOT) {
  render(
    <ClientBrowseScreen
      gate={GATE}
      token="T1"
      hasHome
      initialPage={initialPage}
      browseAction={action}
    />,
  );
}

describe("ClientBrowseScreen (D-15, A-26)", () => {
  it("AC-ACC-011 shows the root folder and photos with a way back to Beranda", () => {
    renderScreen(vi.fn());
    expect(screen.getByText("24 foto · 1 folder")).toBeVisible();
    expect(screen.getByText("Semua folder · 1 folder, 2 foto")).toBeVisible();
    expect(screen.getByRole("button", { name: /Akad/ })).toBeVisible();
    expect(screen.getAllByRole("link", { name: "Beranda" })[0]).toHaveAttribute("href", "/g/T1");
  });

  it("opens a folder through the action and shows its trail", async () => {
    const action = vi.fn<ClientBrowseAction>().mockResolvedValue({
      ...ROOT,
      folders: [],
      summary: { folderCount: 0, photoCount: 12 },
      photos: [photo(3)],
    });
    renderScreen(action);
    await userEvent.setup().click(screen.getByRole("button", { name: /Akad/ }));
    expect(action).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "PROOF", sourceId: "s-1", path: "Akad" }),
    );
    expect((await screen.findAllByText("Akad · 12 foto")).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Semua folder" })).toBeVisible();
  });

  it("shows the failed state with a retry when the first page couldn't load", async () => {
    const action = vi.fn<ClientBrowseAction>().mockResolvedValue(ROOT);
    renderScreen(action, null);
    expect(screen.getByText("Foto gagal dimuat")).toBeVisible();
    await userEvent.setup().click(screen.getByRole("button", { name: "Coba lagi" }));
    await waitFor(() => {
      expect(screen.queryByText("Foto gagal dimuat")).toBeNull();
    });
  });

  it("opens the read-only viewer on a photo", async () => {
    renderScreen(vi.fn());
    await userEvent.setup().click(screen.getByRole("button", { name: /IMG_002\.jpg/ }));
    expect(await screen.findByRole("dialog")).toBeVisible();
  });
});
