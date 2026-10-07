// @vitest-environment jsdom

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SetPickInput } from "@/features/gallery/application/schemas/set-pick/set-pick.types";
import type { ReviewView } from "@/features/gallery/application/use-cases/get-review/get-review.types";
import type { SubmitSelectionGroupResult } from "@/features/gallery/application/use-cases/submit-selection-group/submit-selection-group.types";
import { showToast } from "@/ui/patterns/toast/toast";

import type { ReviewActions } from "../use-review-screen/use-review-screen.types";
import { ReviewScreen } from "./review-screen";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh, replace: vi.fn() }) }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const GATE = { studioName: "Studio Senja", projectTitle: "Wisuda Rina", clientFirstName: "Rina" };
const photo = (id: string, folder = "Rina-Wisuda/Akad") => ({
  id,
  fileName: `${id}.jpg`,
  folderPath: folder,
  thumb: { src: `/g/T1/media/${id}/thumb` },
  preview: { src: `/g/T1/media/${id}/preview` },
  missing: false,
});

function editView(patch: Partial<ReviewView> = {}): ReviewView {
  return {
    group: {
      id: "g-edit",
      name: "Foto edit",
      unit: "foto",
      mode: "COUNT",
      allowsPickNotes: true,
      limit: 3,
      usage: 2,
      status: "OPEN",
    },
    picks: [
      { photo: photo("IMG_001"), quantity: 1, note: "hapus jerawat" },
      { photo: photo("IMG_002", "Rina-Wisuda/Resepsi"), quantity: 1, note: null },
    ],
    remaining: 1,
    isEditable: true,
    ...patch,
  };
}

/** A COUNT group whose three picks fill its limit of 3. */
function fullView(): ReviewView {
  const view = editView({ remaining: 0 });
  return {
    ...view,
    group: { ...view.group, usage: 3 },
    picks: [...view.picks, { photo: photo("IMG_003"), quantity: 1, note: null }],
  };
}

function printView(): ReviewView {
  return {
    group: {
      id: "g-print",
      name: "Foto cetak",
      unit: "lembar",
      mode: "QUANTITY",
      allowsPickNotes: false,
      limit: 4,
      usage: 3,
      status: "OPEN",
    },
    picks: [
      { photo: photo("IMG_003"), quantity: 2, note: null },
      { photo: photo("IMG_008"), quantity: 1, note: null },
    ],
    remaining: 1,
    isEditable: true,
  };
}

function actions(patch: Partial<ReviewActions> = {}): ReviewActions {
  return {
    setPick: vi.fn((input: SetPickInput) =>
      Promise.resolve({ ok: true as const, usage: 2, quantity: input.quantity }),
    ),
    setNote: vi.fn(),
    submit: vi.fn(() =>
      Promise.resolve<SubmitSelectionGroupResult>({
        ok: true,
        groupName: "Foto edit",
        usage: 2,
        remaining: 1,
      }),
    ),
    reload: vi.fn(() => Promise.resolve({ kind: "VIEW" as const, view: editView() })),
    ...patch,
  };
}

