import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { PAGE_NOT_FOUND_COPY } from "./page-not-found-screen.copy";

const DECK = readFileSync(
  new URL("../../../../../docs/features/bilingual-copy-revamp/copy-deck.md", import.meta.url),
  "utf8",
);

/** An approved deck row carries the EN and the ID text in two cells, verbatim (F-24 AC-SFX-016). */
function expectDeckRow(en: string, id: string): void {
  expect(DECK).toContain(`| ${en} | ${id} |`);
}

describe("page-not-found copy matches the deck (F-24 AC-SFX-016)", () => {
  it("has the approved title, body and back-link rows", () => {
    const { en, id } = PAGE_NOT_FOUND_COPY.messages;
    expectDeckRow(en.title, id.title);
    expectDeckRow(en.body, id.body);
    expectDeckRow(en.backToSection, id.backToSection);
    expectDeckRow(en.backToDashboard, id.backToDashboard);
  });
});
