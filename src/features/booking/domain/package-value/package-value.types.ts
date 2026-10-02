export type PackageValue =
  | { readonly type: "NUMBER"; readonly value: string }
  | { readonly type: "RANGE"; readonly min: string; readonly max: string };

export type QuantityProblem = "INVALID" | "NEGATIVE" | "TOO_MANY_DECIMALS" | "TOO_LARGE";
export type QuantityResult =
  | { readonly ok: true; readonly value: string }
  | { readonly ok: false; readonly problem: QuantityProblem };
export type PackageValueProblem = QuantityProblem | "NOT_WHOLE" | "MIN_GREATER_THAN_MAX";

export interface PackageValueIssue {
  readonly field: "value" | "min" | "max";
  readonly problem: PackageValueProblem;
}

export interface ValueRules {
  readonly valueType: "NUMBER" | "RANGE";
  readonly selectionRequired: boolean;
}
