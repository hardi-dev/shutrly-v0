import { describe, expect, it } from "vitest";

import type { ValueRules } from "../package-value/package-value.types";
import { validateItemList } from "./project-items";

const rules: Readonly<Record<string, ValueRules>> = {
  edit: { valueType: "NUMBER", selectionRequired: true },
  people: { valueType: "RANGE", selectionRequired: false },
  print: { valueType: "NUMBER", selectionRequired: false },
};

describe("project item list (AC-PRJ-017, BR-CAT-001, BR-CAT-002)", () => {
  it("returns canonical values for a valid list", () => {
    const result = validateItemList(
      [
        { definitionId: "edit", value: { type: "NUMBER", value: "25" } },
        { definitionId: "people", value: { type: "RANGE", min: "1", max: "3,5" } },
      ],
      rules,
      "id-ID",
    );
    expect(result.errors).toEqual({});
    expect(result.values).toEqual([
      { type: "NUMBER", value: "25" },
      { type: "RANGE", min: "1", max: "3.5" },
    ]);
  });

  it("AC-PRJ-017 reports value problems on their own index and field", () => {
    const result = validateItemList(
      [
        { definitionId: "edit", value: { type: "NUMBER", value: "2,5" } },
        { definitionId: "people", value: { type: "RANGE", min: "5", max: "2" } },
        { definitionId: "print", value: { type: "NUMBER", value: "-1" } },
        { definitionId: "print", value: { type: "NUMBER", value: "1" } },
      ],
      rules,
      "id-ID",
    );
    expect(result.errors).toEqual({
      "items.0.value": "NOT_WHOLE",
      "items.1.max": "MIN_GREATER_THAN_MAX",
      "items.2.value": "NEGATIVE",
      "items.3.definitionId": "DUPLICATE_DEFINITION",
    });
  });

  it("AC-PRJ-017 flags an unknown definition and a mismatched value type", () => {
    const result = validateItemList(
      [
        { definitionId: "missing", value: { type: "NUMBER", value: "1" } },
        { definitionId: "people", value: { type: "NUMBER", value: "1" } },
      ],
      rules,
      "id-ID",
    );
    expect(result.errors).toEqual({
      "items.0.definitionId": "INVALID",
      "items.1.value": "INVALID",
    });
  });
});
