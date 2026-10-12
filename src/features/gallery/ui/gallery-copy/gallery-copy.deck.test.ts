import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { GALLERY_COPY } from "./gallery-copy.copy";

const DECK = readFileSync(
  new URL("../../../../../docs/features/bilingual-copy-revamp/copy-deck.md", import.meta.url),
  "utf8",
);

/** An approved deck row carries the EN and the ID text in two cells, verbatim (F-24 AC-SFX-016). */
function expectDeckRow(en: string, id: string): void {
  expect(DECK).toContain(`| ${en} | ${id} |`);
}

describe("gallery copy matches the deck (F-24 AC-SFX-016)", () => {
  it("has the approved empty-state and add-folder rows: sourcesEmptyBody, linkDialogDescription", () => {
    expectDeckRow(
      GALLERY_COPY.messages.en.sourcesEmptyBody,
      GALLERY_COPY.messages.id.sourcesEmptyBody,
    );
    expectDeckRow(
      GALLERY_COPY.messages.en.linkDialogDescription,
      GALLERY_COPY.messages.id.linkDialogDescription,
    );
  });
});
