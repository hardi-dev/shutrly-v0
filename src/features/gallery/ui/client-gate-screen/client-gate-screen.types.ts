import type { ClientGateView } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access.types";

import type { ClientPasswordFormProps } from "../client-password-form/client-password-form.types";

export interface ClientGateScreenProps {
  readonly gate: ClientGateView;
  readonly action: ClientPasswordFormProps["action"];
}
