import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { WorkspaceNotFoundScreen } from "./workspace-not-found-screen";

describe("WorkspaceNotFoundScreen copy", () => {
  it("AC-L10N-002 renders the not-found workspace in English", () => {
    renderInLocale(<WorkspaceNotFoundScreen />, "en");
    expect(screen.getByRole("heading", { name: "Workspace not found" })).toBeInTheDocument();
    expect(screen.getByText("This workspace isn’t available.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to workspaces" })).toBeInTheDocument();
  });

  it("AC-L10N-002 renders the not-found workspace in Indonesian", () => {
    renderInLocale(<WorkspaceNotFoundScreen />, "id");
    expect(
      screen.getByRole("heading", { name: "Ruang kerja tidak ditemukan" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ruang kerja ini tidak tersedia.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kembali ke ruang kerja" })).toBeInTheDocument();
  });
});
