import type { z } from "zod";

import type { AppLocale } from "@/shared/locale/locale.types";

import type { NormalisedEmail } from "../credentials/credentials.types";
import type { accountStatusSchema, authUserIdSchema } from "./account.schema";

export type AuthUserId = z.infer<typeof authUserIdSchema>;

export type AccountStatus = z.infer<typeof accountStatusSchema>;

export interface AccountRecord {
  id: AuthUserId;
  email: NormalisedEmail;
  name: string;
  status: AccountStatus;
  emailVerified: boolean;
  hasPassword: boolean;
  /** Owner dashboard language (BR-L10N-001). */
  locale: AppLocale;
}

export type AccessSubject = Pick<AccountRecord, "status" | "emailVerified">;

export type AccessDecision = "ANONYMOUS" | "UNAVAILABLE" | "RESTRICTED" | "OWNER";

export interface GoogleLinkInput {
  googleEmailVerified: boolean;
  existing: Pick<AccountRecord, "emailVerified"> | null;
}

export type GoogleLinkDecision = "REJECT" | "CREATE" | "LINK" | "LINK_WITH_TAKEOVER_GUARD";
