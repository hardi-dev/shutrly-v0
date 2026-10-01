export type TemplateProblemCode =
  "EMPTY" | "TOO_LONG" | "MALFORMED" | "UNKNOWN_VARIABLE" | "MISSING_REQUIRED";

export type TemplateContentProblem =
  | { readonly code: "EMPTY" | "TOO_LONG" | "MALFORMED" }
  | { readonly code: "UNKNOWN_VARIABLE" | "MISSING_REQUIRED"; readonly variable: string };
