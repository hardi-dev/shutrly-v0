import { describe, expect, it } from "vitest";

import { groupBySection } from "./select-sections";

describe("select sections", () => {
  it("groups options by section in first-seen order", () => {
    const groups = groupBySection([
      { id: "a", label: "A", section: "Wisuda" },
      { id: "b", label: "B", section: "Prewed" },
      { id: "c", label: "C", section: "Wisuda" },
    ]);
    expect(groups.map((group) => [group.section, group.options.map((o) => o.id)])).toEqual([
      ["Wisuda", ["a", "c"]],
      ["Prewed", ["b"]],
    ]);
  });

  it("keeps options without a section in one unlabeled group", () => {
    expect(
      groupBySection([
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ]),
    ).toEqual([
      {
        section: null,
        options: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ],
      },
    ]);
  });
});
