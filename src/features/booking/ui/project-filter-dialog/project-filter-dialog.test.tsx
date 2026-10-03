import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EMPTY_PROJECT_FILTER } from "@/features/booking/domain/project-list-query/project-list-filter";
import type { ProjectFilter } from "@/features/booking/domain/project-list-query/project-list-filter.types";
import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";

import { ProjectFilterButton } from "../project-filter-button/project-filter-button";
import { ProjectFilterDialog } from "./project-filter-dialog";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

function renderDialog(
  overrides: { tab?: ProjectTab; q?: string; filter?: Partial<ProjectFilter> } = {},
) {
  const searchClientsAction = vi.fn(() =>
    Promise.resolve([{ id: "c1", name: "Rina", isArchived: true }]),
  );
  render(
    <ProjectFilterDialog
      isOpen
      onOpenChange={vi.fn()}
      workspaceId="ws"
      tab={overrides.tab ?? "ACTIVE"}
      q={overrides.q ?? ""}
      filter={{ ...EMPTY_PROJECT_FILTER, ...overrides.filter }}
      services={[{ id: "s1", name: "Wisuda Basic", isActive: true }]}
      initialClient={null}
      searchClientsAction={searchClientsAction}
    />,
  );
}

describe("ProjectFilterDialog", () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it("AC-PRJ-028 shows the fields of Aktif with its description", () => {
    renderDialog();
    const dialog = screen.getByRole("dialog", { name: "Filter proyek" });
    expect(within(dialog).getByText("Berlaku untuk tab Aktif.")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /Status/ })).toHaveTextContent(
      "Semua status",
    );
    expect(within(dialog).getByText("Jadwal")).toBeInTheDocument();
    expect(
      within(dialog).getByRole("checkbox", { name: "Sertakan proyek tanpa jadwal" }),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /Layanan/ })).toHaveTextContent(
      "Semua layanan",
    );
    expect(within(dialog).getByRole("combobox", { name: "Klien" })).toBeInTheDocument();
  });

  it("AC-PRJ-028 hides Status outside Aktif", () => {
    renderDialog({ tab: "COMPLETED" });
    expect(screen.getByText("Berlaku untuk tab Selesai.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Status/ })).not.toBeInTheDocument();
  });

  it("AC-PRJ-028 Terapkan writes the grammar to the URL and keeps the search text", async () => {
    renderDialog({
      q: "rina",
      filter: { statuses: ["BOOKED", "SHOOTING"], from: "2026-10-01", to: "2026-11-30" },
    });
    await userEvent.click(screen.getByRole("button", { name: "Terapkan" }));
    expect(replace).toHaveBeenCalledWith(
      "/w/ws/projects?q=rina&status=BOOKED%2CSHOOTING&from=2026-10-01&to=2026-11-30",
    );
  });

  it("AC-PRJ-028 Reset removes the filter but keeps the search text", async () => {
    renderDialog({ q: "rina", filter: { statuses: ["BOOKED"] } });
    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(replace).toHaveBeenCalledWith("/w/ws/projects?q=rina");
  });

  it("AC-PRJ-028 refuses a Sampai before Dari and does not navigate", async () => {
    renderDialog({ filter: { from: "2026-11-30", to: "2026-10-01" } });
    await userEvent.click(screen.getByRole("button", { name: "Terapkan" }));
    expect(screen.getByText("Tanggal Sampai harus sama atau setelah Dari.")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("AC-PRJ-028 shows archived clients with a suffix in the Klien field", async () => {
    renderDialog();
    await userEvent.click(screen.getByRole("combobox", { name: "Klien" }));
    expect(await screen.findByRole("option", { name: /Rina \(diarsipkan\)/ })).toBeInTheDocument();
  });
});

describe("ProjectFilterButton", () => {
  it("AC-PRJ-028 counts the active groups on the badge and ignores Status outside Aktif", () => {
    const filter = { ...EMPTY_PROJECT_FILTER, statuses: ["BOOKED" as const], from: "2026-10-01" };
    const { rerender } = render(
      <ProjectFilterButton tab="ACTIVE" filter={filter} onPress={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "Filter, 2 aktif" })).toBeInTheDocument();
    rerender(<ProjectFilterButton tab="COMPLETED" filter={filter} onPress={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Filter, 1 aktif" })).toBeInTheDocument();
    rerender(<ProjectFilterButton tab="ACTIVE" filter={EMPTY_PROJECT_FILTER} onPress={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Filter" })).toBeInTheDocument();
  });
});
