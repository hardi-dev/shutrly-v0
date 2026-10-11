import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { ClientsEmptyState } from "./clients-empty-state";

describe("ClientsEmptyState copy", () => {
  it("renders the active empty state in English", () => {
    renderInLocale(<ClientsEmptyState status="ACTIVE" />, "en");
    expect(screen.getByRole("heading", { name: "No active clients yet" })).toBeInTheDocument();
    expect(
      screen.getByText("Add someone booking a shoot, then choose them when creating a project."),
    ).toBeInTheDocument();
  });

  it("renders the archive empty state in Indonesian", () => {
    renderInLocale(<ClientsEmptyState status="ARCHIVED" />, "id");
    expect(screen.getByRole("heading", { name: "Belum ada klien di arsip" })).toBeInTheDocument();
    expect(
      screen.getByText("Klien yang diarsipkan muncul di sini. Kamu bisa memulihkannya kapan saja."),
    ).toBeInTheDocument();
  });
});
