import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OwnerPageHeading } from "./owner-page-heading";

const parent = { label: "Proyek", href: "/w/A/projects" };

describe("OwnerPageHeading", () => {
  it("renders the title, status chip and meta line, and the phone back link", () => {
    render(
      <OwnerPageHeading
        title="Wisuda Rina"
        status={{ label: "Aktif", tone: "success" }}
        meta="Rina · Sen"
        parent={parent}
        backLabel="Kembali"
      />,
    );

    // One title per breakpoint: the desktop block and the phone compact bar, each hidden on the other.
    expect(screen.getAllByRole("heading", { level: 1, name: "Wisuda Rina" })).toHaveLength(2);
    expect(screen.getByText("Aktif")).toBeInTheDocument();
    expect(screen.getByText("Rina · Sen")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Kembali" })[0]).toHaveAttribute(
      "href",
      "/w/A/projects",
    );
    expect(screen.getByText("Proyek")).toBeInTheDocument();
  });

  it("shows the subtitle when there is no meta line", () => {
    render(
      <OwnerPageHeading
        title="Wisuda Basic"
        subtitle="Paket foto wisuda."
        parent={parent}
        backLabel="Kembali"
      />,
    );

    expect(screen.getByText("Paket foto wisuda.")).toBeInTheDocument();
  });
});
