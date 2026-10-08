import "server-only";

import type { ClientSessionPayload } from "@/features/gallery/domain/client-session/client-session.types";

/** Signs and verifies the client gallery cookie (ADR-023, D-3). */
export interface ClientSessionSignerPort {
  /** Returns `<payload>.<mac>`, both base64url. */
  readonly sign: (payload: ClientSessionPayload) => Promise<string>;
  /** Returns the payload only when the MAC holds and the payload has the expected shape. */
  readonly verify: (value: string) => Promise<ClientSessionPayload | null>;
}
