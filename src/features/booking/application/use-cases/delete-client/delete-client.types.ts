export type DeleteClientResult =
  { readonly ok: true } | { readonly ok: false; readonly code: "IN_USE" };
