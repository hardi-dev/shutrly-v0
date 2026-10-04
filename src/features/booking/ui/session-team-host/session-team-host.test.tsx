import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";

import { projectDetailView } from "../../../../../tests/support/booking/project-detail-view";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

import type { SessionTeamHandlers } from "../project-detail-screen/project-detail-screen.types";

const { SessionTeamHost } = await import("./session-team-host");

const ASSIGNED = [
  {
    id: "a1",
    sessionId: "s2",
    memberId: "11111111-1111-4111-8111-111111111111",
    memberName: "Dimas Pratama",
    isMemberArchived: false,
    roleName: "Fotografer",
  },
];

const DIMAS = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Dimas Pratama",
  roles: [{ id: "r1", name: "Fotografer" }],
};

function Controls({
  team,
  project,
}: Readonly<{
  team: SessionTeamHandlers;
  project: ReturnType<typeof projectDetailView>;
}>) {
  function handleAdd(): void {
    team.onAdd(project.sessions[1]);
  }
  function handleManage(): void {
    team.onManage(project.sessions[1]);
  }
  return (
    <>
      <button type="button" onClick={handleAdd}>
        add-wisuda
      </button>
      <button type="button" onClick={handleManage}>
        manage-wisuda
      </button>
    </>
  );
}

function setup(status: ProjectStatus = "BOOKED", assignments: never[] = []) {
  const project = projectDetailView(status, { assignments });
  render(
    <SessionTeamHost
      workspaceId="ws"
      project={project}
      assignableMembers={[DIMAS]}
      addAssignmentAction={vi.fn()}
      removeAssignmentAction={vi.fn()}
    >
      {(team) => <Controls team={team} project={project} />}
    </SessionTeamHost>,
  );
}

describe("SessionTeamHost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-TEAM-011 opens the Penugasan form for the session whose user-plus was pressed", async () => {
    setup();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByText("add-wisuda"));
    expect(screen.getByRole("dialog", { name: "Tambah anggota · Wisuda" })).toBeInTheDocument();
  });

  it("AC-TEAM-013 offers only the members who are not on the session yet", async () => {
    setup("BOOKED", [
      {
        id: "a1",
        sessionId: "s2",
        memberId: DIMAS.id,
        memberName: "Dimas Pratama",
        isMemberArchived: false,
        roleName: "Fotografer",
      },
    ] as never[]);
    await userEvent.click(screen.getByText("add-wisuda"));
    expect(screen.getByText("Belum ada anggota tim aktif")).toBeInTheDocument();
  });

  it("AC-TEAM-014 opens Atur tim for a session with a team, and Tambah anggota returns to it", async () => {
    setup("BOOKED", ASSIGNED as never[]);
    await userEvent.click(screen.getByText("manage-wisuda"));
    expect(screen.getByRole("dialog", { name: "Tim · Wisuda" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tambah anggota" }));
    expect(screen.getByRole("dialog", { name: "Tambah anggota · Wisuda" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.getByRole("dialog", { name: "Tim · Wisuda" })).toBeInTheDocument();
  });

  it("AC-TEAM-014 shows nothing when the session has no team left", async () => {
    setup("BOOKED", []);
    await userEvent.click(screen.getByText("manage-wisuda"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("AC-TEAM-015 shows the team read-only for a cancelled project", async () => {
    setup("CANCELLED", ASSIGNED as never[]);
    await userEvent.click(screen.getByText("manage-wisuda"));
    const dialog = screen.getByRole("dialog", { name: "Tim · Wisuda" });
    expect(
      within(dialog).getByText("Proyek dibatalkan, tim tidak bisa diubah."),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: "Hapus dari sesi" }),
    ).not.toBeInTheDocument();
  });
});
