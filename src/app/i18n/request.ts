import { getRequestConfig } from "next-intl/server";

import { COPY_REGISTRY } from "@/app/copy-registry";
import { createRequestConfig } from "@/composition/locale/request-config/request-config";

// The next-intl request config registered in next.config.ts. The registry is read here, in the
// app layer, and passed into composition (D-8).
export default getRequestConfig(() => createRequestConfig(COPY_REGISTRY));
