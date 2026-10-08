export type ClientPasswordProblem =
  | { readonly kind: "WRONG_PASSWORD" }
  | { readonly kind: "EMPTY" }
  | { readonly kind: "FAILED" }
  | { readonly kind: "TOO_MANY_ATTEMPTS"; readonly minutes: number };
