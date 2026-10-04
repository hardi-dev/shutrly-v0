import "server-only";

import type { RandomInt } from "@/features/gallery/domain/gallery-password/gallery-password.types";

// A CSPRNG-backed integer source for the password generator (D-4).
export type RandomIntPort = RandomInt;
