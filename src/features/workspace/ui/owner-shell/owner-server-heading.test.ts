import { describe, expect, it } from "vitest";

import { hasServerPageHeading } from "./owner-server-heading";

const WS = "A";

describe("hasServerPageHeading", () => {
  it.each([
    "/w/A/projects/p1",
    "/w/A/projects/p1/",
    "/w/A/projects/p1/gallery",
    "/w/A/projects/p1/gallery/picks",
    "/w/A/projects/p1/gallery/picks/g1",
    "/w/A/projects/new",
    "/w/A/services/s1",
  ])("renders a server heading on %s", (path) => {
    expect(hasServerPageHeading(path, WS)).toBe(true);
  });

  it.each([
    "/w/A",
    "/w/A/",
    "/w/A/projects",
    "/w/A/projects/completed",
    "/w/A/projects/cancelled",
    "/w/A/projects/p1/invoices",
    "/w/A/clients",
    "/w/A/clients/archived",
    "/w/A/services",
    "/w/A/services/categories",
    "/w/A/services/items",
    "/w/A/team",
    "/w/A/team/roles",
    "/w/A/message-templates",
    "/w/A/message-templates/gallery-share",
    "/w/A/photo-sources",
    "/w/A/settings",
    "/w/B/projects/p1",
    "/projects/p1",
  ])("keeps the URL heading on %s", (path) => {
    expect(hasServerPageHeading(path, WS)).toBe(false);
  });
});
