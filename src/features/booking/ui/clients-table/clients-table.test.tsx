import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ClientRecord } from "@/features/booking/application/ports/client-repository/client-repository.port";

import { ClientsTable } from "./clients-table";

const rows: readonly ClientRecord[] = [
  {
    id: "rina",
    name: "Rina",
    whatsappNumber: "6281234567890",
    socialLinks: [
      { platform: "INSTAGRAM", value: "rina.wed" },
      { platform: "TIKTOK", value: "https://tiktok.com/@rina" },
    ],
    isArchived: false,
  },
  { id: "ade", name: "ade", whatsappNumber: null, socialLinks: [], isArchived: false },
];

describe("ClientsTable", () => {
  it("AC-CLI-001 AC-CLI-021 renders the client details and total", () => {
    render(<ClientsTable status="ACTIVE" count={38} rows={rows} emptyState={<p>empty</p>} />);

    const table = screen.getByRole("grid", { name: "Daftar klien" });
    expect(within(table).getByText("RI")).toBeInTheDocument();
    expect(within(table).getByText("Rina")).toBeInTheDocument();
    expect(within(table).getByText("+62 812-3456-7890")).toBeInTheDocument();
    expect(within(table).getByText("Instagram · @rina.wed")).toBeInTheDocument();
    expect(within(table).getByText("1")).toBeInTheDocument();
    expect(within(table).getByText("Belum ada nomor WhatsApp")).toBeInTheDocument();
    expect(within(table).getByText("—")).toBeInTheDocument();
    expect(screen.getByText("38 klien aktif")).toBeInTheDocument();
  });

  it("A-2 opens URL social links safely", () => {
    render(
      <ClientsTable
        status="ACTIVE"
        count={1}
        rows={[
          {
            ...rows[0],
            socialLinks: [{ platform: "TIKTOK", value: "https://tiktok.com/@rina" }],
          },
        ]}
        emptyState={<p>empty</p>}
      />,
    );
    expect(screen.getByRole("link", { name: "TikTok · tiktok.com/@rina" })).toHaveAttribute(
      "target",
      "_blank",
    );
  });

  it("AC-CLI-003 renders the external empty state instead of the table", () => {
    render(<ClientsTable status="ACTIVE" count={0} rows={[]} emptyState={<p>Belum ada klien</p>} />);
    expect(screen.getByText("Belum ada klien")).toBeInTheDocument();
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });
});
