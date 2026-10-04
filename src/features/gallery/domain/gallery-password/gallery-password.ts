import type { RandomInt } from "./gallery-password.types";
import { GALLERY_PASSWORD_WORDS } from "./gallery-password-words";

export const GALLERY_PASSWORD_MIN = 6;
export const GALLERY_PASSWORD_MAX = 64;
const DIGIT_COUNT = 4;
// 2–9 only: no 0 or 1, which look like O and l (A-11).
const DIGITS = "23456789";

function nameWords(clientName: string): ReadonlySet<string> {
  return new Set(clientName.toLowerCase().split(/[^a-z]+/));
}

/** Generates an easy-to-type password `<word>-<4 digits>` that never contains a word of the client's name (BR-GAL-002, A-11, D-4). @param randomInt - CSPRNG-backed integer source @param clientName - the project's client name @returns the proposal, e.g. mawar-4821 */
export function generateGalleryPassword(randomInt: RandomInt, clientName: string): string {
  const excluded = nameWords(clientName);
  const words = GALLERY_PASSWORD_WORDS.filter((word) => !excluded.has(word));
  const word = words[randomInt(words.length)];
  let digits = "";
  for (let index = 0; index < DIGIT_COUNT; index += 1) {
    digits += DIGITS[randomInt(DIGITS.length)];
  }
  return `${word}-${digits}`;
}
