import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { PROJECT_COPY } from "./project-copy.copy";

const DECK = readFileSync(
  new URL("../../../../../docs/features/bilingual-copy-revamp/copy-deck.md", import.meta.url),
  "utf8",
);

/** An approved deck row carries the EN and the ID text in two cells, verbatim (AC-SETUP-016). */
function expectDeckRow(en: string, id: string): void {
  expect(DECK).toContain(`| ${en} | ${id} |`);
}

describe("New project no-service copy matches the deck (AC-SETUP-016)", () => {
  it("has the approved title, body and action rows", () => {
    const { en, id } = PROJECT_COPY.messages;
    expectDeckRow(en.noServiceTitle, id.noServiceTitle);
    expectDeckRow(en.noServiceBody, id.noServiceBody);
    expectDeckRow(en.noServiceAction, id.noServiceAction);
  });
});
