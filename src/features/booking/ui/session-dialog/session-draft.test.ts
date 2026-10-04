import { describe, expect, it } from "vitest";

import { EMPTY_SESSION_DRAFT, toSessionDraft, validateSessionDraft } from "./session-draft";

describe("session draft (AC-PRJ-029)", () => {
  it("AC-PRJ-029 reports every field error with its Indonesian message", () => {
    const result = validateSessionDraft({
      ...EMPTY_SESSION_DRAFT,
      startTime: "10:00",
      endTime: "09:00",
    });
    expect(result).toEqual({
      errors: {
        name: "Isi nama sesi.",
        date: "Pilih tanggal sesi.",
        endTime: "Jam selesai harus setelah jam mulai.",
      },
    });
  });

  it("AC-PRJ-029 accepts a name and date alone and trims the location to null", () => {
    expect(
      validateSessionDraft({ ...EMPTY_SESSION_DRAFT, name: " Akad ", date: "2026-11-10" }),
    ).toEqual({
      session: {
        name: "Akad",
        date: "2026-11-10",
        startTime: null,
        endTime: null,
        location: null,
        team: [],
      },
    });
  });

  it("AC-PRJ-029 fills the dialog from a stored session", () => {
    expect(
      toSessionDraft({
        name: "Wisuda",
        date: "2026-11-10",
        startTime: "07:30",
        endTime: null,
        location: null,
      }),
    ).toEqual({
      name: "Wisuda",
      date: "2026-11-10",
      startTime: "07:30",
      endTime: null,
      location: "",
      team: [],
    });
    expect(toSessionDraft(null)).toEqual(EMPTY_SESSION_DRAFT);
  });
});
