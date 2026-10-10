/** Add-on lifecycle (BR-ADD-003): `DRAFT → APPROVED → CANCELLED` and `DRAFT → CANCELLED`. */
export type AddOnStatus = "DRAFT" | "APPROVED" | "CANCELLED";

/** *Setujui*, *Batalkan add-on* and *Hapus draf* (spec §4, A-35). */
export type AddOnAction = "APPROVE" | "CANCEL" | "DELETE";

/**
 * What an action does to an add-on: move it to a new status, delete the draft, leave it as it is
 * (a repeated approve or cancel), or refuse.
 */
export type AddOnTransition =
  | { readonly kind: "MOVE"; readonly to: AddOnStatus }
  | { readonly kind: "DELETE" }
  | { readonly kind: "SAME" }
  | { readonly kind: "REFUSED" };
