import type { ClientTranslate } from "../client-copy/client-copy.types";
import type { PhotoTarget } from "../use-pick-targets/use-pick-targets.types";
import type { ViewerPickTranslate } from "./viewer-pick-actions.types";

const STATUS_KEYS = {
  OPEN: "groupStatusOpen",
  SUBMITTED: "groupStatusSubmitted",
  LOCKED: "groupStatusLocked",
} as const;

/** The *Pilih untuk…* menu line under a group: usage, then a tap hint, the photo's pick or the closed status (pratinjau-pilih-untuk eG55x, A-30). @param t - the viewer pick translate function @param shared - the shared client translate function @param target - the group and the photo's pick in it @returns the line */
export function targetDescription(
  t: ViewerPickTranslate,
  shared: ClientTranslate,
  { group, pick }: PhotoTarget,
): string {
  const usage = t("usage", {
    usage: group.usage,
    limit: group.limit,
    unit: group.unit ?? shared("defaultUnit"),
  });
  let hint: string = t("hintOpen");
  if (group.status !== "OPEN") hint = shared(STATUS_KEYS[group.status]);
  else if (pick && group.mode === "QUANTITY") {
    hint = t("hintPickedQuantity", { quantity: pick.quantity });
  } else if (pick) hint = t("hintPicked");
  return [usage, hint].join(t("descriptionJoin"));
}

/** The viewer's meta line when the photo is picked: *Dipilih di: Foto cetak × 1*, with *ada catatan* for a note (pratinjau exports). @param t - the viewer pick translate function @param targets - the photo's targets @returns the line, or null when the photo isn't picked */
export function pickedInLine(
  t: ViewerPickTranslate,
  targets: readonly PhotoTarget[],
): string | null {
  const entries = targets.flatMap(({ group, pick }) => {
    if (!pick) return [];
    const name =
      group.mode === "QUANTITY"
        ? t("pickedQuantity", { name: group.name, quantity: pick.quantity })
        : group.name;
    return [pick.note === null ? name : t("pickedWithNote", { entry: name })];
  });
  return entries.length === 0 ? null : t("pickedIn", { entries: entries.join(t("entriesJoin")) });
}

/** The group whose note *Catatan* opens: the first group in Beranda order where the photo is picked, notes are on and the group is open (A-32). @param targets - the photo's targets @returns that target, or undefined */
export function noteTarget(targets: readonly PhotoTarget[]): PhotoTarget | undefined {
  return targets.find(
    ({ group, pick }) => pick !== undefined && group.allowsPickNotes && group.status === "OPEN",
  );
}
