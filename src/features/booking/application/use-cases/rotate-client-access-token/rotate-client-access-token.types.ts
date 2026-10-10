import type { AccessTokenGeneratorPort } from "../../ports/access-token-generator/access-token-generator.port";
import type { ProjectRepositoryPort } from "../../ports/project-repository/project-repository.port";

export interface RotateTokenDeps {
  readonly projects: ProjectRepositoryPort;
  readonly generateToken: AccessTokenGeneratorPort;
  readonly now: Date;
}

/** The new token on success; a cancelled project keeps its dead link (D-19). */
export type RotateTokenResult =
  | { readonly ok: true; readonly token: string }
  | { readonly ok: false; readonly code: "PROJECT_CANCELLED" };
