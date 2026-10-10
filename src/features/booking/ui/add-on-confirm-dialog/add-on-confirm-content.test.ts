import { describe, expect, it } from "vitest";

import type { AddOnRowView } from "@/features/booking/application/use-cases/list-add-ons/list-add-ons.types";

import { addOnConfirmContent } from "./add-on-confirm-content";

const ROW: AddOnRowView = {
  id: "a1",
  selectionGroupId: "g1",
  description: "Tambahan 5 foto edit",
  quantity: 5,
  unitPrice: "20000",
  totalAmount: "100000",
  status: "APPROVED",
  approvedAt: new Date("2026-10-05T03:00:00Z"),
  createdAt: new Date("2026-10-04T03:00:00Z"),
  group: {
    id: "g1",
    name: "Foto edit",
    unit: "foto",
    status: "OPEN",
    limit: 13,
    usage: 11,
    isTargetable: true,
  },
};

describe("add-on confirms (owner-3-addon dialogs)", () => {
  it("AC-ADD-001 approve shows the description with the total", () => {
    const content = addOnConfirmContent({ kind: "APPROVE", row: { ...ROW, status: "DRAFT" } });
    expect(content.description).toBe("Tambahan 5 foto edit · Rp 100.000");
    expect([content.confirmLabel, content.cancelLabel, content.isDanger]).toEqual([
      "Setujui add-on",
      "Batal",
      false,
    ]);
  });

  it("AC-ADD-005 cancel is destructive with Kembali", () => {
    const content = addOnConfirmContent({ kind: "CANCEL", row: ROW });
    expect([content.title, content.cancelLabel, content.isDanger]).toEqual([
      "Batalkan add-on?",
      "Kembali",
      true,
    ]);
  });

  it("AC-ADD-005 the refusal names the usage and the limit it would leave", () => {
    const content = addOnConfirmContent({ kind: "REFUSED", row: ROW, usage: 11, limit: 8 });
    expect(content.body).toBe(
      "Klien sudah memilih 11 foto. Jika add-on ini dibatalkan, batas turun menjadi 8. Minta klien melepas foto lebih dulu.",
    );
    expect([content.confirmLabel, content.cancelLabel]).toEqual(["Mengerti", null]);
  });
});
