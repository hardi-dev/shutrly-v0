import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { CATALOG_COPY } from "./catalog-copy.copy";

const DECK = readFileSync(
  new URL("../../../../../docs/features/bilingual-copy-revamp/copy-deck.md", import.meta.url),
  "utf8",
);

/** An approved deck row carries the EN and the ID text in two cells, verbatim (F-24 AC-SFX-016). */
function expectDeckRow(en: string, id: string): void {
  expect(DECK).toContain(`| ${en} | ${id} |`);
}

describe("catalog copy matches the deck (F-24 AC-SFX-016, AC-SFX-017)", () => {
  it("has the approved pick-mode and booking field dialog rows", () => {
    expectDeckRow(CATALOG_COPY.messages.en.pickModeMeta, CATALOG_COPY.messages.id.pickModeMeta);
    expectDeckRow(
      CATALOG_COPY.messages.en.fieldDialogDescription,
      CATALOG_COPY.messages.id.fieldDialogDescription,
    );
  });
});
