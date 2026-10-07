import type { UseFormRegisterReturn } from "react-hook-form";

import type { WaitlistAction } from "../use-waitlist-form/use-waitlist-form.types";

export interface WaitlistFormProps {
  /** Defaults to posting to `/api/waitlist`; tests pass their own. */
  action?: WaitlistAction;
}

export interface WaitlistPillProps {
  id: string;
  error: string | undefined;
  isSubmitting: boolean;
  field: UseFormRegisterReturn<"email">;
}

export interface WaitlistBotFieldProps {
  id: string;
  field: UseFormRegisterReturn<"website">;
}

export interface WaitlistMessagesProps {
  id: string;
  error: string | undefined;
  formError: string | undefined;
}
