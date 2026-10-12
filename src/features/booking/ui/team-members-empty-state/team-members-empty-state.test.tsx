import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it, vi } from "vitest";

import { TeamMembersEmptyState } from "./team-members-empty-state";

describe("TeamMembersEmptyState copy", () => {
  it("renders the active empty state in English", () => {
    renderInLocale(
      <TeamMembersEmptyState status="ACTIVE" hasQuery={false} onClearSearch={vi.fn()} />,
      "en",
    );
    expect(screen.getByRole("heading", { name: "No team members yet" })).toBeInTheDocument();
  });

  it("renders the no-match state with its clear action in Indonesian", () => {
    renderInLocale(
      <TeamMembersEmptyState status="ACTIVE" hasQuery onClearSearch={vi.fn()} />,
      "id",
    );
    expect(
      screen.getByRole("heading", { name: "Belum ada anggota yang cocok" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hapus pencarian" })).toBeInTheDocument();
  });
});
