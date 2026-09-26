import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { TokenExplorer } from "./token-explorer";
import type { TokenRecord } from "./token-explorer.types";

const records: readonly TokenRecord[] = [
  {
    path: "color.semantic.surface.canvas",
    cssName: "--color-semantic-surface-canvas",
    type: "color",
    light: "#ffffff",
    dark: "#09090b",
    alias: undefined,
    description: "Page canvas",
  },
  {
    path: "space.4",
    cssName: "--space-4",
    type: "dimension",
    light: 16,
    dark: undefined,
    alias: undefined,
    description: "Sibling gap",
  },
  {
    path: "color.semantic.text.primary",
    cssName: "--color-semantic-text-primary",
    type: "color",
    light: "{color.primitive.neutral.900}",
    dark: "{color.primitive.neutral.50}",
    alias: "color.primitive.neutral.900",
    description: "Primary text",
  },
];

describe("TokenExplorer", () => {
  it("filters by search text", async () => {
    const user = userEvent.setup();
    render(<TokenExplorer records={records} />);

    await user.type(screen.getByRole("searchbox", { name: /search tokens/i }), "canvas");

    expect(screen.getByText("color.semantic.surface.canvas")).toBeVisible();
    expect(screen.queryByText("space.4")).not.toBeInTheDocument();
  });

  it("shows light, dark, alias, and CSS variable data", () => {
    render(<TokenExplorer records={records} />);

    expect(screen.getByText("Light")).toBeVisible();
    expect(screen.getByText("Dark")).toBeVisible();
    expect(screen.getByText("--color-semantic-surface-canvas")).toBeVisible();
    expect(screen.getByText("color.primitive.neutral.900")).toBeVisible();
  });
});
