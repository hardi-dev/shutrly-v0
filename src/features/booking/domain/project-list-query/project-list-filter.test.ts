import { describe, expect, it } from "vitest";

import {
  activeFilterGroupCount,
  EMPTY_PROJECT_FILTER,
  filterToParams,
  parseProjectListParams,
} from "./project-list-filter";
import { filterFormSchema } from "./project-list-filter.schema";

const ID = "00000000-0000-4000-8000-0000000000a1";

describe("project list filter", () => {
  it("AC-PRJ-028 parses a full grammar", () => {
    const { q, filter } = parseProjectListParams(
      {
        q: " rina ",
        status: "BOOKED,SHOOTING",
        from: "2026-10-01",
        to: "2026-11-30",
        noSchedule: "1",
        service: `${ID},not-a-uuid`,
        client: ID,
      },
      "ACTIVE",
    );
    expect(q).toBe("rina");
    expect(filter).toEqual({
      statuses: ["BOOKED", "SHOOTING"],
      from: "2026-10-01",
      to: "2026-11-30",
      includeNoSchedule: true,
      serviceIds: [ID],
      clientId: ID,
    });
  });

  it("AC-PRJ-028 drops unknown statuses, malformed dates and uuids silently", () => {
    const { filter } = parseProjectListParams(
      { status: "BOOKED,COMPLETED,NOPE", from: "2026-13-40", service: "x", client: "y" },
      "ACTIVE",
    );
    expect(filter).toEqual({ ...EMPTY_PROJECT_FILTER, statuses: ["BOOKED"] });
  });

  it("AC-PRJ-028 drops both dates when to is before from", () => {
    const { filter } = parseProjectListParams(
      { from: "2026-11-30", to: "2026-10-01", noSchedule: "1" },
      "ACTIVE",
    );
    expect(filter.from).toBeNull();
    expect(filter.to).toBeNull();
    expect(filter.includeNoSchedule).toBe(false);
  });

  it("AC-PRJ-028 ignores status outside Aktif and noSchedule without dates", () => {
    expect(parseProjectListParams({ status: "BOOKED" }, "COMPLETED").filter.statuses).toEqual([]);
    expect(parseProjectListParams({ noSchedule: "1" }, "ACTIVE").filter.includeNoSchedule).toBe(
      false,
    );
  });

  it("AC-PRJ-028 counts filter groups for the badge, ignoring status outside Aktif", () => {
    const filter = {
      ...EMPTY_PROJECT_FILTER,
      statuses: ["BOOKED" as const],
      from: "2026-10-01",
      clientId: ID,
    };
    expect(activeFilterGroupCount(filter, "ACTIVE")).toBe(3);
    expect(activeFilterGroupCount(filter, "COMPLETED")).toBe(2);
    expect(activeFilterGroupCount(EMPTY_PROJECT_FILTER, "ACTIVE")).toBe(0);
  });

  it("AC-PRJ-028 writes a filter back in grammar order", () => {
    expect(
      filterToParams({
        ...EMPTY_PROJECT_FILTER,
        statuses: ["BOOKED", "SHOOTING"],
        from: "2026-10-01",
        to: "2026-11-30",
      }),
    ).toEqual([
      ["status", "BOOKED,SHOOTING"],
      ["from", "2026-10-01"],
      ["to", "2026-11-30"],
    ]);
  });

  it("AC-PRJ-028 reports TO_BEFORE_FROM on the dialog's to field", () => {
    const result = filterFormSchema.safeParse({
      ...EMPTY_PROJECT_FILTER,
      from: "2026-11-30",
      to: "2026-10-01",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({ path: ["to"], message: "TO_BEFORE_FROM" });
  });
});
