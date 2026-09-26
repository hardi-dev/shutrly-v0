import type { Instrumentation } from "next";

import { logger } from "@/shared/logging/logger";

/**
 * Next.js hook for unhandled server errors. Logs the route pattern, never the path: public
 * paths will carry client tokens (C-103).
 */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  const ray = request.headers["cf-ray"];
  logger.error("request.unhandled_error", {
    requestId: (Array.isArray(ray) ? ray[0] : ray) ?? "unknown",
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    error,
  });
};
