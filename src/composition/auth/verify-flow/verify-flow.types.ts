export type VerifyPageState =
  { kind: "REDIRECT"; path: string } | { kind: "SHOW"; canResend: boolean };
