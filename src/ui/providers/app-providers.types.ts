import type { PropsWithChildren } from "react";

import type { AppLocale, CatalogMessages } from "@/shared/locale/locale.types";

export type AppProvidersProps = PropsWithChildren<{
  /** The one locale resolved for this request (the layout reads it). */
  readonly locale: AppLocale;
  /** The catalog for this surface in that locale. */
  readonly messages: CatalogMessages;
  /** True outside production: a missing message throws instead of rendering empty. */
  readonly strictMessages: boolean;
}>;
