import { screen, within } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import type { SetupStep } from "@/features/workspace/domain/setup-checklist/setup-checklist.types";

import { SetupChecklistRow } from "./setup-checklist-row";

function renderRow(step: SetupStep, locale: "en" | "id" = "en") {
  return renderInLocale(
    <ul>
      <SetupChecklistRow workspaceId="ws-1" workspaceName="Explore Studio" step={step} />
    </ul>,
    locale,
  );
}

describe("SetupChecklistRow", () => {
  it("AC-SETUP-001 AC-SETUP-020 shows the current step's only action as a link button", () => {
    renderRow({ key: "service", state: "current", target: { kind: "addService" } });
    const row = screen.getByRole("listitem");
    expect(within(row).getByText("Add a service")).toBeInTheDocument();
    expect(within(row).getByText("Required")).toBeInTheDocument();
    expect(
      within(row).getByText("Projects come from services; add categories in Add service"),
    ).toBeInTheDocument();
    const links = within(row).getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName("Add service");
    expect(links[0]).toHaveAttribute("href", "/w/ws-1/services?add=service");
  });

  it("AC-SETUP-012 makes an open step one link named by its title", () => {
    renderRow({ key: "firstProject", state: "open", target: { kind: "newProject" } });
    const links = within(screen.getByRole("listitem")).getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName("Create your first project");
    expect(links[0]).toHaveAttribute("href", "/w/ws-1/projects/new");
    expect(screen.queryByText("New project")).not.toBeInTheDocument();
  });

  it("AC-SETUP-018 C-008 gives an open row a visible keyboard focus ring", () => {
    renderRow({ key: "firstProject", state: "open", target: { kind: "newProject" } });
    expect(screen.getByRole("link")).toHaveClass(
      "focus-visible:shadow-[inset_0_0_0_2px_var(--color-semantic-focus-ring)]",
    );
  });

  it("AC-SETUP-014 interpolates the workspace name clients see until a brand name is set", () => {
    renderRow({ key: "brandName", state: "open", target: { kind: "settings" } });
    expect(screen.getByText("Optional")).toBeInTheDocument();
    expect(
      screen.getByText("Clients see Explore Studio in messages and galleries until then"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/w/ws-1/settings");
  });

  it("AC-SETUP-018 shows a done step as Done text with no action", () => {
    renderRow({ key: "service", state: "done", target: { kind: "addService" } });
    const row = screen.getByRole("listitem");
    expect(within(row).getByText("Done")).toBeInTheDocument();
    expect(within(row).queryByText("Required")).not.toBeInTheDocument();
    expect(within(row).queryByRole("link")).not.toBeInTheDocument();
    expect(within(row).queryByRole("button")).not.toBeInTheDocument();
  });

  it("AC-SETUP-013 AC-SETUP-018 shows a locked step's hint with nothing to focus", () => {
    renderRow({ key: "packageItems", state: "locked", target: { kind: "services" } });
    const row = screen.getByRole("listitem");
    expect(within(row).getByText("This step opens after you add a service")).toBeInTheDocument();
    expect(
      within(row).queryByText("“Foto edit 50” limits how many photos clients pick"),
    ).not.toBeInTheDocument();
    expect(within(row).getByText("Recommended")).toBeInTheDocument();
    expect(within(row).queryByRole("link")).not.toBeInTheDocument();
    expect(within(row).queryByRole("button")).not.toBeInTheDocument();
  });

  it("AC-SETUP-017 renders the current step in Indonesian", () => {
    renderRow(
      { key: "packageItems", state: "current", target: { kind: "service", serviceId: "svc-1" } },
      "id",
    );
    expect(screen.getByText("Disarankan")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAccessibleName("Tambah isi paket");
    expect(screen.getByRole("link")).toHaveAttribute("href", "/w/ws-1/services/svc-1");
  });
});
