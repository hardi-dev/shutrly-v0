export type SourceProvider = "GOOGLE_DRIVE" | "DROPBOX" | "ONEDRIVE" | "AMAZON_S3" | "CUSTOM_URL";
export type AvailableSourceProvider = "GOOGLE_DRIVE";
export type ProviderConfig = Readonly<Record<string, never>>;
