import { describe, expect, it } from "vitest";

import { clientLanding, homeGreeting, homeGroupCards } from "./client-home";
import type { HomeGroupInput } from "./client-home.types";

const edit: HomeGroupInput = { id: "e", name: "Foto edit", status: "OPEN", limit: 8, usage: 3 };
const print: HomeGroupInput = { id: "p", name: "Foto cetak", status: "OPEN", limit: 4, usage: 0 };

describe("client home (A-24, A-31)", () => {
  it("AC-SEL-012 AC-GFL-019 skips Beranda only without groups and without a synced finished file", () => {
    expect(clientLanding(0, false)).toBe("ALL_PHOTOS");
    expect(clientLanding(0, true)).toBe("HOME");
    expect(clientLanding(2, false)).toBe("HOME");
  });

  it("AC-GFL-009 disables the pick action of every group while no photo is visible", () => {
    const cards = homeGroupCards([edit, print], false);
    expect(cards.map((card) => [card.action, card.isDisabled])).toEqual([
      ["CONTINUE", true],
      ["START", true],
    ]);
    expect(homeGroupCards([{ ...edit, status: "SUBMITTED" }], false)[0]).toMatchObject({
      action: "VIEW",
      isDisabled: false,
    });
  });

  it("AC-SEL-001 makes the first open group the primary task", () => {
    expect(homeGroupCards([edit, print]).map((card) => [card.action, card.isPrimary])).toEqual([
      ["CONTINUE", true],
      ["START", false],
    ]);
  });

  it("AC-SEL-017 moves the primary task past a submitted group", () => {
    const cards = homeGroupCards([{ ...edit, status: "SUBMITTED" }, print]);
    expect(cards.map((card) => [card.action, card.isPrimary, card.progress])).toEqual([
      ["VIEW", false, 1],
      ["START", true, 0],
    ]);
  });

  it("AC-SEL-016 A-21 offers nothing for a zero limit", () => {
    const [zero] = homeGroupCards([{ ...print, limit: 0 }]);
    expect(zero).toMatchObject({ action: "NONE", isPrimary: false, progress: 0 });
  });

  it("names what was sent and what is left", () => {
    expect(homeGreeting([edit, print], false)).toEqual({ kind: "START" });
    expect(homeGreeting([{ ...edit, status: "SUBMITTED" }, print], false)).toEqual({
      kind: "PARTLY_SENT",
      sent: ["Foto edit"],
      open: ["Foto cetak"],
    });
    expect(homeGreeting([{ ...edit, status: "LOCKED" }], false)).toEqual({ kind: "ALL_SENT" });
    expect(homeGreeting([edit], true)).toEqual({ kind: "DELIVERED" });
  });
});
