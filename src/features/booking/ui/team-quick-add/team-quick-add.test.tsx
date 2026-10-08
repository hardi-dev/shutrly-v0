import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useMobileViewport = vi.fn();

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));

const { TeamQuickAddProvider } = await import("./team-quick-add");
const { SessionDialog } = await import("../session-dialog/session-dialog");
const { AssignmentDialog } = await import("../assignment-dialog/assignment-dialog");

const { PROJECT_COPY } = await import("../project-copy/project-copy.copy");
const ASSIGN_SUBMIT = PROJECT_COPY.assignSubmit;

const FOTOGRAFER = { id: "6f1c1b0e-8a5d-4a43-a3b6-3c2f7c0f1a11", name: "Fotografer" };
const SESSION = {
  id: "s-1",
  name: "Wisuda",
  date: "2026-10-15",
  startTime: null,
  endTime: null,
  location: null,
  createdAt: "2026-10-07T00:00:00Z",
};

function quickAdd() {
  const addAction = vi.fn().mockResolvedValue({ ok: true, member: { id: "m-1", name: "Rina" } });
  const value = {
    workspaceId: "ws",
    roles: [FOTOGRAFER],
    addAction,
    updateAction: vi.fn(),
    addRoleAction: vi.fn(),
  };
  return { value, addAction };
}

async function addRina() {
  const dialog = screen.getByRole("dialog", { name: "Tambah anggota" });
  await userEvent.type(within(dialog).getByLabelText("Nama"), "Rina");
  await userEvent.type(within(dialog).getByLabelText("Nomor WhatsApp"), "0812-3456-7890");
  await userEvent.click(within(dialog).getByRole("button", { name: /^Peran/ }));
  await userEvent.click(screen.getByRole("option", { name: "Fotografer" }));
  await userEvent.keyboard("{Escape}");
  await userEvent.click(within(dialog).getByRole("button", { name: "Simpan" }));
}

describe("TeamQuickAdd (Revision OT #1, #2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMobileViewport.mockReturnValue(false);
  });

  it("Revision OT #1 Tambah sesi with no members adds one on top and picks them", async () => {
    const { value, addAction } = quickAdd();
    const onSave = vi.fn();
    render(
      <TeamQuickAddProvider value={value}>
        <SessionDialog isOpen onOpenChange={vi.fn()} session={null} onSave={onSave} members={[]} />
      </TeamQuickAddProvider>,
    );
    expect(screen.getByText(/Tambahkan di sini, lalu dia langsung dipilih/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tambah anggota" }));
    await addRina();
    await waitFor(() => {
      expect(addAction).toHaveBeenCalledTimes(1);
    });
    const list = await screen.findByRole("list", { name: /Tim/ });
    expect(list).toHaveTextContent("Rina");
    expect(list).toHaveTextContent("Fotografer");
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: /sesi/i })).toBeInTheDocument();
  });

  it("Revision OT #2 Tambah anggota on a session with no members replaces Buka Tim and preselects the new member", async () => {
    const { value } = quickAdd();
    render(
      <TeamQuickAddProvider value={value}>
        <AssignmentDialog
          isOpen
          workspaceId="ws"
          projectId="p-1"
          session={SESSION}
          members={[]}
          onOpenChange={vi.fn()}
          onSaved={vi.fn()}
          addAction={vi.fn()}
        />
      </TeamQuickAddProvider>,
    );
    expect(screen.queryByRole("button", { name: "Buka Tim" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tambah anggota" }));
    await addRina();
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Tambah anggota" })).not.toBeInTheDocument();
    });
    const assign = screen.getByRole("dialog", { name: /Wisuda/ });
    expect(assign).toHaveTextContent("Rina");
    expect(assign).toHaveTextContent("Fotografer");
    expect(within(assign).getByRole("button", { name: ASSIGN_SUBMIT })).toBeEnabled();
  });

  it("Revision OT #2 without a provider keeps Buka Tim", () => {
    render(
      <AssignmentDialog
        isOpen
        workspaceId="ws"
        projectId="p-1"
        session={SESSION}
        members={[]}
        onOpenChange={vi.fn()}
        onSaved={vi.fn()}
        addAction={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Buka Tim" })).toBeInTheDocument();
  });
});