function renderReview(a: ReviewActions, view: ReviewView = editView()) {
  render(<ReviewScreen gate={GATE} token="T1" view={view} actions={a} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ReviewScreen — Tinjau (tinjau exports)", () => {
  it("AC-SEL-008 lists the picks with their folders, the places left and Kirim n foto", () => {
    renderReview(actions());
    expect(screen.getByText("2 dari 3 foto · sisa 1")).toBeTruthy();
    expect(screen.getByText("Rina-Wisuda › Akad")).toBeTruthy();
    expect(screen.getByText("Rina-Wisuda › Resepsi")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Kirim 2 foto" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Tambah foto lagi" }).getAttribute("href")).toBe(
      "/g/T1/pilih/g-edit",
    );
  });

  it("AC-SEL-008 asks to confirm below the limit, sends once confirmed and returns to Beranda with a toast", async () => {
    const a = actions();
    renderReview(a);
    await userEvent.click(screen.getByRole("button", { name: "Kirim 2 foto" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Kirim pilihan Foto edit?")).toBeTruthy();
    expect(
      within(dialog).getByText(
        "Anda baru memilih 2 dari 3 foto. 1 tempat sisanya tetap terbuka, dan pilihan masih bisa diubah sampai fotografer menguncinya.",
      ),
    ).toBeTruthy();
    expect(within(dialog).getByRole("link", { name: "Pilih lagi" }).getAttribute("href")).toBe(
      "/g/T1/pilih/g-edit",
    );
    expect(a.submit).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole("button", { name: "Kirim 2 foto" }));
    await waitFor(() => {
      expect(a.submit).toHaveBeenCalledWith({ groupId: "g-edit", confirmBelowLimit: true });
    });
    expect(showToast).toHaveBeenCalledWith({
      tone: "success",
      title: "Foto edit dikirim",
      body: "Fotografer akan melihat pilihan Anda. Sisa 1 tempat masih bisa Anda pilih.",
    });
    expect(push).toHaveBeenCalledWith("/g/T1");
  });

  it("AC-SEL-008 sends a full group without the notice", async () => {
    const a = actions();
    renderReview(a, fullView());
    await userEvent.click(screen.getByRole("button", { name: "Kirim 3 foto" }));
    await waitFor(() => {
      expect(a.submit).toHaveBeenCalledWith({ groupId: "g-edit", confirmBelowLimit: false });
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("AC-SEL-008 opens the notice with the server's places left when it asks to confirm", async () => {
    const a = actions({
      submit: vi.fn(() =>
        Promise.resolve<SubmitSelectionGroupResult>({
          ok: false,
          code: "NEEDS_CONFIRMATION",
          remaining: 2,
        }),
      ),
    });
    // The screen thinks the group is full; the server knows an add-on made room (BR-ADD-004).
    renderReview(a, fullView());
    await userEvent.click(screen.getByRole("button", { name: "Kirim 3 foto" }));
    expect(await screen.findByText(/2 tempat sisanya tetap terbuka/)).toBeTruthy();
  });

  it("AC-SEL-008 reloads the page when the group was sent meanwhile", async () => {
    const a = actions({
      submit: vi.fn(() =>
        Promise.resolve<SubmitSelectionGroupResult>({ ok: false, code: "GROUP_NOT_OPEN" }),
      ),
    });
    renderReview(a, fullView());
    await userEvent.click(screen.getByRole("button", { name: "Kirim 3 foto" }));
    await waitFor(() => {
      expect(refresh).toHaveBeenCalled();
    });
  });

  it("AC-SEL-009 shows the empty state and disables Kirim with no picks", () => {
    const empty = editView({ picks: [], remaining: 3 });
    renderReview(actions(), { ...empty, group: { ...empty.group, usage: 0 } });
    expect(screen.getByText("Belum ada foto dipilih")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Kirim" }).hasAttribute("disabled")).toBe(true);
  });

  it("AC-SEL-018 raises a print quantity with the stepper and saves it", async () => {
    const a = actions();
    renderReview(a, printView());
    expect(screen.getByText("3 dari 4 lembar · sisa 1")).toBeTruthy();
    expect(screen.getByText("2 foto · 3 lembar. Atur jumlah cetak tiap foto.")).toBeTruthy();
    const [increase] = screen.getAllByRole("button", { name: "Tambah" });
    await userEvent.click(increase);
    expect(a.setPick).toHaveBeenCalledWith({ groupId: "g-print", photoId: "IMG_003", quantity: 3 });
    expect(screen.getByText("4 dari 4 lembar · sisa 0")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Kirim 4 lembar" })).toBeTruthy();
  });

  it("AC-SEL-018 offers no quantity above the places left", async () => {
    renderReview(actions(), printView());
    const [first, second] = screen.getAllByRole("button", { name: "Tambah" });
    expect(first.hasAttribute("disabled")).toBe(false);
    expect(second.hasAttribute("disabled")).toBe(false);
    // The last place goes to IMG_003; IMG_008 then can't go above its own quantity.
    await userEvent.click(first);
    expect(screen.getAllByRole("button", { name: "Tambah" })[1].hasAttribute("disabled")).toBe(
      true,
    );
  });

  it("AC-SEL-018 removes a pick, which lowers the usage and can empty the group", async () => {
    const a = actions();
    renderReview(a, printView());
    await userEvent.click(screen.getByRole("button", { name: "Hapus IMG_008.jpg" }));
    expect(a.setPick).toHaveBeenCalledWith({ groupId: "g-print", photoId: "IMG_008", quantity: 0 });
    expect(screen.queryByText("IMG_008.jpg")).toBeNull();
    expect(screen.getByText("2 dari 4 lembar · sisa 2")).toBeTruthy();
  });

  it("AC-SEL-003 puts a refused change back and re-reads the group", async () => {
    const a = actions({
      setPick: vi.fn(() => Promise.resolve({ ok: false as const, code: "LIMIT_REACHED" as const })),
      reload: vi.fn(() => Promise.resolve({ kind: "VIEW" as const, view: printView() })),
    });
    renderReview(a, printView());
    const [increase] = screen.getAllByRole("button", { name: "Tambah" });
    await userEvent.click(increase);
    await waitFor(() => {
      expect(a.reload).toHaveBeenCalledWith("g-print");
    });
    expect(showToast).toHaveBeenCalledWith({ tone: "warning", title: "Batas pilihan tercapai" });
    expect(screen.getByText("3 dari 4 lembar · sisa 1")).toBeTruthy();
  });

  it("AC-SEL-021 shows each note with Ubah catatan, offers Tambah catatan and opens the note sheet", async () => {
    renderReview(actions());
    expect(screen.getByText("Catatan untuk fotografer")).toBeTruthy();
    expect(screen.getByText("hapus jerawat")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ubah catatan" })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Tambah catatan" }));
    expect(await screen.findByText("Catatan untuk IMG_002.jpg")).toBeTruthy();
  });

  it("A-32 offers no note actions in a group whose item has notes off", () => {
    renderReview(actions(), printView());
    expect(screen.queryByRole("button", { name: /catatan/i })).toBeNull();
  });
});

describe("ReviewScreen — Lihat pilihan (lihatpilihan-dikirim)", () => {
  function submittedView(): ReviewView {
    const view = editView({ isEditable: false, remaining: 1 });
    return { ...view, group: { ...view.group, status: "SUBMITTED" } };
  }

  it("AC-SEL-008 shows the picks read-only after sending: no Kirim, no remove, notes without actions", () => {
    renderReview(actions(), submittedView());
    expect(screen.getByText("2 foto dikirim · menunggu fotografer")).toBeTruthy();
    // Desktop Page Header and phone Mobile Header both render in jsdom.
    expect(
      screen.getAllByText(
        "Pilihan sudah dikirim dan menunggu fotografer. Pilihan tidak bisa diubah.",
      ),
    ).not.toHaveLength(0);
    expect(screen.getByText("hapus jerawat")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Kirim/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Hapus/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /catatan/i })).toBeNull();
    expect(screen.queryByRole("link", { name: "Tambah foto lagi" })).toBeNull();
  });

  it("AC-SEL-008 shows print quantities as × n when read-only", () => {
    const view = printView();
    renderReview(actions(), {
      ...view,
      isEditable: false,
      group: { ...view.group, status: "SUBMITTED" },
    });
    expect(screen.getByText("× 2")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Tambah" })).toBeNull();
  });
});
