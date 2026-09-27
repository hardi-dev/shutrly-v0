import "server-only";

import { cookies } from "next/headers";

import type { ParsedCookie } from "./session-cookies.types";

const SAME_SITE: readonly string[] = ["lax", "strict", "none"];

function isSameSite(value: string): value is NonNullable<ParsedCookie["sameSite"]> {
  return SAME_SITE.includes(value);
}

function applyAttribute(cookie: ParsedCookie, key: string, value: string): void {
  const lower = value.toLowerCase();
  if (key === "path") cookie.path = value;
  else if (key === "max-age") cookie.maxAge = Number(value);
  else if (key === "expires") cookie.expires = new Date(value);
  else if (key === "httponly") cookie.httpOnly = true;
  else if (key === "secure") cookie.secure = true;
  else if (key === "samesite" && isSameSite(lower)) cookie.sameSite = lower;
}

/**
 * Parse one `Set-Cookie` header from Better Auth into Next's cookie shape.
 * @param raw - the header value
 * @returns the name, value and attributes
 */
export function parseSetCookie(raw: string): ParsedCookie {
  const [pair = "", ...attributes] = raw.split(";").map((part) => part.trim());
  const split = pair.indexOf("=");
  const cookie: ParsedCookie = { name: pair.slice(0, split), value: pair.slice(split + 1) };
  for (const attribute of attributes) {
    const [key = "", ...rest] = attribute.split("=");
    applyAttribute(cookie, key.toLowerCase(), rest.join("="));
  }
  return cookie;
}

/**
 * Copy Better Auth's `Set-Cookie` headers into Next's cookie store; server actions can't
 * return raw headers.
 * @param setCookies - the raw header values
 * @returns nothing
 */
export async function applySetCookies(setCookies: string[]): Promise<void> {
  const jar = await cookies();
  for (const raw of setCookies) {
    const parsed = parseSetCookie(raw);
    jar.set({ ...parsed, value: decodeURIComponent(parsed.value) });
  }
}
