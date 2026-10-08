import type { PickListEntry, PickMode } from "./pick-list.types";

/**
 * The list the Owner copies (A-6): one line per pick, `× n` for quantity groups, ` — note`.
 * @param mode - the group's pick mode
 * @param picks - picks in file-name order
 * @returns the text to copy, lines joined with "\n"
 */
export function formatPickList(mode: PickMode, picks: readonly PickListEntry[]): string {
  return picks.map((pick) => formatLine(mode, pick)).join("\n");
}

// A line break in a note becomes one space; split/trim/join avoids a backtracking regex.
function singleLine(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .join(" ");
}

function formatLine(mode: PickMode, pick: PickListEntry): string {
  const quantity = mode === "QUANTITY" ? ` × ${String(pick.quantity)}` : "";
  const note = pick.note ? ` — ${singleLine(pick.note)}` : "";
  return `${pick.fileName}${quantity}${note}`;
}
