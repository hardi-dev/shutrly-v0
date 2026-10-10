import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import type { PhotoTarget } from "../use-pick-targets/use-pick-targets.types";
import { VIEWER_PICK_COPY as COPY } from "./viewer-pick-actions.copy";

/** The *Pilih untuk…* menu line under a group: usage, then a tap hint, the photo's pick or the closed status (pratinjau-pilih-untuk eG55x, A-30). @param target - the group and the photo's pick in it @returns the line */
export function targetDescription({ group, pick }: PhotoTarget): string {
  const usage = COPY.usage(group.usage, group.limit, group.unit ?? CLIENT_COPY.defaultUnit);
  let hint: string = COPY.hintOpen;
  if (group.status !== "OPEN") hint = CLIENT_COPY.groupStatus[group.status];
  else if (pick && group.mode === "QUANTITY") hint = COPY.hintPickedQuantity(pick.quantity);
  else if (pick) hint = COPY.hintPicked;
  return [usage, hint].join(COPY.descriptionJoin);
}

/** The viewer's meta line when the photo is picked: *Dipilih di: Foto cetak × 1*, with *ada catatan* for a note (pratinjau exports). @param targets - the photo's targets @returns the line, or null when the photo isn't picked */
export function pickedInLine(targets: readonly PhotoTarget[]): string | null {
  const entries = targets.flatMap(({ group, pick }) => {
    if (!pick) return [];
    const name =
      group.mode === "QUANTITY" ? COPY.pickedQuantity(group.name, pick.quantity) : group.name;
    return [pick.note === null ? name : COPY.pickedWithNote(name)];
  });
  return entries.length === 0 ? null : COPY.pickedIn(entries.join(COPY.entriesJoin));
}

/** The group whose note *Catatan* opens: the first group in Beranda order where the photo is picked, notes are on and the group is open (A-32). @param targets - the photo's targets @returns that target, or undefined */
export function noteTarget(targets: readonly PhotoTarget[]): PhotoTarget | undefined {
  return targets.find(
    ({ group, pick }) => pick !== undefined && group.allowsPickNotes && group.status === "OPEN",
  );
}
