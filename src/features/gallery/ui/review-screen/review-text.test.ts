import { describe, expect, it } from "vitest";

import type { PickGroupView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";

import type { ClientTranslate } from "../client-copy/client-copy.types";
import { reviewHeader, type ReviewTranslate } from "./review-text";

// The review and shared messages (Indonesian) the header reads; the stubs stand in for next-intl.
const REVIEW_LABELS: Readonly<Record<string, string>> = {
  breadcrumbCurrent: "Tinjau",
  backToPick: "Kembali memilih",
};
const SHARED_LABELS: Readonly<Record<string, string>> = { home: "Beranda" };
const t = ((key: string) => REVIEW_LABELS[key] ?? key) as unknown as ReviewTranslate;
const shared = ((key: string) => SHARED_LABELS[key] ?? key) as unknown as ClientTranslate;

const group: PickGroupView = {
  id: "g1",
  name: "Foto cetak",
  unit: "lembar",
  mode: "QUANTITY",
  allowsPickNotes: false,
  limit: 4,
  usage: 4,
  status: "OPEN",
};

describe("reviewHeader (F-23 R-5)", () => {
  it("AC-CRUMB-008 links the group crumb while the group is OPEN", () => {
    expect(reviewHeader(t, shared, group, "T", true).breadcrumbs).toEqual([
      { label: "Beranda", href: "/g/T" },
      { label: "Foto cetak", href: "/g/T/picks/g1" },
      { label: "Tinjau" },
    ]);
  });

  it("AC-CRUMB-008 keeps Tinjau and drops the group link when read-only", () => {
    const header = reviewHeader(t, shared, { ...group, status: "LOCKED" }, "T", false);
    expect(header.title).toBe("Foto cetak");
    expect(header.breadcrumbs).toEqual([
      { label: "Beranda", href: "/g/T" },
      { label: "Foto cetak" },
      { label: "Tinjau" },
    ]);
    expect(header.back).toEqual({ href: "/g/T", label: "Beranda" });
  });
});
