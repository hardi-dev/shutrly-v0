import { DELIVERY_SCREEN_COPY as COPY } from "./delivery-screen.copy";

/** The card's line for the open tab, e.g. "24 file · Foto edit" (F-21). @param name - the open item @param count - its files @returns the line */
export function groupMeta(name: string, count: number): string {
  return COPY.groupMeta(count, name);
}

/** The failure alert's body, naming every failed file (hasilakhir-gagal-unduh, AC-DEL-005). @param names - the failed files' names @returns the body */
export function failedBody(names: readonly string[]): string {
  return COPY.failedBody(names.join(", "));
}

/** The viewer's line, e.g. "Hasil akhir · Foto edit · 3 dari 24" (hasilakhir-pratinjau, F-21). @param name - the open item @param index - the open file's index @param total - files of the item @returns the line */
export function viewerMeta(name: string, index: number, total: number): string {
  return COPY.viewerMeta(name, index + 1, total);
}
