import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import type { TeamPick } from "@/features/booking/domain/session-assignment/session-assignment.types";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

const { SessionTeamField } = await import("./session-team-field");
const { useTeamPicker } = await import("./use-team-picker");

function Harness({
  members,
  initial,
  onChange,
}: Readonly<{
  members: (typeof DIMAS)[];
  initial: TeamPick[];
  onChange: (picks: TeamPick[]) => void;
}>) {
  const [picks, setPicks] = useState(initial);
  function handleChange(next: readonly TeamPick[]): void {
    setPicks([...next]);
    onChange([...next]);
  }
  const picker = useTeamPicker(members, picks, handleChange);
  return <SessionTeamField members={members} picker={picker} />;
}

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
      <Harness
        members={[DIMAS, SARI]}
        initial={[{ memberId: "m1", roleId: "r2" }]}
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
      <Harness
        members={[DIMAS, SARI]}
        initial={[{ memberId: "m1", roleId: "r1" }]}
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
    render(<Harness members={[]} initial={[]} onChange={vi.fn()} />);
    expect(
      screen.getByText("Belum ada anggota tim aktif. Tambahkan di halaman Tim dulu."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tambah anggota" })).not.toBeInTheDocument();
  });
});
