import { describe, expect, it } from "vitest";

import { pageNotFoundBackTarget } from "./page-not-found-back-target";

describe("pageNotFoundBackTarget (AC-SFX-011, AC-SFX-014)", () => {
  it("goes back to the parent section of a missing project", () => {
    expect(pageNotFoundBackTarget("/w/W/projects/x")).toEqual({
      kind: "section",
      section: "projects",
      href: "/w/W/projects",
    });
  });

  it("goes back to the parent section of a missing service", () => {
    expect(pageNotFoundBackTarget("/w/W/services/x")).toEqual({
      kind: "section",
      section: "services",
      href: "/w/W/services",
    });
  });

  it("goes back to the parent section of a missing message template", () => {
    expect(pageNotFoundBackTarget("/w/W/message-templates/x")).toEqual({
      kind: "section",
      section: "message-templates",
      href: "/w/W/message-templates",
    });
  });

  it("goes back to the dashboard for an unknown section", () => {
    expect(pageNotFoundBackTarget("/w/W/unknown")).toEqual({
      kind: "dashboard",
      href: "/w/W",
    });
  });

  it("goes back to the dashboard when the section itself is the missing page", () => {
    expect(pageNotFoundBackTarget("/w/W/projects")).toEqual({
      kind: "dashboard",
      href: "/w/W",
    });
  });

  it("ignores a trailing slash after the section", () => {
    expect(pageNotFoundBackTarget("/w/W/clients/x/")).toEqual({
      kind: "section",
      section: "clients",
      href: "/w/W/clients",
    });
  });
});
