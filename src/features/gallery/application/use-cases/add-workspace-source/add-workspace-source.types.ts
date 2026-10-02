export type SourceFieldErrorKey = "EMPTY" | "TOO_LONG" | "NAME_TAKEN" | "PROVIDER_UNAVAILABLE";

export interface SourceValidationFailure {
  readonly ok: false;
  readonly code: "VALIDATION_FAILED";
  readonly fieldErrors: {
    readonly displayName?: SourceFieldErrorKey;
    readonly provider?: SourceFieldErrorKey;
  };
}

export type SourceWriteResult = { readonly ok: true } | SourceValidationFailure;
