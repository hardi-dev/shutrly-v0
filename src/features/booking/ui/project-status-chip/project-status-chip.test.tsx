import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PROJECT_STATUSES } from "@/features/booking/domain/project-status/project-status";

import { ProjectStatusChip } from "./project-status-chip";
import { projectStatusChip } from "./project-status-props";

describe("project status chip", () => {
  it("AC-PRJ-015 labels and tones all 7 statuses", () => {
    expect(PROJECT_STATUSES.map((status) => projectStatusChip(status))).toEqual([
      { label: "Draf", tone: "neutral", hasDot: true },
      { label: "Dibooking", tone: "info", hasDot: true },
      { label: "Pemotretan", tone: "accent", hasDot: true },
      { label: "Pascaproduksi", tone: "warning", hasDot: true },
      { label: "Terkirim", tone: "success", hasDot: true },
      { label: "Selesai", tone: "success", hasDot: false },
      { label: "Dibatalkan", tone: "neutral", hasDot: true },
    ]);
  });

  it("AC-PRJ-015 renders the label", () => {
    render(<ProjectStatusChip status="BOOKED" />);
    expect(screen.getByText("Dibooking")).toBeInTheDocument();
  });
});
