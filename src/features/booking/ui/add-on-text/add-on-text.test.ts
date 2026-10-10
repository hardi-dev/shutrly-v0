import { describe, expect, it } from "vitest";

import type { AddOnRowView } from "@/features/booking/application/use-cases/list-add-ons/list-add-ons.types";

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

describe("add-on text (owner-3-addon exports)", () => {
  it("formats the row line as in addon-kartu", () => {
    expect(addOnMeta(ROW, "id-ID")).toBe("Foto edit · 5 × Rp 20.000 = Rp 100.000");
    const album = {
      ...ROW,
      selectionGroupId: null,
      group: null,
      quantity: 1,
      unitPrice: "750000",
      totalAmount: "750000",
    };
    expect(addOnMeta(album, "id-ID")).toBe("Tanpa grup · 1 × Rp 750.000 = Rp 750.000");
  });

  it("maps statuses to the drawn chips", () => {
    expect(addOnStatusChip("DRAFT")).toEqual({ label: "Draf", tone: "neutral" });
    expect(addOnStatusChip("APPROVED")).toEqual({ label: "Disetujui", tone: "success" });
    expect(addOnStatusChip("CANCELLED")).toEqual({ label: "Dibatalkan", tone: "danger" });
  });

  it("AC-ADD-007 the approve body names the new limit and the reopen of a sent group", () => {
    expect(approveBody(ROW)).toBe(
      "Batas Foto edit naik dari 8 menjadi 13. Pilihan Foto edit yang sudah dikirim dibuka lagi supaya klien bisa menambah foto dan mengirim ulang. Belum ada invoice dibuat.",
    );
    expect(approveBody({ ...ROW, group: { ...EDIT, status: "OPEN" } })).toBe(
      "Batas Foto edit naik dari 8 menjadi 13. Belum ada invoice dibuat.",
    );
  });

  it("AC-ADD-005 the cancel dialog names the lowered limit and the approval date", () => {
    const approved = { ...ROW, status: "APPROVED" as const, group: { ...EDIT, limit: 13 } };
    expect(cancelBody(approved)).toBe(
      "Batas Foto edit turun dari 13 menjadi 8. Pembatalan ditolak jika klien sudah memilih lebih dari 8 foto.",
    );
    expect(cancelDescription(approved, "id-ID")).toBe(
      "Tambahan 5 foto edit · disetujui 5 Okt 2026",
    );
  });

  it("AC-ADD-006 maps server field errors to the drawn messages", () => {
    expect(addOnFieldError("description", "EMPTY")).toBe("Deskripsi wajib diisi.");
    expect(addOnFieldError("quantity", "TOO_SMALL")).toBe("Jumlah minimal 1.");
    expect(addOnFieldError("unitPrice", "NEGATIVE")).toBe("Harga tidak boleh negatif.");
  });
});
