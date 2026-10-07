// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DeliveryFilesView } from "@/features/gallery/application/use-cases/get-delivery-files/get-delivery-files.types";

import type { SequentialDownload } from "../use-sequential-download/use-sequential-download.types";
import { DeliveryScreen } from "./delivery-screen";

const download: { current: SequentialDownload } = { current: undefined as never };
vi.mock("../use-sequential-download/use-sequential-download", () => ({
  useSequentialDownload: () => download.current,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

const GATE = { studioName: "Studio Senja", projectTitle: "Wisuda Rina", clientFirstName: "Rina" };
const file = (name: string) => ({
  id: name,
  fileName: `${name}.jpg`,
  folderPath: "edited",
  thumb: { src: `/g/T1/media/${name}/thumb` },
  preview: { src: `/g/T1/media/${name}/preview` },
  missing: false,
  downloadUrl: `/g/T1/download/${name}`,
});
const FILES: DeliveryFilesView = {
  groups: [
    { id: "i-edit", name: "Foto edit", files: [file("E_001"), file("E_002")] },
    { id: "i-print", name: "Cetak 4R", files: [file("P_001")] },
  ],
};

function fakeDownload(patch: Partial<SequentialDownload["progress"]> = {}): SequentialDownload {
  return {
    progress: { phase: "IDLE", done: 0, total: 0, failedIds: [], ...patch },
    start: vi.fn(),
    cancel: vi.fn(),
    retry: vi.fn(),
    reset: vi.fn(),
  };
}

beforeEach(() => {
  download.current = fakeDownload();
});

describe("DeliveryScreen (klien-8)", () => {
  it("AC-DEL-003 F-20 shows the first item with a download link on every tile", () => {
    render(<DeliveryScreen gate={GATE} token="T1" files={FILES} />);
    expect(screen.getByText("Hasil akhir sudah tersedia")).toBeTruthy();
    expect(screen.getByText("2 file · Foto edit")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Unduh E_002.jpg" })).toHaveAttribute(
      "href",
      "/g/T1/download/E_002",
    );
  });

  it("F-20 shows a tab for an empty item and opens on the first item with files", () => {
    const files: DeliveryFilesView = {
      groups: [
        { id: "i-edit", name: "Foto edit", files: [] },
        { id: "i-print", name: "Cetak 4R", files: [file("P_001")] },
      ],
    };
    render(<DeliveryScreen gate={GATE} token="T1" files={files} />);
    expect(screen.getByText("Foto edit · 0")).toBeTruthy();
    expect(screen.getByText("1 file · Cetak 4R")).toBeTruthy();
  });

  it("AC-DEL-003 Unduh semua asks first, then downloads the open kind one by one", async () => {
    const user = userEvent.setup();
    render(<DeliveryScreen gate={GATE} token="T1" files={FILES} />);
    await user.click(screen.getByRole("button", { name: /Unduh/ }));
    await user.click(await screen.findByRole("menuitem", { name: "Unduh semua (2)" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Unduh semua 2 foto?")).toBeTruthy();
    await user.click(within(dialog).getByRole("button", { name: "Unduh semua" }));
    expect(download.current.start).toHaveBeenCalledWith([
      { id: "E_001", url: "/g/T1/download/E_001", fileName: "E_001.jpg" },
      { id: "E_002", url: "/g/T1/download/E_002", fileName: "E_002.jpg" },
    ]);
  });

  it("AC-DEL-003 Pilih beberapa downloads the ticked files and ends the mode", async () => {
    const user = userEvent.setup();
    render(<DeliveryScreen gate={GATE} token="T1" files={FILES} />);
    await user.click(screen.getByRole("button", { name: /Unduh/ }));
    await user.click(await screen.findByRole("menuitem", { name: "Pilih beberapa" }));
    expect(screen.getAllByText("0 foto dipilih").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "E_002.jpg", pressed: false }));
    await user.click(screen.getByRole("button", { name: "Unduh 1 foto" }));
    expect(download.current.start).toHaveBeenCalledWith([
      { id: "E_002", url: "/g/T1/download/E_002", fileName: "E_002.jpg" },
    ]);
    expect(screen.queryAllByText(/foto dipilih/)).toHaveLength(0);
  });

  it("AC-DEL-003 shows n dari m while downloading, with Batalkan", async () => {
    download.current = fakeDownload({ phase: "RUNNING", done: 1, total: 2 });
    render(<DeliveryScreen gate={GATE} token="T1" files={FILES} />);
    expect(screen.getByText("1 dari 2 foto selesai")).toBeTruthy();
    await userEvent.setup().click(screen.getByRole("button", { name: "Batalkan" }));
    expect(download.current.cancel).toHaveBeenCalled();
  });

  it("AC-DEL-005 a failed file is marked Gagal and the alert offers Coba lagi", async () => {
    download.current = fakeDownload({ phase: "DONE", done: 2, total: 2, failedIds: ["E_002"] });
    render(<DeliveryScreen gate={GATE} token="T1" files={FILES} />);
    expect(screen.getByText("1 foto gagal diunduh")).toBeTruthy();
    expect(screen.getByText("E_002.jpg tidak bisa diunduh. Foto lain sudah masuk.")).toBeTruthy();
    expect(screen.getByText("Gagal")).toBeTruthy();
    await userEvent.setup().click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(download.current.retry).toHaveBeenCalled();
  });

  it("AC-DEL-004 F-20 another item's tab shows its files", async () => {
    render(<DeliveryScreen gate={GATE} token="T1" files={FILES} />);
    await userEvent.setup().click(screen.getByRole("radio", { name: "Cetak 4R · 1" }));
    expect(screen.getByText("1 file · Cetak 4R")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Unduh P_001.jpg" })).toBeTruthy();
  });
});
