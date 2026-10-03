import { describe, expect, it } from "vitest";

import {
  CANCEL_REASON_MAX_LENGTH,
  defaultProjectTitle,
  PROJECT_NOTES_MAX_LENGTH,
  PROJECT_TITLE_MAX_LENGTH,
} from "./project-record";
import {
  agreedPriceSchema,
  cancelReasonSchema,
  projectNotesSchema,
  projectTitleSchema,
} from "./project-record.schema";

const issue = (
  schema: { safeParse: (v: unknown) => { error?: { issues: { message: string }[] } } },
  raw: unknown,
) => schema.safeParse(raw).error?.issues[0]?.message;

describe("project record (BR-PRJ-008)", () => {
  it("AC-PRJ-010 rejects an empty or over-long title after trimming", () => {
    expect(issue(projectTitleSchema, "  ")).toBe("EMPTY");
    expect(issue(projectTitleSchema, "a".repeat(PROJECT_TITLE_MAX_LENGTH + 1))).toBe("TOO_LONG");
    expect(projectTitleSchema.parse("  Wisuda Basic — Rina ")).toBe("Wisuda Basic — Rina");
  });

  it("AC-PRJ-010 limits notes and turns blank notes into null", () => {
    expect(issue(projectNotesSchema, "a".repeat(PROJECT_NOTES_MAX_LENGTH + 1))).toBe("TOO_LONG");
    expect(projectNotesSchema.parse("   ")).toBeNull();
    expect(projectNotesSchema.parse(null)).toBeNull();
    expect(projectNotesSchema.parse(" ok ")).toBe("ok");
  });

  it("AC-PRJ-011 parses the agreed price as whole rupiah", () => {
    expect(issue(agreedPriceSchema, "-1")).toBe("NEGATIVE");
    expect(issue(agreedPriceSchema, "10,5")).toBe("NOT_WHOLE");
    expect(issue(agreedPriceSchema, "1.000.000.000.000")).toBe("TOO_LARGE");
    expect(issue(agreedPriceSchema, "")).toBe("EMPTY");
    expect(issue(agreedPriceSchema, "abc")).toBe("INVALID");
    expect(agreedPriceSchema.parse("Rp 700.000")).toBe("700000");
    expect(agreedPriceSchema.parse("0")).toBe("0");
  });

  it("BR-PRJ-004 limits the cancel reason and turns blank into null", () => {
    expect(issue(cancelReasonSchema, "a".repeat(CANCEL_REASON_MAX_LENGTH + 1))).toBe("TOO_LONG");
    expect(cancelReasonSchema.parse("  ")).toBeNull();
    expect(cancelReasonSchema.parse(" Klien batal ")).toBe("Klien batal");
  });

  it("AC-PRJ-007 builds the default title from service and client", () => {
    expect(defaultProjectTitle("Wisuda Basic", "Rina")).toBe("Wisuda Basic — Rina");
    expect(Array.from(defaultProjectTitle("a".repeat(80), "b".repeat(80)))).toHaveLength(
      PROJECT_TITLE_MAX_LENGTH,
    );
  });
});
