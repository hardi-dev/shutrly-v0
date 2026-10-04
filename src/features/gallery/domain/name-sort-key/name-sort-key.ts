const DIGIT_RUN = /\d+/g;
const PAD = 10;

/** Builds a natural-order sort key: lowercase, with every digit run left-padded so IMG_2 sorts before IMG_10 (A-5, D-13). @param fileName - the file name @returns the sort key */
export function nameSortKey(fileName: string): string {
  return fileName.toLowerCase().replace(DIGIT_RUN, (digits) => digits.padStart(PAD, "0"));
}
