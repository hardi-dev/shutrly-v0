import { describe, expect, it } from "vitest";

import { isInAllPhotos, isInFinalDelivery, isServableToClient } from "./client-photo-visibility";
import type { ClientPhotoFacts } from "./client-photo-visibility.types";

const proof: ClientPhotoFacts = { kind: "PROOF", isMissing: false, isSourceRemoved: false };
const edited: ClientPhotoFacts = { ...proof, kind: "EDITED" };

describe("client photo visibility (BR-DEL-002, BR-GAL-006, D-15)", () => {
  it("AC-ACC-011 lists only present proofs of linked sources in all photos", () => {
    expect(isInAllPhotos(proof)).toBe(true);
    expect(isInAllPhotos({ ...proof, isMissing: true })).toBe(false);
    expect(isInAllPhotos({ ...proof, isSourceRemoved: true })).toBe(false);
    expect(isInAllPhotos(edited)).toBe(false);
  });

  it("AC-ACC-013 never serves a removed or missing proof", () => {
    expect(isServableToClient({ ...proof, isMissing: true })).toBe(false);
    expect(isServableToClient({ ...proof, isSourceRemoved: true })).toBe(false);
    expect(isServableToClient({ ...edited, isSourceRemoved: true })).toBe(false);
  });

  it("AC-GFL-019 shows a synced edited or print file without any delivery step", () => {
    expect(isInFinalDelivery(edited)).toBe(true);
    expect(isInFinalDelivery({ ...edited, kind: "PRINT" })).toBe(true);
    expect(isServableToClient(edited)).toBe(true);
    expect(isServableToClient({ ...edited, kind: "PRINT" })).toBe(true);
  });

  it("AC-GFL-019 keeps a proof out of final delivery and a missing file out of it", () => {
    expect(isInFinalDelivery(proof)).toBe(false);
    expect(isInFinalDelivery({ ...edited, isMissing: true })).toBe(false);
  });
});
