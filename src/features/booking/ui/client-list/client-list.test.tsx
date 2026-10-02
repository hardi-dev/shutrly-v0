import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/ui/primitives/button/button";

import { ClientList } from "./client-list";

describe("ClientList", () => {
  it("AC-CLI-001 renders the phone card with its compact client rows", () => {
    render(
      <ClientList
        status="ACTIVE"
        count={1}
        rows={[
          {
            id: "rina",
            name: "Rina",
            whatsappNumber: "6281234567890",
            socialLinks: [{ platform: "INSTAGRAM", value: "rina.wed" }],
            isArchived: false,
          },
        ]}
        action={<Button variant="secondary">Tambah</Button>}
        emptyState={<p>empty</p>}
      />,
    );
    expect(screen.getByRole("heading", { name: "Daftar klien" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah" })).toBeInTheDocument();
    expect(screen.getByText("RI")).toBeInTheDocument();
    expect(screen.getByText("+62 812-3456-7890")).toBeInTheDocument();
    expect(screen.queryByText("Instagram · @rina.wed")).not.toBeInTheDocument();
  });
});
