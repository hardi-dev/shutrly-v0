import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { SETUP_CHECKLIST_COPY } from "./setup-checklist.copy";

const DECK = readFileSync(
  new URL("../../../../../docs/features/bilingual-copy-revamp/copy-deck.md", import.meta.url),
  "utf8",
);

/** An approved deck row carries the EN and the ID text in two cells, verbatim (AC-SETUP-017). */
function expectDeckRow(en: string, id: string): void {
  expect(DECK).toContain(`| ${en} | ${id} |`);
}

describe("setup checklist copy matches the deck (AC-SETUP-017)", () => {
  it("has every approved §4.3a and §1 row", () => {
    const { en, id } = SETUP_CHECKLIST_COPY.messages;
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expectDeckRow(en[key], id[key]);
    }
  });
});
