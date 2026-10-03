import { describe, expect, it } from "vitest";

import type { ShownSession } from "@/features/booking/domain/session/session.types";

import { projectMetaText } from "./project-session-summary";

function shown(
  overrides: Partial<ShownSession> = {},
  location: string | null = "Rumah Rina, Depok",
) {
  return {
    session: {
      id: "s1",
      name: "Foto keluarga",
      date: "2026-11-10",
      startTime: "06:30",
      endTime: null,
      location,
      createdAt: "2026-10-01T00:00:00Z",
    },
    extraCount: 1,
    isPast: false,
    ...overrides,
  } satisfies ShownSession;
}

describe("project meta text", () => {
  it("AC-PRJ-015 joins client, next session, place and the extra count", () => {
    expect(projectMetaText("Rina", shown())).toBe(
      "Rina · Sesi berikutnya Sel, 10 Nov 2026 · 06.30 · Rumah Rina, Depok · +1 sesi",
    );
  });

  it("AC-PRJ-018 says the last session once all are past", () => {
    expect(
      projectMetaText("Rina", shown({ isPast: true, extraCount: 0 }, "Balairung UI, Depok")),
    ).toBe("Rina · Sesi terakhir Sel, 10 Nov 2026 · 06.30 · Balairung UI, Depok");
  });

  it("AC-PRJ-018 says there is no schedule yet", () => {
    expect(projectMetaText("Rina", null)).toBe("Rina · Belum ada jadwal");
  });

  it("AC-PRJ-015 drops the client on phones and a missing place", () => {
    expect(projectMetaText(null, shown({ extraCount: 0 }, null))).toBe(
      "Sesi berikutnya Sel, 10 Nov 2026 · 06.30",
    );
    expect(projectMetaText(null, null)).toBe("Belum ada jadwal");
  });
});
