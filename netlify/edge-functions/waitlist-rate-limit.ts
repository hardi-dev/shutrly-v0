// F-19 waitlist rate limit (ADR-022, spec A-2): 5 submissions per IP per 3 minutes, HTTP 429
// above that. A pass-through edge function carries the limit because Netlify applies code-based
// rate limits to edge functions, while a netlify.toml redirect rule never reached the routes
// the Next.js runtime serves (checked on production, 2026-10-08).

/** The part of Netlify's edge-function context this function uses. */
interface EdgeContext {
  next: () => Promise<Response>;
}

export default function waitlistRateLimit(_request: Request, context: EdgeContext) {
  return context.next();
}

export const config = {
  path: "/api/waitlist",
  rateLimit: { windowLimit: 5, windowSize: 180, aggregateBy: ["ip", "domain"] },
};
