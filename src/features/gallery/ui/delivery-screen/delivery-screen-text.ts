import type { DeliveryScreenTranslate } from "./delivery-screen.types";

/** The card's line for the open tab, e.g. "24 file · Foto edit" (F-21). @param name - the open item @param count - its files @returns the line */
export function groupMeta(t: DeliveryScreenTranslate, name: string, count: number): string {
  return t("groupMeta", { count: count, name: name });
}

/** The failure alert's body, naming every failed file (hasilakhir-gagal-unduh, AC-DEL-005). @param names - the failed files' names @returns the body */
export function failedBody(t: DeliveryScreenTranslate, names: readonly string[]): string {
  return t("failedBody", { names: names.join(", ") });
}

/** The viewer's line, e.g. "Hasil akhir · Foto edit · 3 dari 24" (hasilakhir-pratinjau, F-21). @param name - the open item @param index - the open file's index @param total - files of the item @returns the line */
export function viewerMeta(
  t: DeliveryScreenTranslate,
  name: string,
  index: number,
  total: number,
): string {
  return t("viewerMeta", { kind: name, position: index + 1, total: total });
}
