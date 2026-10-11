import { screen } from "@testing-library/react";
import { copyTranslator } from "@tests/support/copy/copy-messages";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { PROJECT_STATUSES } from "@/features/booking/domain/project-status/project-status";

import { PROJECT_COPY_NAMESPACE } from "../project-copy/project-copy.copy";
import { ProjectStatusChip } from "./project-status-chip";
import { projectStatusChip } from "./project-status-props";

describe("project status chip", () => {
  it("AC-PRJ-015 labels and tones all 7 statuses in Indonesian", () => {
    const t = copyTranslator(PROJECT_COPY_NAMESPACE, "id");
    expect(PROJECT_STATUSES.map((status) => projectStatusChip(t, status))).toEqual([
      { label: "Draf", tone: "neutral", hasDot: true },
      { label: "Dipesan", tone: "info", hasDot: true },
      { label: "Pemotretan", tone: "accent", hasDot: true },
      { label: "Pascaproduksi", tone: "warning", hasDot: true },
      { label: "Terkirim", tone: "success", hasDot: true },
      { label: "Selesai", tone: "success", hasDot: false },
      { label: "Dibatalkan", tone: "neutral", hasDot: true },
    ]);
  });

  it("AC-PRJ-015 renders the English label", () => {
    renderInLocale(<ProjectStatusChip status="BOOKED" />, "en");
    expect(screen.getByText("Booked")).toBeInTheDocument();
  });

  it("AC-PRJ-015 renders the Indonesian label", () => {
    renderInLocale(<ProjectStatusChip status="BOOKED" />, "id");
    expect(screen.getByText("Dipesan")).toBeInTheDocument();
  });
});
