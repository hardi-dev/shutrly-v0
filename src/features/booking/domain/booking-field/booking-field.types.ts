export type FieldType = "TEXT" | "TEXTAREA" | "NUMBER" | "DATE" | "BOOLEAN" | "SELECT";
export type OptionsProblem =
  | { readonly problem: "OPTIONS_REQUIRED" | "TOO_MANY_OPTIONS" }
  | {
      readonly problem: "OPTION_EMPTY" | "OPTION_TOO_LONG" | "OPTION_DUPLICATE";
      readonly index: number;
    };
