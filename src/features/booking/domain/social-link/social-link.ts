import type { z } from "zod";

import type { SocialLink, SocialLinkRow } from "./social-link.types";

/** A-2: platforms in display order. */
export const SOCIAL_PLATFORMS = [
  "INSTAGRAM",
  "TIKTOK",
  "FACEBOOK",
  "YOUTUBE",
  "X",
  "OTHER",
] as const;
/** BR-CLI-001: at most ten links, each value 1–200 characters. */
export const SOCIAL_LINK_MAX_COUNT = 10;
export const SOCIAL_VALUE_MAX_LENGTH = 200;
const HTTPS = /^https:\/\//i;
const URL_PREFIX = /^https:\/\/(www\.)?/i;
const ANY_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;

/** @param value - a social value @returns whether it is an https URL rather than a handle */
export function isSocialUrl(value: string): boolean {
  return HTTPS.test(value.trim());
}

/**
 * Stores a handle without its leading `@` and keeps URLs as typed (BR-CLI-001).
 * @param raw - the value as typed
 * @returns the stored value
 */
export function normaliseSocialValue(raw: string): string {
  const value = raw.trim();
  return isSocialUrl(value) ? value : value.replace(/^@/, "");
}

/**
 * Labels a link for lists: `@handle`, or the URL without `https://` and `www.`.
 * @param link - a stored link
 * @returns the label
 */
export function socialLinkLabel(link: SocialLink): string {
  return isSocialUrl(link.value) ? link.value.replace(URL_PREFIX, "") : `@${link.value}`;
}

/** BR-CLI-001: checks whether a social value is a handle or HTTPS URL. @param value - normalised social value @returns whether the protocol is allowed */
export function isHandleOrHttps(value: string): boolean {
  return isSocialUrl(value) || !ANY_SCHEME.test(value);
}

/** BR-CLI-001: checks value length by Unicode code points. @param value - normalised social value @returns whether the value fits the limit */
export function fitsSocialValueLength(value: string): boolean {
  return Array.from(value).length <= SOCIAL_VALUE_MAX_LENGTH;
}

/** BR-CLI-001: adds issues for repeated platform and value pairs. @param rows - parsed rows in owner order @param context - refinement context that receives issues */
export function addDuplicateSocialLinkIssues(
  rows: readonly SocialLinkRow[],
  context: z.RefinementCtx,
): void {
  const seen = new Set<string>();
  for (const [index, row] of rows.entries()) {
    if (row.value === null) continue;
    const key = `${row.platform}|${row.value.toLowerCase()}`;
    if (seen.has(key))
      context.addIssue({ code: "custom", path: [index, "value"], message: "DUPLICATE" });
    else seen.add(key);
  }
}

/** BR-CLI-001: removes blank social-link rows and keeps owner order. @param rows - parsed form rows @returns stored social links */
export function dropBlankSocialLinkRows(rows: readonly SocialLinkRow[]): SocialLink[] {
  return rows.flatMap((row) =>
    row.value === null ? [] : [{ platform: row.platform, value: row.value }],
  );
}
