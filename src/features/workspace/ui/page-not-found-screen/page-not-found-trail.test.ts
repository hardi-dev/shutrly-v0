import { describe, expect, it } from "vitest";

import type { OwnerNavTranslator } from "../owner-nav/owner-nav.types";
import { pageNotFoundTrail } from "./page-not-found-trail";

// The owner-nav labels stand in for the translator: each key reads back as its own name.
const t = ((key: string) => key) as unknown as OwnerNavTranslator;

const MISSING_ID = "7c1e2b9a-0d4f-4e6a-9b8c-1f2e3d4c5b6a";

describe("pageNotFoundTrail (AC-SFX-014)", () => {
  it("shows the workspace and the section of a missing project", () => {
    expect(
      pageNotFoundTrail({
        pathname: `/w/W/projects/${MISSING_ID}`,
        workspaceId: "W",
        workspaceName: "Studio Rina",
        t,
      }),
    ).toEqual([
      { label: "Studio Rina", href: "/w/W" },
      { label: "projects", href: "/w/W/projects" },
    ]);
  });

  it("shows the section of a missing message template", () => {
    expect(
      pageNotFoundTrail({
        pathname: "/w/W/message-templates/no-such-template",
        workspaceId: "W",
        workspaceName: "Studio Rina",
        t,
      }),
    ).toEqual([
      { label: "Studio Rina", href: "/w/W" },
      { label: "messageTemplates", href: "/w/W/message-templates" },
    ]);
  });

  it("shows only the workspace for an unknown section", () => {
    expect(
      pageNotFoundTrail({
        pathname: "/w/W/no-such-section",
        workspaceId: "W",
        workspaceName: "Studio Rina",
        t,
      }),
    ).toEqual([{ label: "Studio Rina", href: "/w/W" }]);
  });

  it("never includes the requested id", () => {
    const items = pageNotFoundTrail({
      pathname: `/w/W/services/${MISSING_ID}`,
      workspaceId: "W",
      workspaceName: "Studio Rina",
      t,
    });
    expect(JSON.stringify(items)).not.toContain(MISSING_ID);
  });
});
