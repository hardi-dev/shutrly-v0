import type { z } from "zod";

import type { socialLinkSchema, socialPlatformSchema } from "./social-link.schema";

export type SocialPlatform = z.output<typeof socialPlatformSchema>;
export type SocialLink = z.output<typeof socialLinkSchema>;

export interface SocialLinkRow {
  readonly platform: SocialPlatform;
  readonly value: string | null;
}
