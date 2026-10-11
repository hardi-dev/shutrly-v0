import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { ComingSoonScreen } from "./coming-soon-screen";

describe("ComingSoonScreen copy", () => {
  it("AC-L10N-002 renders the coming-soon placeholder in English", () => {
    renderInLocale(<ComingSoonScreen workspaceId="ws-1" section="projects" />, "en");
    expect(screen.getByRole("heading", { name: "Coming soon" })).toBeInTheDocument();
    expect(screen.getByText("This feature isn’t available yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to dashboard" })).toHaveAttribute(
      "href",
      "/w/ws-1",
    );
  });

  it("AC-L10N-002 renders the coming-soon placeholder in Indonesian", () => {
    renderInLocale(<ComingSoonScreen workspaceId="ws-1" section="projects" />, "id");
    expect(screen.getByRole("heading", { name: "Segera hadir" })).toBeInTheDocument();
    expect(screen.getByText("Fitur ini belum tersedia.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kembali ke dasbor" })).toBeInTheDocument();
  });
});
