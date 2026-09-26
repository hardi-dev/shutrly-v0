export interface ResendConfig {
  apiKey: string;
  from: string;
  fetch?: typeof fetch;
}
