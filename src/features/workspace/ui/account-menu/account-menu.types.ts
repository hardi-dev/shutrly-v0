import type { ReactNode } from "react";

import type { AppLocale } from "@/shared/locale/locale.types";

/** Saves the owner's language; the server action resolves `undefined` on success. */
export type OwnerLocaleAction = (values: { locale: AppLocale }) => Promise<unknown>;

export interface AccountMenuProps {
  workspaceId: string;
  /** Omit to hide the language group. */
  localeAction?: OwnerLocaleAction;
  /** Omit to hide the sign-out row. */
  onLogout?: () => void;
  /** The trigger element (the sidebar account block). */
  children: ReactNode;
}
