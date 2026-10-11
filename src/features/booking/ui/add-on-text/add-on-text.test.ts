import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import type { AddOnRowView } from "@/features/booking/application/use-cases/list-add-ons/list-add-ons.types";
import type { AppLocale } from "@/shared/locale/locale.types";

import { ADD_ON_COPY_NAMESPACE } from "../add-on-copy/add-on.copy";
import type { AddOnTranslate } from "../add-on-copy/add-on-copy.types";
import {
  addOnFieldError,
  addOnMeta,
  addOnStatusChip,
  approveBody,
  cancelBody,
  cancelDescription,
} from "./add-on-text";

const EDIT = {
  id: "g1",
  name: "Foto edit",
  unit: "foto",
  status: "SUBMITTED",
  limit: 8,
  usage: 8,
  isTargetable: true,
} as const;
const ROW: AddOnRowView = {
  id: "a1",
  selectionGroupId: "g1",
  description: "Tambahan 5 foto edit",
  quantity: 5,
  unitPrice: "20000",
  totalAmount: "100000",
  status: "DRAFT",
  approvedAt: new Date("2026-10-05T03:00:00Z"),
  createdAt: new Date("2026-10-04T03:00:00Z"),
  group: EDIT,
};

function translator(locale: AppLocale): AddOnTranslate {
  return copyTranslator(ADD_ON_COPY_NAMESPACE, locale);
}

describe("add-on text (owner-3-addon exports)", () => {
  it("formats the row line in Indonesian and English", () => {
    expect(addOnMeta(ROW, "id-ID", translator("id"))).toBe(
      "Foto edit · 5 × Rp 20.000 = Rp 100.000",
    );
    const album = {
      ...ROW,
      selectionGroupId: null,
      group: null,
      quantity: 1,
      unitPrice: "750000",
      totalAmount: "750000",
    };
    expect(addOnMeta(album, "id-ID", translator("id"))).toBe(
      "Tanpa grup · 1 × Rp 750.000 = Rp 750.000",
    );
    expect(addOnMeta(album, "en-US", translator("en"))).toMatch(/^No group · 1 × /);
  });

  it("maps statuses to the drawn chips in both languages", () => {
    expect(addOnStatusChip("DRAFT", translator("id"))).toEqual({ label: "Draf", tone: "neutral" });
    expect(addOnStatusChip("APPROVED", translator("en"))).toEqual({
      label: "Approved",
      tone: "success",
    });
    expect(addOnStatusChip("CANCELLED", translator("en"))).toEqual({
      label: "Cancelled",
      tone: "danger",
    });
  });

  it("AC-ADD-007 the approve body names the new limit and the reopen of a sent group", () => {
    expect(approveBody(ROW, translator("id"))).toBe(
      "Batas Foto edit naik dari 8 menjadi 13. Pilihan yang sudah dikirim dibuka lagi supaya klien bisa menambah foto dan mengirim ulang. Belum ada invoice dibuat.",
    );
    expect(approveBody(ROW, translator("en"))).toBe(
      "The Foto edit limit increases from 8 to 13. Submitted selections reopen so the client can add photos and send again. No invoice has been created.",
    );
    expect(approveBody({ ...ROW, group: { ...EDIT, status: "OPEN" } }, translator("id"))).toBe(
      "Batas Foto edit naik dari 8 menjadi 13. Belum ada invoice dibuat.",
    );
  });

  it("AC-ADD-005 the cancel dialog names the lowered limit and the approval date", () => {
    const approved = { ...ROW, status: "APPROVED" as const, group: { ...EDIT, limit: 13 } };
    expect(cancelBody(approved, translator("id"))).toBe(
      "Batas Foto edit turun dari 13 menjadi 8. Pembatalan ditolak jika klien sudah memilih lebih dari 8 foto.",
    );
    expect(cancelBody(approved, translator("en"))).toBe(
      "The Foto edit limit drops from 13 to 8. Cancellation is refused if the client selected more than 8 foto.",
    );
    expect(cancelDescription(approved, "id-ID", translator("id"))).toBe(
      "Tambahan 5 foto edit · disetujui 5 Okt 2026",
    );
  });

  it("AC-ADD-006 maps server field errors to the drawn messages in English", () => {
    const en = translator("en");
    expect(addOnFieldError("description", "EMPTY", en)).toBe("Description is required.");
    expect(addOnFieldError("quantity", "TOO_SMALL", en)).toBe(
      "Quantity must be at least 1 and a whole number.",
    );
    expect(addOnFieldError("unitPrice", "NEGATIVE", translator("id"))).toBe(
      "Harga tidak boleh negatif.",
    );
  });
});
