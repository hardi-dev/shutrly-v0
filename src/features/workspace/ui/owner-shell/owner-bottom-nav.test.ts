import { describe, expect, it } from "vitest";

import { hidesOwnerBottomNav } from "./owner-bottom-nav";

const WS = "A";

describe("hidesOwnerBottomNav", () => {
  it.each([
    "/w/A/projects/new",
    "/w/A/projects/p1",
    "/w/A/projects/p1/",
    "/w/A/projects/p1/gallery",
    "/w/A/projects/p1/gallery/picks",
    "/w/A/projects/p1/gallery/picks/g1",
  ])("hides the Bottom Nav on %s", (path) => {
    expect(hidesOwnerBottomNav(path, WS)).toBe(true);
  });

  it.each([
    "/w/A/projects",
    "/w/A/projects/completed",
    "/w/A/projects/cancelled",
    "/w/A/projects/p1/edit",
    "/w/A/services/s1",
    "/w/A/clients",
    "/w/B/projects/p1",
  ])("keeps the Bottom Nav on %s", (path) => {
    expect(hidesOwnerBottomNav(path, WS)).toBe(false);
  });
});
