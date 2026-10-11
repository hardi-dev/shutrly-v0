export type AppLocale = "en" | "id";

export type FormattingLocale = "en-US" | "id-ID";

/** Copy strings keyed by message key; plurals and selects are ICU syntax inside the string. */
export type CopyMessages = Readonly<Record<string, string>>;

/** The catalog handed to next-intl: namespace → key → ICU string. */
export type CatalogMessages = Readonly<Record<string, CopyMessages>>;
