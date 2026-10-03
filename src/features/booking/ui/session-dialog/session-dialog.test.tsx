import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

const { SessionDialog } = await import("./session-dialog");

const MEMBERS = [
  { id: "m1", name: "Dimas Pratama", roles: [{ id: "r1", name: "Fotografer" }] },
  { id: "m2", name: "Sari Lestari", roles: [{ id: "r2", name: "Asisten" }] },
];

async function pick(dialog: HTMLElement, name: string) {
  await userEvent.click(within(dialog).getByRole("button", { name: /Anggota tim/ }));
  await userEvent.click(screen.getByRole("option", { name }));
}

async function fillSession(dialog: HTMLElement) {
  await userEvent.type(within(dialog).getByRole("textbox", { name: /Nama sesi/ }), "Akad");
  await userEvent.click(within(dialog).getByRole("button", { name: /Tanggal/ }));
  await userEvent.click(within(screen.getByRole("grid")).getByText("15"));
}

describe("SessionDialog team (AC-TEAM-028)", () => {
  it("AC-TEAM-028 keeps a member that was chosen but not added when the session is saved", async () => {
    const onSave = vi.fn();
    render(
      <SessionDialog
        isOpen
        onOpenChange={vi.fn()}
        session={null}
        members={MEMBERS}
        onSave={onSave}
      />,
    );
    const dialog = screen.getByRole("dialog");
    await fillSession(dialog);
    await pick(dialog, "Dimas Pratama");
    await userEvent.click(within(dialog).getByRole("button", { name: "Tambah anggota" }));
    await pick(dialog, "Sari Lestari");
    await userEvent.click(within(dialog).getByRole("button", { name: "Tambah sesi" }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        team: [
          { memberId: "m1", roleId: "r1" },
          { memberId: "m2", roleId: "r2" },
        ],
      }),
    );
  });

  it("AC-TEAM-028 saves no team when nothing was chosen", async () => {
    const onSave = vi.fn();
    render(
      <SessionDialog
        isOpen
        onOpenChange={vi.fn()}
        session={null}
        members={MEMBERS}
        onSave={onSave}
      />,
    );
    const dialog = screen.getByRole("dialog");
    await fillSession(dialog);
    await userEvent.click(within(dialog).getByRole("button", { name: "Tambah sesi" }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ team: [] }));
  });
});
