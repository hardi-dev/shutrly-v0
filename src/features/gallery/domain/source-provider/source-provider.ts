import type {
  AvailableSourceProvider,
  ProviderConfig,
  SourceProvider,
} from "./source-provider.types";

export const SOURCE_PROVIDERS: readonly SourceProvider[] = [
  "GOOGLE_DRIVE",
  "DROPBOX",
  "ONEDRIVE",
  "AMAZON_S3",
  "CUSTOM_URL",
];
export const AVAILABLE_SOURCE_PROVIDERS: readonly AvailableSourceProvider[] = ["GOOGLE_DRIVE"];
const EMPTY_PROVIDER_CONFIG: Readonly<Record<AvailableSourceProvider, ProviderConfig>> = {
  GOOGLE_DRIVE: {},
};

/** Checks a value against the provider catalogue. @param value - untrusted value @returns whether it names a provider */
export function isSourceProvider(value: string): value is SourceProvider {
  return SOURCE_PROVIDERS.some((provider) => provider === value);
}

/** Checks whether a provider can be added in MVP (BR-SRC-005). @param value - untrusted value @returns whether it is available */
export function isAvailableSourceProvider(value: string): value is AvailableSourceProvider {
  return AVAILABLE_SOURCE_PROVIDERS.some((provider) => provider === value);
}

/** The provider configuration stored with a new source: always empty in MVP (BR-SRC-002, BR-SRC-003). @param provider - an available provider @returns the empty config */
export function emptyProviderConfig(provider: AvailableSourceProvider): ProviderConfig {
  return EMPTY_PROVIDER_CONFIG[provider];
}
