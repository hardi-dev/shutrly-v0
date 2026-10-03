import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const useMobileViewport = vi.hoisted(() => vi.fn(() => false));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));

const { SessionsCard } = await import("./sessions-card");

const WISUDA = {
  name: "Wisuda",
  date: "2026-11-10",
  startTime: "07:30",
  endTime: "10:00",
  location: "Balairung UI, Depok",
};
const FOTO = {
  name: "Foto keluarga",
  date: "2026-11-10",
  startTime: "06:30",
  endTime: "07:15",
  location: "Rumah Rina, Depok",
};

function renderCard(sessions = [WISUDA, FOTO]) {
  const handlers = { onAdd: vi.fn(), onUpdate: vi.fn(), onRemove: vi.fn() };
  render(<SessionsCard sessions={sessions} isMobile={false} {...handlers} />);
  return handlers;
}

describe("SessionsCard (AC-PRJ-029, BR-TEAM-003)", () => {
  it("AC-PRJ-029 lists the sessions in date and time order with date, time and place", () => {
    renderCard();
    const items = within(screen.getByRole("list", { name: "Jadwal" })).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining("Foto keluarga"),
      expect.stringContaining("Wisuda"),
    ]);
    expect(
      screen.getByText("Sel, 10 Nov 2026 · 06.30–07.15 · Rumah Rina, Depok"),
    ).toBeInTheDocument();
  });

  it("AC-PRJ-009 shows the empty state and the error line when there are no sessions", () => {
    render(
      <SessionsCard
        sessions={[]}
        isMobile={false}
        errorMessage="Tambahkan minimal satu sesi."
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText("Belum ada sesi")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Tambahkan minimal satu sesi.");
  });

  it("AC-PRJ-029 the dialog reports every error and keeps itself open", async () => {
    const { onAdd } = renderCard([]);
    await userEvent.click(screen.getByRole("button", { name: "Tambah sesi" }));
    const dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Tambah sesi" }));
    expect(within(dialog).getByText("Isi nama sesi.")).toBeInTheDocument();
    expect(within(dialog).getByText("Pilih tanggal sesi.")).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("AC-PRJ-029 adds a session with only a name and a date", async () => {
    const { onAdd } = renderCard([]);
    await userEvent.click(screen.getByRole("button", { name: "Tambah sesi" }));
    const dialog = screen.getByRole("dialog");
    await userEvent.type(within(dialog).getByRole("textbox", { name: "Nama sesi" }), "Akad");
    await userEvent.click(within(dialog).getByRole("button", { name: /Tanggal/ }));
    await userEvent.click(within(screen.getByRole("grid")).getByText("15"));
    await userEvent.click(within(dialog).getByRole("button", { name: "Tambah sesi" }));
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Akad", startTime: null, endTime: null, location: null }),
    );
  });

  it("AC-PRJ-029 edits and deletes a session from its menu", async () => {
    const { onUpdate, onRemove } = renderCard([WISUDA]);
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk sesi Wisuda" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Ubah" }));
    const dialog = screen.getByRole("dialog", { name: "Ubah sesi" });
    const name = within(dialog).getByRole("textbox", { name: "Nama sesi" });
    expect(name).toHaveValue("Wisuda");
    await userEvent.clear(name);
    await userEvent.type(name, "Wisuda UI");
    await userEvent.click(within(dialog).getByRole("button", { name: "Simpan" }));
    expect(onUpdate).toHaveBeenCalledWith(0, expect.objectContaining({ name: "Wisuda UI" }));
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk sesi Wisuda" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Hapus" }));
    expect(onRemove).toHaveBeenCalledWith(0);
  });
});
