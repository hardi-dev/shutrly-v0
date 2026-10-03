import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

const { SessionTeamField } = await import("./session-team-field");

const DIMAS = {
  id: "m1",
  name: "Dimas Pratama",
  roles: [
    { id: "r1", name: "Fotografer" },
    { id: "r2", name: "Videografer" },
  ],
};
const SARI = { id: "m2", name: "Sari Lestari", roles: [{ id: "r3", name: "Asisten" }] };

describe("SessionTeamField", () => {
  it("AC-TEAM-028 lists the picks with their roles and removes one", async () => {
    const onChange = vi.fn();
    render(
      <SessionTeamField
        members={[DIMAS, SARI]}
        picks={[{ memberId: "m1", roleId: "r2" }]}
        onChange={onChange}
      />,
    );
    expect(screen.getByRole("list", { name: "Tim sesi ini" })).toHaveTextContent(
      "Dimas PratamaVideografer",
    );
    await userEvent.click(screen.getByRole("button", { name: "Hapus dari sesi" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("AC-TEAM-028 adds a member with their first role preselected and keeps the order", async () => {
    const onChange = vi.fn();
    render(
      <SessionTeamField
        members={[DIMAS, SARI]}
        picks={[{ memberId: "m1", roleId: "r1" }]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Anggota tim/ }));
    expect(screen.queryByRole("option", { name: "Dimas Pratama" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: "Sari Lestari" }));
    await userEvent.click(screen.getByRole("button", { name: "Tambah anggota" }));
    expect(onChange).toHaveBeenCalledWith([
      { memberId: "m1", roleId: "r1" },
      { memberId: "m2", roleId: "r3" },
    ]);
  });

  it("AC-TEAM-027 says there are no active members and offers nothing to pick", () => {
    render(<SessionTeamField members={[]} picks={[]} onChange={vi.fn()} />);
    expect(
      screen.getByText("Belum ada anggota tim aktif. Tambahkan di halaman Tim dulu."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tambah anggota" })).not.toBeInTheDocument();
  });
});
