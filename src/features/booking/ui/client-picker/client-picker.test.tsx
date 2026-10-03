import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const search = vi.hoisted(() => vi.fn());
vi.mock("../use-client-search/use-client-search", () => ({ useClientSearch: search }));

const { ClientPicker } = await import("./client-picker");

const RINA = { id: "c1", name: "Rina", whatsappNumber: "6281234567890", projectCount: 2 };
const MARINA = { id: "c2", name: "Marina Putri", whatsappNumber: null, projectCount: 0 };

describe("ClientPicker (AC-PRJ-006)", () => {
  beforeEach(() => {
    search.mockReturnValue({ items: [RINA, MARINA], isLoading: false });
  });

  it("AC-PRJ-006 reads number · projects, or that there is no number", async () => {
    render(
      <ClientPicker
        workspaceId="ws"
        selectedClient={null}
        onSelect={vi.fn()}
        searchAction={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Klien" }));
    expect(
      screen.getByRole("option", { name: /Rina.*\+62 812-3456-7890 · 2 proyek/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /Marina Putri.*Belum ada nomor WhatsApp/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("KLIEN · 2 COCOK")).toBeInTheDocument();
  });

  it("AC-PRJ-006 selecting a match reports the whole client", async () => {
    const onSelect = vi.fn();
    render(
      <ClientPicker
        workspaceId="ws"
        selectedClient={null}
        onSelect={onSelect}
        searchAction={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Klien" }));
    await userEvent.click(screen.getByRole("option", { name: /Marina Putri/ }));
    expect(onSelect).toHaveBeenCalledWith(MARINA);
  });

  it("AC-PRJ-006 names the query when nothing matches", async () => {
    search.mockReturnValue({ items: [], isLoading: false });
    render(
      <ClientPicker
        workspaceId="ws"
        selectedClient={null}
        onSelect={vi.fn()}
        searchAction={vi.fn()}
      />,
    );
    await userEvent.type(screen.getByRole("combobox", { name: "Klien" }), "Zul");
    expect(screen.getByText("TIDAK ADA KLIEN “Zul”")).toBeInTheDocument();
  });

  it("AC-PRJ-007 shows the chosen client's number as the helper", () => {
    render(
      <ClientPicker
        workspaceId="ws"
        selectedClient={RINA}
        onSelect={vi.fn()}
        searchAction={vi.fn()}
      />,
    );
    expect(screen.getByRole("combobox", { name: "Klien" })).toHaveValue("Rina");
    expect(screen.getByText("+62 812-3456-7890")).toBeInTheDocument();
  });

  it("AC-PRJ-012 shows the inactive-client error", () => {
    render(
      <ClientPicker
        workspaceId="ws"
        selectedClient={RINA}
        onSelect={vi.fn()}
        searchAction={vi.fn()}
        errorMessage="Klien ini sudah diarsipkan. Pilih klien lain."
      />,
    );
    expect(screen.getByText("Klien ini sudah diarsipkan. Pilih klien lain.")).toBeInTheDocument();
  });
});
