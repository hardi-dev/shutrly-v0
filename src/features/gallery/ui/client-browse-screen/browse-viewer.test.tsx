// @vitest-environment jsdom

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { SetPickInput } from "@/features/gallery/application/schemas/set-pick/set-pick.types";
import type { PickGroupView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";
import type { PickTargets } from "@/features/gallery/application/use-cases/list-pick-targets/list-pick-targets.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { usePickTargets } from "../use-pick-targets/use-pick-targets";
import type { ViewerPickActions } from "../use-pick-targets/use-pick-targets.types";
import { BrowseViewer } from "./browse-viewer";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

const PHOTO = {
  id: "p-7",
  fileName: "IMG_007.jpg",
  folderPath: "Akad",
  thumb: { src: "/g/T1/media/p-7/thumb" },
  preview: { src: "/g/T1/media/p-7/preview" },
  missing: false,
};

function group(id: string, patch: Partial<PickGroupView>): PickGroupView {
  return {
    id,
    name: "Foto edit",
    unit: "foto",
    mode: "COUNT",
    allowsPickNotes: true,
    limit: 3,
    usage: 3,
    status: "OPEN",
    ...patch,
  };
}

// AC-SEL-019: Foto edit full, Foto cetak empty, a third group submitted.
const TARGETS: PickTargets = {
  groups: [
    group("g-edit", {}),
    group("g-print", { name: "Foto cetak", unit: "lembar", mode: "QUANTITY", limit: 2, usage: 0 }),
    group("g-album", { name: "Album", usage: 1, status: "SUBMITTED" }),
  ],
  picks: [],
};

function actions(patch: Partial<ViewerPickActions> = {}): ViewerPickActions {
  return {
    setPick: vi.fn((input: SetPickInput) =>
      Promise.resolve({ ok: true as const, usage: 1, quantity: input.quantity }),
    ),
    setNote: vi.fn(),
    reload: vi.fn(() => Promise.resolve(TARGETS)),
    ...patch,
  };
}

const downloadUrlOf = (id: string) => `/g/T1/download/${id}`;

function Harness({ a, targets }: Readonly<{ a: ViewerPickActions; targets: PickTargets }>) {
  const handle = usePickTargets(targets, a);
  return (
    <BrowseViewer
      photos={[PHOTO]}
      index={0}
      onIndexChange={vi.fn()}
      onClose={vi.fn()}
      handle={handle}
      pickActions={a}
      downloadUrlOf={downloadUrlOf}
    />
  );
}

function renderViewer(a: ViewerPickActions, targets: PickTargets = TARGETS) {
  render(<Harness a={a} targets={targets} />);
}

async function openMenu() {
  await userEvent.click(screen.getByRole("button", { name: "Pilih untuk…" }));
  return screen.findByRole("menu");
}

describe("BrowseViewer (A-30, A-32)", () => {
  it("AC-SEL-019 lists the groups with usage and disables a submitted one", async () => {
    renderViewer(actions());
    const menu = await openMenu();
    const items = within(menu).getAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Foto edit3 dari 3 foto · ketuk untuk memilih",
      "Foto cetak0 dari 2 lembar · ketuk untuk memilih",
      "Album1 dari 3 foto · Dikirim",
    ]);
    expect(items[2]?.getAttribute("aria-disabled")).toBe("true");
  });

  it("AC-SEL-019 picks the photo in Foto cetak with quantity 1 and shows where it is picked", async () => {
    const a = actions();
    renderViewer(a);
    const menu = await openMenu();
    await userEvent.click(within(menu).getByText("Foto cetak"));
    expect(a.setPick).toHaveBeenCalledWith({ groupId: "g-print", photoId: "p-7", quantity: 1 });
    expect(await screen.findByText("Dipilih di: Foto cetak × 1")).toBeTruthy();
  });

  it("AC-SEL-019 refuses a full group with Batas pilihan tercapai and re-reads the groups", async () => {
    const a = actions({
      setPick: vi.fn(() => Promise.resolve({ ok: false as const, code: "LIMIT_REACHED" as const })),
    });
    renderViewer(a);
    const menu = await openMenu();
    await userEvent.click(within(menu).getByText("Foto edit"));
    await waitFor(() => {
      expect(a.reload).toHaveBeenCalled();
    });
    expect(showToast).toHaveBeenCalledWith({ tone: "warning", title: "Batas pilihan tercapai" });
  });

  it("AC-SEL-021 offers Catatan for a photo picked in a group with notes and opens the note sheet", async () => {
    const picked = {
      ...TARGETS,
      picks: [{ groupId: "g-edit", photoId: "p-7", quantity: 1, note: "rapikan" }],
    };
    renderViewer(actions(), picked);
    expect(screen.getByText("Dipilih di: Foto edit · ada catatan")).toBeTruthy();
    await userEvent.click(
      screen.getByRole("button", { name: "Catatan untuk IMG_007.jpg di Foto edit" }),
    );
    expect(await screen.findByText("Catatan untuk IMG_007.jpg")).toBeTruthy();
  });

  it("AC-SEL-020 stays read-only when the project has no groups", () => {
    renderViewer(actions(), { groups: [], picks: [] });
    expect(screen.queryByRole("button", { name: "Pilih untuk…" })).toBeNull();
    expect(screen.getByText("Akad")).toBeTruthy();
  });

  it("F-20 offers Unduh foto with the original's download link", () => {
    renderViewer(actions());
    expect(screen.getByRole("link", { name: "Unduh foto" })).toHaveAttribute(
      "href",
      "/g/T1/download/p-7",
    );
  });
});
