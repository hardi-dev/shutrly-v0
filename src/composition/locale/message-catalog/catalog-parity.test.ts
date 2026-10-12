import { describe, expect, it } from "vitest";

import { findParityProblems } from "./catalog-parity";
import type { CopyModule } from "./message-catalog.types";

const copy = (en: Record<string, string>, id: Record<string, string>): CopyModule => ({
  namespace: "fixture.copy",
  surface: "shared",
  messages: { en, id },
});

describe("catalog parity", () => {
  it("AC-L10N-003 reports a key missing in id", () => {
    expect(findParityProblems([copy({ a: "A", b: "B" }, { a: "A" })])).toEqual([
      { namespace: "fixture.copy", key: "b", problem: "MISSING" },
    ]);
  });

  it("AC-L10N-003 reports an empty string", () => {
    expect(findParityProblems([copy({ a: "A" }, { a: "" })])).toEqual([
      { namespace: "fixture.copy", key: "a", problem: "EMPTY" },
    ]);
  });

  it("AC-L10N-003 reports a placeholder present in only one language", () => {
    expect(findParityProblems([copy({ a: "Hi {name}" }, { a: "Halo" })])).toEqual([
      { namespace: "fixture.copy", key: "a", problem: "ARGUMENTS_DIFFER" },
    ]);
  });

  it("AC-L10N-003 reports a plural argument that differs", () => {
    expect(
      findParityProblems([
        copy({ a: "{count, plural, one {# photo} other {# photos}}" }, { a: "{total} foto" }),
      ]),
    ).toEqual([{ namespace: "fixture.copy", key: "a", problem: "ARGUMENTS_DIFFER" }]);
  });

  it("AC-L10N-003 accepts a plural in both languages with different option sets", () => {
    expect(
      findParityProblems([
        copy(
          { a: "{count, plural, one {# photo} other {# photos}}" },
          { a: "{count, plural, other {# foto}}" },
        ),
      ]),
    ).toEqual([]);
  });

  it("AC-L10N-003 reports an ICU message that does not parse", () => {
    expect(findParityProblems([copy({ a: "Hi {name" }, { a: "Halo" })])).toEqual([
      { namespace: "fixture.copy", key: "a", problem: "INVALID" },
    ]);
  });

  it("AC-L10N-003 a matching pair has no problems", () => {
    expect(findParityProblems([copy({ a: "Hi {name}" }, { a: "Halo {name}" })])).toEqual([]);
  });
});
