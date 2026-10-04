import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { projectDetailView } from "../../../../../tests/support/booking/project-detail-view";
import { ProjectScheduleCard } from "./project-detail-cards";

const { isMobile } = vi.hoisted(() => ({ isMobile: { value: false } }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => isMobile.value,
}));

const PEOPLE = [
  ["a1", "Dimas Pratama", "Fotografer"],
  ["a2", "Sari Lestari", "Asisten"],
  ["a3", "Joko Santoso", "Videografer"],
  ["a4", "Ayu Kirana", "Asisten"],
] as const;

const WISUDA_TEAM = PEOPLE.map(([id, memberName, roleName]) => ({
  id,
  sessionId: "s2",
  memberId: `m-${id}`,
  memberName,
  isMemberArchived: false,
  roleName,
}));

const EDIT = {
  onAddItem: vi.fn(),
  onEditItem: vi.fn(),
  onRemoveItem: vi.fn(),
  onEditFields: vi.fn(),
  onAddSession: vi.fn(),
  onEditSession: vi.fn(),
  onDeleteSession: vi.fn(),
};

function setup(overrides = {}, withTeam = true) {
  const team = { onAdd: vi.fn(), onManage: vi.fn() };
  const project = projectDetailView("BOOKED", { assignments: WISUDA_TEAM, ...overrides });
  render(
    <ProjectScheduleCard
      project={project}
      isMobile={isMobile.value}
      edit={EDIT}
      team={withTeam ? team : undefined}
    />,
  );
  return { team };
}

describe("Jadwal rows with a team", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isMobile.value = false;
  });

  it("AC-TEAM-026 shows DP, SL, JS and +1 on Wisuda and the user-plus button on Foto keluarga", () => {
    setup();
    const group = screen.getByRole("button", { name: "Tim Wisuda: 4 anggota" });
    expect(group).toHaveTextContent("DPSLJS+1");
    expect(
      screen.getByRole("button", { name: "Tambah tim untuk Foto keluarga" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Tambah tim untuk Wisuda" }),
    ).not.toBeInTheDocument();
  });

  it("AC-TEAM-026 shows the member's name and role in a tooltip on desktop hover", async () => {
    setup();
    const group = screen.getByRole("button", { name: "Tim Wisuda: 4 anggota" });
    await userEvent.hover(within(group).getByText("DP"));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Dimas Pratama · Fotografer");
  });

  it("AC-TEAM-026 shows no tooltips on phones", async () => {
    isMobile.value = true;
    setup();
    const group = screen.getByRole("button", { name: "Tim Wisuda: 4 anggota" });
    await userEvent.hover(within(group).getByText("DP"));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("AC-TEAM-011 opens the Penugasan form from user-plus and Atur tim from the avatar group", async () => {
    const { team } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Tambah tim untuk Foto keluarga" }));
    expect(team.onAdd).toHaveBeenCalledWith(expect.objectContaining({ id: "s1" }));
    await userEvent.click(screen.getByRole("button", { name: "Tim Wisuda: 4 anggota" }));
    expect(team.onManage).toHaveBeenCalledWith(expect.objectContaining({ id: "s2" }));
  });

  it("AC-TEAM-011 offers Tambah tim without Atur tim for a session with no team", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk sesi Foto keluarga" }));
    const items = screen.getAllByRole("menuitem").map((item) => item.textContent);
    expect(items).toEqual(["Tambah tim", "Ubah sesi", "Hapus sesi"]);
  });

  it("AC-TEAM-011 offers Atur tim instead of Tambah tim for a session with a team", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk sesi Wisuda" }));
    const items = screen.getAllByRole("menuitem").map((item) => item.textContent);
    expect(items).toEqual(["Atur tim", "Ubah sesi", "Hapus sesi"]);
  });

  it("AC-TEAM-015 keeps the avatars of a cancelled project and drops user-plus and the menu", () => {
    const cancelled = projectDetailView("CANCELLED", { assignments: WISUDA_TEAM });
    render(
      <ProjectScheduleCard
        project={cancelled}
        isMobile={false}
        team={{ onAdd: vi.fn(), onManage: vi.fn() }}
      />,
    );
    expect(screen.getByRole("button", { name: "Tim Wisuda: 4 anggota" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Tambah tim untuk/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Aksi untuk sesi/ })).not.toBeInTheDocument();
  });

  it("AC-TEAM-021 offers no session or assignment status control", () => {
    setup();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.queryByText(/status sesi|selesai|hadir/i)).not.toBeInTheDocument();
  });

  it("AC-TEAM-011 leaves the rows as F-07 drew them when no team handlers are given", () => {
    setup({ assignments: [] }, false);
    expect(screen.queryByRole("button", { name: /Tambah tim untuk/ })).not.toBeInTheDocument();
  });
});
