import type { CopyModule } from "@/composition/locale/message-catalog/message-catalog.types";

import { ERROR_COPY } from "./error.copy";
import { NOT_FOUND_COPY } from "./not-found.copy";

/**
 * Every copy module the app renders, read here in `src/app` and passed into composition (D-8).
 * The root not-found and error screens are the first modules (I5).
 */
export const COPY_REGISTRY: readonly CopyModule[] = [NOT_FOUND_COPY, ERROR_COPY];
