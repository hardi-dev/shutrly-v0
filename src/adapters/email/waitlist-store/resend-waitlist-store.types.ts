export interface ResendWaitlistConfig {
  apiKey: string;
  segmentId: string;
  /** Injected in tests; defaults to the global `fetch`. */
  fetch?: typeof fetch;
}
