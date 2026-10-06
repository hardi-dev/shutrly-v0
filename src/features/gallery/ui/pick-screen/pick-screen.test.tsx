// @vitest-environment jsdom

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type {
  SetPickInput,
  SetPickNoteInput,
} from "@/features/gallery/application/schemas/set-pick/set-pick.types";
import type { PickView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";

import type { PickScreenActions } from "../use-pick-screen/use-pick-screen.types";
import { PickScreen } from "./pick-screen";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), replace }) }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const GATE = { studioName: "Studio Senja", projectTitle: "Wisuda Rina", clientFirstName: "Rina" };
const photo = (n: number) => ({
  id: `p-${String(n)}`,
  fileName: `IMG_00${String(n)}.jpg`,
  folderPath: "",
  thumb: { src: `/g/T1/media/p-${String(n)}/thumb` },
  preview: { src: `/g/T1/media/p-${String(n)}/preview` },
  missing: false,
});
const PAGE = { total: 4, photos: [1, 2, 3, 4].map(photo), nextCursor: null };
const GROUP = {
  id: "g-edit",
  name: "Foto edit",
  unit: "foto",
  mode: "COUNT" as const,
  allowsPickNotes: true,
  limit: 3,
  usage: 1,
  status: "OPEN" as const,
};

function view(patch: Partial<PickView> = {}): PickView {
  return {
    group: GROUP,
    picks: [{ photo: photo(1), quantity: 1, note: null }],
    otherPicks: [{ photoId: "p-3", groupName: "Foto cetak", mode: "QUANTITY", quantity: 2 }],
    ...patch,
  };
}

function actions(patch: Partial<PickScreenActions> = {}): PickScreenActions {
  return {
    setPick: vi.fn((input: SetPickInput) =>
      Promise.resolve({ ok: true as const, usage: 2, quantity: input.quantity }),
    ),
    setNote: vi.fn((input: SetPickNoteInput) =>
      Promise.resolve({ ok: true as const, note: input.note.trim() }),
    ),
    browse: vi.fn(() => Promise.resolve(PAGE)),
    reload: vi.fn(() => Promise.resolve({ kind: "VIEW" as const, view: view() })),
    ...patch,
  };
}

function renderScreen(a: PickScreenActions, v: PickView = view()) {
  render(<PickScreen gate={GATE} token="T1" view={v} initialPage={PAGE} actions={a} />);
}

describe("PickScreen (pilih exports)", () => {
  it("AC-SEL-017 shows the group, its usage, Tinjau and a marker for another group's pick", () => {
    renderScreen(actions());
    expect(screen.getAllByText("Foto edit").length).toBeGreaterThan(0);
    expect(screen.getByText("1 dari 3 foto dipilih")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Tinjau" }).getAttribute("href")).toBe(
      "/g/T1/pilih/g-edit/tinjau",
    );
    expect(screen.getByText("Foto cetak × 2")).toBeTruthy();
    expect(screen.getByRole("button", { name: "IMG_001.jpg", pressed: true })).toBeTruthy();
  });

  it("AC-SEL-002 picks with one tap, counts it at once and saves it", async () => {
    const a = actions();
    renderScreen(a);
    await userEvent.click(screen.getByRole("button", { name: "IMG_002.jpg" }));
    expect(screen.getByText("2 dari 3 foto dipilih")).toBeTruthy();
    expect(a.setPick).toHaveBeenCalledWith({ groupId: "g-edit", photoId: "p-2", quantity: 1 });
  });

  it("AC-SEL-003 undoes a refused pick and re-reads the group", async () => {
    const full = view({ group: { ...GROUP, usage: 3 } });
    const a = actions({
      setPick: vi.fn(() => Promise.resolve({ ok: false as const, code: "LIMIT_REACHED" as const })),
      reload: vi.fn(() => Promise.resolve({ kind: "VIEW" as const, view: full })),
    });
    renderScreen(a);
    await userEvent.click(screen.getByRole("button", { name: "IMG_002.jpg" }));
    await waitFor(() => {
      expect(a.reload).toHaveBeenCalledWith("g-edit");
    });
    expect(screen.getByRole("button", { name: "IMG_002.jpg", pressed: false })).toBeTruthy();
  });

  it("AC-SEL-003 shows Batas pilihan tercapai and disables unpicked tiles when full", () => {
    const picks = [1, 2, 4].map((n) => ({ photo: photo(n), quantity: 1, note: null }));
    renderScreen(actions(), view({ picks }));
    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("Batas pilihan tercapai")).toBeTruthy();
    expect(
      screen.getByText("Foto edit sudah 3 dari 3. Lepas satu foto untuk memilih yang lain."),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "IMG_003.jpg" }).hasAttribute("disabled")).toBe(true);
  });

  it("AC-SEL-017 opens the read-only view when the group closed meanwhile", async () => {
    const a = actions({
      setPick: vi.fn(() =>
        Promise.resolve({ ok: false as const, code: "GROUP_NOT_OPEN" as const }),
      ),
      reload: vi.fn(() => Promise.resolve({ kind: "NOT_OPEN" as const })),
    });
    renderScreen(a);
    await userEvent.click(screen.getByRole("button", { name: "IMG_002.jpg" }));
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/g/T1/pilih/g-edit/tinjau");
    });
  });

  it("A-25 shows only this group's picks under Dipilih", async () => {
    renderScreen(actions());
    // Desktop and phone each render the filter; CSS hides one of them.
    const [filter] = screen.getAllByRole("radio", { name: "Dipilih" });
    await userEvent.click(filter);
    expect(screen.getByRole("button", { name: "IMG_001.jpg" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "IMG_002.jpg" })).toBeNull();
  });

  it("AC-SEL-021 writes a note from a picked tile and shows the note marker", async () => {
    const a = actions();
    renderScreen(a);
    await userEvent.click(screen.getByRole("button", { name: "Tambah catatan untuk IMG_001.jpg" }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.type(within(dialog).getByRole("textbox"), "rapikan rambut");
    await userEvent.click(within(dialog).getByRole("button", { name: "Simpan catatan" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Ubah catatan untuk IMG_001.jpg" })).toBeTruthy();
    });
    expect(a.setNote).toHaveBeenCalledWith({
      groupId: "g-edit",
      photoId: "p-1",
      note: "rapikan rambut",
    });
  });

  it("A-32 offers no Catatan when the group's item has notes off", () => {
    renderScreen(actions(), view({ group: { ...GROUP, allowsPickNotes: false } }));
    expect(screen.queryByRole("button", { name: /catatan untuk/ })).toBeNull();
  });
});
