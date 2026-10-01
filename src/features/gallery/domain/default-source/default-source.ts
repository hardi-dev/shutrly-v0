import type { AvailableSourceProvider } from "../source-provider/source-provider.types";

export const DEFAULT_SOURCE = {
  provider: "GOOGLE_DRIVE",
  displayName: "Google Drive",
} as const satisfies { provider: AvailableSourceProvider; displayName: string };
