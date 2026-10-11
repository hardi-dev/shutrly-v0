import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import type { AddOnRowView } from "@/features/booking/application/use-cases/list-add-ons/list-add-ons.types";
import type { AppLocale } from "@/shared/locale/locale.types";

import { ADD_ON_COPY_NAMESPACE } from "../add-on-copy/add-on.copy";
import type { AddOnTranslate } from "../add-on-copy/add-on-copy.types";
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

function translator(locale: AppLocale): AddOnTranslate {
  return copyTranslator(ADD_ON_COPY_NAMESPACE, locale);
}

describe("add-on confirms (owner-3-addon dialogs)", () => {
  it("AC-ADD-001 approve shows the description with the total in Indonesian", () => {
    const content = addOnConfirmContent(
      { kind: "APPROVE", row: { ...ROW, status: "DRAFT" } },
      "id-ID",
      translator("id"),
    );
    expect(content.description).toBe("Tambahan 5 foto edit · Rp 100.000");
    expect([content.confirmLabel, content.cancelLabel, content.isDanger]).toEqual([
      "Setujui",
      "Batal",
      false,
    ]);
  });

  it("AC-ADD-001 approve is titled in English", () => {
    const content = addOnConfirmContent(
      { kind: "APPROVE", row: { ...ROW, status: "DRAFT" } },
      "en-US",
      translator("en"),
    );
    expect([content.title, content.confirmLabel, content.cancelLabel]).toEqual([
      "Approve this add-on?",
      "Approve",
      "Cancel",
    ]);
  });

  it("AC-ADD-005 cancel is destructive with Kembali", () => {
    const content = addOnConfirmContent({ kind: "CANCEL", row: ROW }, "id-ID", translator("id"));
    expect([content.title, content.cancelLabel, content.isDanger]).toEqual([
      "Batalkan add-on?",
      "Kembali",
      true,
    ]);
  });

  it("AC-ADD-005 the refusal shows the usage and asks the client to remove photos", () => {
    const content = addOnConfirmContent(
      { kind: "REFUSED", row: ROW, usage: 11, limit: 8 },
      "en-US",
      translator("en"),
    );
    expect(content.title).toBe("Add-on can’t be cancelled");
    expect(content.body).toMatch(
      /selected 11 .*limit to 8\. Ask the client to remove photos first\.$/,
    );
    expect([content.confirmLabel, content.cancelLabel]).toEqual(["Mengerti", null]);
  });
});
