import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { DataTable } from "./data-table";
import { DataTableSkeleton } from "./data-table-skeleton";

const columns = [
  { id: "name", label: "KLIEN" },
  { id: "phone", label: "WHATSAPP", width: 184 },
  { id: "actions", "aria-label": "Aksi", width: 32 },
] as const;
const rows = [
  { id: "a", name: "Anisa Putri", phone: "+62 813-2200-4512" },
  { id: "b", name: "Rina", phone: "+62 812-3456-7890" },
];

function renderCell(row: (typeof rows)[number], columnId: string) {
  if (columnId === "actions") return null;
  if (columnId === "name") return row.name;
  return row.phone;
}

describe("DataTable (C27)", () => {
  it("AC-CLI-001 renders only the table inside a SectionCard that owns the heading and search", () => {
    render(
      <SectionCard
        title="Daftar klien"
        description="38 klien aktif"
        actions={<input aria-label="Cari" />}
        content="bleed"
      >
        <DataTable label="Daftar klien" columns={columns} rows={rows} renderCell={renderCell} />
      </SectionCard>,
    );
    const table = screen.getByRole("grid", { name: "Daftar klien" });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual(["KLIEN", "WHATSAPP", ""]);
    expect(within(table).getByRole("columnheader", { name: "Aksi" })).toBeInTheDocument();
    expect(within(table).getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("38 klien aktif")).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Cari" })).toBeVisible();
  });

  it("AC-CLI-012 runs the row action on click and Enter", async () => {
    const onRowAction = vi.fn();
    render(
      <DataTable
        label="Daftar klien"
        columns={columns}
        rows={rows}
        renderCell={renderCell}
        onRowAction={onRowAction}
      />,
    );
    await userEvent.click(screen.getByText("Rina"));
    expect(onRowAction).toHaveBeenLastCalledWith(rows[1]);
    await userEvent.keyboard("{ArrowUp}{Enter}");
    expect(onRowAction).toHaveBeenLastCalledWith(rows[0]);
  });

  it("allows a consumer to compose an empty state in SectionCard without DataTable", () => {
    render(
      <SectionCard title="Daftar klien">
        <EmptyState
          placement="in-card"
          icon="users"
          title="Belum ada klien"
          body="Tambahkan klien untuk mulai mengelola informasi kontak mereka."
        />
      </SectionCard>,
    );
    expect(screen.getByTestId("empty-state")).toBeVisible();
    expect(screen.queryByRole("grid", { name: "Daftar klien" })).toBeNull();
  });

  it("renders skeleton rows with the header for the loading state", () => {
    render(<DataTableSkeleton label="Daftar klien" columns={columns} rowCount={5} />);
    expect(screen.getAllByTestId("data-table-skeleton-row")).toHaveLength(5);
    expect(screen.getByText("KLIEN")).toBeVisible();
  });
});
