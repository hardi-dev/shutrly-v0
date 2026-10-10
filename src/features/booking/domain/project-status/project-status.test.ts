import { describe, expect, it } from "vitest";

import {
  canCancel,
  cancelReasonRequired,
  canComplete,
  canDeleteDraft,
  canMarkDelivered,
  isDealEditable,
  isScheduleEditable,
  needsSession,
  nextStep,
  PROJECT_STATUSES,
  stepTransition,
  tabStatuses,
} from "./project-status";

describe("project status (BR-PRJ-004, BR-PRJ-009, BR-PRJ-010)", () => {
  it("BR-PRJ-004 each step is one forward move", () => {
    expect(stepTransition("CONFIRM_BOOKING")).toEqual({ from: "DRAFT", to: "BOOKED" });
    expect(stepTransition("START_SHOOTING")).toEqual({ from: "BOOKED", to: "SHOOTING" });
    expect(stepTransition("FINISH_SHOOTING")).toEqual({ from: "SHOOTING", to: "POST_PROCESSING" });
  });

  it("BR-PRJ-004 offers a step only for DRAFT, BOOKED and SHOOTING", () => {
    expect(PROJECT_STATUSES.map(nextStep)).toEqual([
      "CONFIRM_BOOKING",
      "START_SHOOTING",
      "FINISH_SHOOTING",
      null,
      null,
      null,
      null,
    ]);
  });

  it("A-4 groups statuses into the three list tabs", () => {
    expect(tabStatuses("ACTIVE")).toEqual([
      "DRAFT",
      "BOOKED",
      "SHOOTING",
      "POST_PROCESSING",
      "DELIVERED",
    ]);
    expect(tabStatuses("COMPLETED")).toEqual(["COMPLETED"]);
    expect(tabStatuses("CANCELLED")).toEqual(["CANCELLED"]);
  });

  it("BR-PRJ-009 the deal is editable only while DRAFT or BOOKED", () => {
    expect(PROJECT_STATUSES.filter(isDealEditable)).toEqual(["DRAFT", "BOOKED"]);
  });

  it("A-6 the schedule is editable unless CANCELLED", () => {
    expect(PROJECT_STATUSES.filter((status) => !isScheduleEditable(status))).toEqual(["CANCELLED"]);
  });

  it("BR-PRJ-010 cancels from BOOKED and SHOOTING, deletes only DRAFT", () => {
    expect(PROJECT_STATUSES.filter(canCancel)).toEqual(["BOOKED", "SHOOTING"]);
    expect(PROJECT_STATUSES.filter(canDeleteDraft)).toEqual(["DRAFT"]);
  });

  it("BR-PRJ-004 requires a cancel reason from SHOOTING", () => {
    expect(PROJECT_STATUSES.filter(cancelReasonRequired)).toEqual(["SHOOTING"]);
  });

  it("BR-TEAM-003 needs a session from BOOKED on, except CANCELLED", () => {
    expect(PROJECT_STATUSES.filter(needsSession)).toEqual([
      "BOOKED",
      "SHOOTING",
      "POST_PROCESSING",
      "DELIVERED",
      "COMPLETED",
    ]);
  });
});

describe("final delivery and completion (BR-DEL-003, BR-PRJ-005)", () => {
  it("AC-DEL-001 only BOOKED, SHOOTING and POST_PROCESSING can be delivered", () => {
    expect(PROJECT_STATUSES.filter(canMarkDelivered)).toEqual([
      "BOOKED",
      "SHOOTING",
      "POST_PROCESSING",
    ]);
  });

  it("AC-DEL-007 Tandai selesai is offered only on DELIVERED", () => {
    expect(PROJECT_STATUSES.filter(canComplete)).toEqual(["DELIVERED"]);
  });
});
