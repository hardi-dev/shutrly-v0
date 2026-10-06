import type { DeliveryKind } from "../use-delivery-screen/use-delivery-screen.types";
import { DELIVERY_SCREEN_COPY as COPY } from "./delivery-screen.copy";

/** The card's line for the open kind, e.g. "24 foto Edited" or "6 file Print". @param kind - the open kind @param count - its files @returns the line */
export function kindMeta(kind: DeliveryKind, count: number): string {
  return kind === "EDITED" ? COPY.editedMeta(count) : COPY.printMeta(count);
}

/** The failure alert's body, naming every failed file (hasilakhir-gagal-unduh, AC-DEL-005). @param names - the failed files' names @returns the body */
export function failedBody(names: readonly string[]): string {
  return COPY.failedBody(names.join(", "));
}

/** The viewer's line, e.g. "Hasil akhir · Edited · 3 dari 24" (hasilakhir-pratinjau). @param kind - the open kind @param index - the open file's index @param total - files of the kind @returns the line */
export function viewerMeta(kind: DeliveryKind, index: number, total: number): string {
  return COPY.viewerMeta(kind === "EDITED" ? COPY.edited : COPY.print, index + 1, total);
}
