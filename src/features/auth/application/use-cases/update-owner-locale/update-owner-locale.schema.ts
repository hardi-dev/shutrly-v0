import { z } from "zod";

import { appLocaleSchema } from "@/shared/locale/locale.schema";

// Unknown keys (such as a userId) are stripped: the owner is always the session's owner (C-101).
export const updateOwnerLocaleSchema = z.object({ locale: appLocaleSchema });
