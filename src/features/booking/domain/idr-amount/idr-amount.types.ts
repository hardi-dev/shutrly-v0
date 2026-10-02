export type IdrAmountProblem = "EMPTY" | "INVALID" | "NOT_WHOLE" | "TOO_LARGE";
export type IdrAmountResult =
  | { readonly ok: true; readonly amount: string }
  | { readonly ok: false; readonly problem: IdrAmountProblem };
