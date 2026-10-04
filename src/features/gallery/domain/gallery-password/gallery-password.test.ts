import { describe, expect, it } from "vitest";

import { generateGalleryPassword } from "./gallery-password";
import { GALLERY_PASSWORD_WORDS } from "./gallery-password-words";

function sequence(...values: number[]) {
  let index = 0;
  return (maxExclusive: number) => {
    const value = values[index % values.length] % maxExclusive;
    index += 1;
    return value;
  };
}

describe("generateGalleryPassword", () => {
  it("AC-GAL-001 builds <word>-<4 digits> from the word list", () => {
    expect(generateGalleryPassword(sequence(0, 2, 6, 0, 7), "Rina")).toBe("mawar-4829");
  });

  it("A-11 never uses 0 or 1 and always gives 4 digits", () => {
    const random = sequence(5, 0, 1, 7, 3, 9, 4);
    for (let run = 0; run < 50; run += 1) {
      expect(generateGalleryPassword(random, "Rina")).toMatch(/^[a-z]{4,8}-[2-9]{4}$/);
    }
  });

  it("A-11 redraws a word that is part of the client's name", () => {
    expect(generateGalleryPassword(sequence(0, 0, 0, 0, 0), "Mawar Putri")).toMatch(/^melati-/);
  });

  it("BR-GAL-002 proposals fit the 6–64 character rule", () => {
    const shortest = Math.min(...GALLERY_PASSWORD_WORDS.map((word) => word.length));
    expect(shortest + 5).toBeGreaterThanOrEqual(6);
  });

  it("D-4 keeps a large word list of lowercase a–z words, 4–8 letters, no duplicates", () => {
    expect(GALLERY_PASSWORD_WORDS.length).toBeGreaterThanOrEqual(150);
    expect(new Set(GALLERY_PASSWORD_WORDS).size).toBe(GALLERY_PASSWORD_WORDS.length);
    for (const word of GALLERY_PASSWORD_WORDS) expect(word).toMatch(/^[a-z]{4,8}$/);
  });
});
