import { describe, expect, it } from "vitest";

import {
  clientBrowseKind,
  isInAllPhotos,
  isInFinalDelivery,
  isServableToClient,
} from "./client-photo-visibility";
import type { ClientPhotoFacts } from "./client-photo-visibility.types";

const proof: ClientPhotoFacts = { kind: "PROOF", isMissing: false, isSourceRemoved: false };
const edited: ClientPhotoFacts = { ...proof, kind: "EDITED" };

describe("client photo visibility (BR-DEL-002, BR-GAL-006, D-15)", () => {
  it("AC-ACC-011 lists only present proofs of linked sources before delivery", () => {
    expect(isInAllPhotos(proof)).toBe(true);
    expect(isInAllPhotos({ ...proof, isMissing: true })).toBe(false);
    expect(isInAllPhotos({ ...proof, isSourceRemoved: true })).toBe(false);
    expect(isInAllPhotos(edited)).toBe(false);
    expect(isServableToClient(edited, false)).toBe(false);
    expect(isServableToClient({ ...proof, kind: "PRINT" }, false)).toBe(false);
  });

  it("AC-DEL-003 shows edited and print files only after final delivery", () => {
    expect(isInFinalDelivery(edited, true)).toBe(true);
    expect(isInFinalDelivery({ ...edited, kind: "PRINT" }, true)).toBe(true);
    expect(isInFinalDelivery(proof, true)).toBe(false);
    expect(isInFinalDelivery({ ...edited, isMissing: true }, true)).toBe(false);
    expect(isServableToClient(edited, true)).toBe(true);
  });
});

describe("clientBrowseKind (BR-DEL-002)", () => {
  it("AC-DEL-001 opens Edited and Print once final delivery is published", () => {
    expect(clientBrowseKind("EDITED", true)).toBe("EDITED");
    expect(clientBrowseKind("PRINT", true)).toBe("PRINT");
  });

  it("AC-ACC-011 keeps a client on proofs before delivery, whatever the page asks", () => {
    expect(clientBrowseKind("EDITED", false)).toBe("PROOF");
    expect(clientBrowseKind("PROOF", true)).toBe("PROOF");
  });
});
