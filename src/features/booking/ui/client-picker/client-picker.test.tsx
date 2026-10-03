import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import type { ClientOption } from "@/features/booking/application/ports/project-repository/project-repository.port";

import { ClientPicker } from "./client-picker";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const RINA: ClientOption = {
  id: "c1",
  name: "Rina",
  whatsappNumber: "6281234567890",
  projectCount: 1,
};

const searchAction = () => Promise.resolve([RINA]);

function Harness({
  createAction,
}: Readonly<{ createAction: NonNullable<Parameters<typeof ClientPicker>[0]["createAction"]> }>) {
  const [selected, setSelected] = useState<ClientOption | null>(null);
  return (
    <ClientPicker
      workspaceId="ws"
      selectedClient={selected}
      onSelect={setSelected}
      searchAction={searchAction}
      createAction={createAction}
    />
  );
}

async function openCreateDialog() {
  const input = screen.getByRole("combobox", { name: "Klien" });
  await userEvent.type(input, "Sar");
  await userEvent.click(await screen.findByRole("option", { name: /Tambah klien baru “Sar”/ }));
  return screen.getByRole("dialog", { name: "Tambah klien" });
}

describe("ClientPicker inline creation (AC-PRJ-013)", () => {
  it("AC-PRJ-013 opens the client dialog prefilled with the query and its own description", async () => {
    render(<Harness createAction={vi.fn()} />);
    const dialog = await openCreateDialog();
    expect(
      within(dialog).getByText("Klien baru langsung dipilih untuk proyek ini."),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("textbox", { name: "Nama klien" })).toHaveValue("Sar");
  });

  it("AC-PRJ-013 selects the saved client and shows its number", async () => {
    const createAction = vi.fn(() =>
      Promise.resolve({
        ok: true as const,
        client: { id: "c2", name: "Sari", whatsappNumber: "6281234567891" },
      }),
    );
    render(<Harness createAction={createAction} />);
    const dialog = await openCreateDialog();
    const name = within(dialog).getByRole("textbox", { name: "Nama klien" });
    await userEvent.clear(name);
    await userEvent.type(name, "Sari");
    await userEvent.type(
      within(dialog).getByRole("textbox", { name: /WhatsApp/ }),
      "0812 3456 7891",
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Tambah klien" }));
    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: "Klien" })).toHaveValue("Sari");
    });
    expect(createAction).toHaveBeenCalledWith("ws", expect.objectContaining({ name: "Sari" }));
    expect(screen.getByText("+62 812-3456-7891")).toBeInTheDocument();
  });

  it("AC-PRJ-013 leaves the picker untouched when the dialog is cancelled", async () => {
    const createAction = vi.fn();
    render(<Harness createAction={createAction} />);
    const dialog = await openCreateDialog();
    await userEvent.click(within(dialog).getByRole("button", { name: "Batal" }));
    expect(createAction).not.toHaveBeenCalled();
    expect(screen.getByRole("combobox", { name: "Klien" })).toHaveValue("Sar");
  });

  it("AC-PRJ-013 keeps a validation error inside the dialog", async () => {
    const createAction = vi.fn(() =>
      Promise.resolve({
        ok: false as const,
        code: "VALIDATION_FAILED" as const,
        fieldErrors: { name: "EMPTY" as const },
      }),
    );
    render(<Harness createAction={createAction} />);
    const dialog = await openCreateDialog();
    await userEvent.type(
      within(dialog).getByRole("textbox", { name: /WhatsApp/ }),
      "0812 3456 7890",
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Tambah klien" }));
    expect(await screen.findByRole("dialog", { name: "Tambah klien" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Klien", hidden: true })).toHaveValue("Sar");
  });
});
