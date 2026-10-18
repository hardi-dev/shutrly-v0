import { describe, expect, it } from "vitest";

import {
  canArchive,
  canDeleteDraft,
  canEditSources,
  canPublish,
  canRotatePassword,
  canSetExpiry,
  canSync,
  galleryAllowedForProject,
  legacyGalleryStatus,
} from "./gallery-status";

const NOW = new Date("2026-10-04T03:00:00Z");

describe("legacyGalleryStatus (F-27 bridge)", () => {
  it("AC-GAL-020 reads an open gallery past its expiry as EXPIRED without a job", () => {
    expect(legacyGalleryStatus("SHOOTING", new Date("2026-10-04T02:59:59Z"), NOW)).toBe("EXPIRED");
    expect(legacyGalleryStatus("SHOOTING", NOW, NOW)).toBe("EXPIRED");
  });

  it("AC-GFL-008 reads an open gallery with a later or no expiry as PUBLISHED", () => {
    expect(legacyGalleryStatus("BOOKED", new Date("2026-10-05T00:00:00Z"), NOW)).toBe("PUBLISHED");
    expect(legacyGalleryStatus("BOOKED", null, NOW)).toBe("PUBLISHED");
  });

  it("AC-GFL-016 reads a cancelled project's gallery as ARCHIVED, even past its expiry", () => {
    expect(legacyGalleryStatus("CANCELLED", null, NOW)).toBe("ARCHIVED");
    expect(legacyGalleryStatus("CANCELLED", new Date("2020-01-01T00:00:00Z"), NOW)).toBe(
      "ARCHIVED",
    );
  });
});

describe("gallery guards", () => {
  it("AC-GAL-003 allows a gallery from BOOKED on, never on DRAFT or CANCELLED", () => {
    expect(galleryAllowedForProject("BOOKED")).toBe(true);
    expect(galleryAllowedForProject("COMPLETED")).toBe(true);
    expect(galleryAllowedForProject("DRAFT")).toBe(false);
    expect(galleryAllowedForProject("CANCELLED")).toBe(false);
  });

  it("AC-GAL-022 refuses every change on an archived gallery", () => {
    expect(canSync("ARCHIVED", "BOOKED")).toBe(false);
    expect(canEditSources("ARCHIVED", "BOOKED")).toBe(false);
    expect(canPublish("ARCHIVED", "BOOKED")).toBe(false);
    expect(canSetExpiry("ARCHIVED", "BOOKED")).toBe(false);
    expect(canRotatePassword("ARCHIVED", "BOOKED")).toBe(false);
    expect(canArchive("ARCHIVED")).toBe(false);
    expect(canDeleteDraft("ARCHIVED")).toBe(false);
  });

  it("AC-GAL-024 leaves a draft on a cancelled project only deletable", () => {
    expect(canSync("DRAFT", "CANCELLED")).toBe(false);
    expect(canEditSources("DRAFT", "CANCELLED")).toBe(false);
    expect(canPublish("DRAFT", "CANCELLED")).toBe(false);
    expect(canSetExpiry("DRAFT", "CANCELLED")).toBe(false);
    expect(canRotatePassword("DRAFT", "CANCELLED")).toBe(false);
    expect(canDeleteDraft("DRAFT")).toBe(true);
  });

  it("BR-GAL-005 publishes only a draft and archives only published or expired", () => {
    expect(canPublish("DRAFT", "BOOKED")).toBe(true);
    expect(canPublish("PUBLISHED", "BOOKED")).toBe(false);
    expect(canArchive("PUBLISHED")).toBe(true);
    expect(canArchive("EXPIRED")).toBe(true);
    expect(canArchive("DRAFT")).toBe(false);
  });

  it("AC-GAL-023 deletes only a draft", () => {
    expect(canDeleteDraft("PUBLISHED")).toBe(false);
    expect(canDeleteDraft("EXPIRED")).toBe(false);
  });

  it("AC-GAL-020 lets an expired gallery change its expiry, password and sources", () => {
    expect(canSetExpiry("EXPIRED", "DELIVERED")).toBe(true);
    expect(canRotatePassword("EXPIRED", "DELIVERED")).toBe(true);
    expect(canSync("EXPIRED", "DELIVERED")).toBe(true);
  });
});
