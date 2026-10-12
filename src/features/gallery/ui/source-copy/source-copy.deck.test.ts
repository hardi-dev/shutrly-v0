import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { SOURCE_COPY } from "./source-copy.copy";

const DECK = readFileSync(
  new URL("../../../../../docs/features/bilingual-copy-revamp/copy-deck.md", import.meta.url),
  "utf8",
);

/** An approved deck row carries the EN and the ID text in two cells, verbatim (F-24 AC-SFX-016). */
function expectDeckRow(en: string, id: string): void {
  expect(DECK).toContain(`| ${en} | ${id} |`);
}

describe("source copy matches the deck (F-24 AC-SFX-016)", () => {
  it("has the approved folder guidance rows: guideStep3, treeEdited, treePrint", () => {
    expectDeckRow(SOURCE_COPY.messages.en.guideStep3, SOURCE_COPY.messages.id.guideStep3);
    expectDeckRow(SOURCE_COPY.messages.en.treeEdited, SOURCE_COPY.messages.id.treeEdited);
    expectDeckRow(SOURCE_COPY.messages.en.treePrint, SOURCE_COPY.messages.id.treePrint);
  });
});
