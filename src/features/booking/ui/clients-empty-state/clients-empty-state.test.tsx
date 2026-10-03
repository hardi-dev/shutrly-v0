import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/ui/primitives/button/button";

import { ClientsEmptyState } from "./clients-empty-state";

describe("ClientsEmptyState", () => {
  it("AC-CLI-003 gives active and archived views their own copy", () => {
    const { rerender } = render(
      <ClientsEmptyState status="ACTIVE" action={<Button>Tambah klien</Button>} />,
    );
    expect(screen.getByRole("heading", { name: "Belum ada klien aktif" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah klien" })).toBeInTheDocument();
    rerender(<ClientsEmptyState status="ARCHIVED" />);
    expect(screen.getByRole("heading", { name: "Belum ada klien di arsip" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tambah klien" })).not.toBeInTheDocument();
  });
});
