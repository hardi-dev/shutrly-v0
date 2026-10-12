import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import type { ShownSession } from "@/features/booking/domain/session/session.types";

import { PROJECT_COPY_NAMESPACE } from "../project-copy/project-copy.copy";
import { projectMetaLine, projectMetaText } from "./project-session-summary";

const t = copyTranslator(PROJECT_COPY_NAMESPACE, "id");

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
    expect(projectMetaText(t, "Rina", shown(), "id-ID")).toBe(
      "Rina · Sesi berikutnya Sel, 10 Nov 2026 · 06.30 · Rumah Rina, Depok · +1 sesi",
    );
  });

  it("AC-PRJ-018 says the last session once all are past", () => {
    expect(
      projectMetaText(
        t,
        "Rina",
        shown({ isPast: true, extraCount: 0 }, "Balairung UI, Depok"),
        "id-ID",
      ),
    ).toBe("Rina · Sesi terakhir Sel, 10 Nov 2026 · 06.30 · Balairung UI, Depok");
  });

  it("AC-PRJ-018 says there is no schedule yet", () => {
    expect(projectMetaText(t, "Rina", null, "id-ID")).toBe("Rina · Belum ada jadwal sesi");
  });

  it("AC-PRJ-015 drops the client on phones and a missing place", () => {
    expect(projectMetaText(t, null, shown({ extraCount: 0 }, null), "id-ID")).toBe(
      "Sesi berikutnya Sel, 10 Nov 2026 · 06.30",
    );
    expect(projectMetaText(t, null, null, "id-ID")).toBe("Belum ada jadwal sesi");
  });

  it("Owner 7: puts the client before a given line", () => {
    expect(projectMetaLine("Rina", "Hasil akhir dipublikasikan Sen, 5 Okt 2026")).toBe(
      "Rina · Hasil akhir dipublikasikan Sen, 5 Okt 2026",
    );
  });
});
