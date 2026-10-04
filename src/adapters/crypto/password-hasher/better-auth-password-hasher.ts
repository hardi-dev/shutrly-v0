import "server-only";

import { hashPassword, verifyPassword } from "better-auth/crypto";

import type { PasswordHasherPort } from "@/features/gallery/application/ports/password-hasher/password-hasher.port";

/** Creates the gallery password hasher on Better Auth's scrypt, already proven on Workers by F-01 (D-3, R-4). @returns the hasher port */
export function createBetterAuthPasswordHasher(): PasswordHasherPort {
  return {
    hash: (password) => hashPassword(password),
    verify: (hash, password) => verifyPassword({ hash, password }),
  };
}
