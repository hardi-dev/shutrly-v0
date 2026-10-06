// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ClientHeader } from "./client-header";

describe("ClientHeader", () => {
  it("shows the studio mark, studio name and project title", () => {
    render(<ClientHeader studioName="studio Senja" projectTitle="Wisuda Rina" />);
    expect(screen.getByRole("banner")).toHaveTextContent("Sstudio SenjaWisuda Rina");
  });
});
