import type { AppLocale } from "@/shared/locale/locale.types";

/** BR-TEAM-005: a role name is 1–50 characters after trimming, unique per workspace ignoring case. */
export const TEAM_ROLE_NAME_MAX_LENGTH = 50;

/** D-18: the stable identity of a platform-default role (migration 0021 CHECK list). */
export type DefaultTeamRoleKey = "PHOTOGRAPHER" | "VIDEOGRAPHER" | "ASSISTANT";

export interface DefaultTeamRole {
  readonly name: string;
  readonly defaultKey: DefaultTeamRoleKey;
}

/** BR-TEAM-005: every workspace starts with these roles; migration 0011 backfills them, 0021 keys them. */
export const DEFAULT_TEAM_ROLES: readonly DefaultTeamRole[] = [
  { name: "Fotografer", defaultKey: "PHOTOGRAPHER" },
  { name: "Videografer", defaultKey: "VIDEOGRAPHER" },
  { name: "Asisten", defaultKey: "ASSISTANT" },
];

/** D-18: the name a platform-default role is seeded with, per the owner's locale (deck §8.1). */
export const DEFAULT_TEAM_ROLE_NAMES: Readonly<
  Record<AppLocale, Readonly<Record<DefaultTeamRoleKey, string>>>
> = {
  en: { PHOTOGRAPHER: "Photographer", VIDEOGRAPHER: "Videographer", ASSISTANT: "Assistant" },
  id: { PHOTOGRAPHER: "Fotografer", VIDEOGRAPHER: "Videografer", ASSISTANT: "Asisten" },
};

/**
 * Tells whether a role name is within the length limit, counted in code points.
 * @param name - the trimmed role name
 * @returns true when it has at most `TEAM_ROLE_NAME_MAX_LENGTH` characters
 */
export function fitsTeamRoleNameLength(name: string): boolean {
  return Array.from(name).length <= TEAM_ROLE_NAME_MAX_LENGTH;
}

/**
 * D-18: a platform-default role shows its name in the reader's language; a renamed or owner role shows its stored name.
 * @param role - the stored name with the platform key, when it has one
 * @param locale - the locale the screen is rendered in
 * @returns the name to show
 */
export function displayTeamRoleName(
  role: { readonly name: string; readonly defaultKey: DefaultTeamRoleKey | null },
  locale: AppLocale,
): string {
  return role.defaultKey === null ? role.name : DEFAULT_TEAM_ROLE_NAMES[locale][role.defaultKey];
}

const DEFAULT_TEAM_ROLE_KEYS: readonly DefaultTeamRoleKey[] = [
  "PHOTOGRAPHER",
  "VIDEOGRAPHER",
  "ASSISTANT",
];

/**
 * Narrows a stored `default_key` to a known role key (migration 0021 CHECK list).
 * @param raw - the column value
 * @returns the key, or null for an owner role or an unknown value
 */
export function parseDefaultTeamRoleKey(raw: string | null): DefaultTeamRoleKey | null {
  return DEFAULT_TEAM_ROLE_KEYS.find((key) => key === raw) ?? null;
}

/**
 * D-18: a copy of the role whose name is the label the reader sees.
 * @param role - the stored role, with its platform key
 * @param locale - the locale the screen is rendered in
 * @returns the role with `name` replaced by the displayed name; every other field is kept
 */
export function localizeTeamRole<
  T extends { readonly name: string; readonly defaultKey: DefaultTeamRoleKey | null },
>(role: T, locale: AppLocale): T {
  return { ...role, name: displayTeamRoleName(role, locale) };
}

/**
 * D-18: the name a role edit submits. An unchanged name submits the stored text, so it does not clear the key.
 * @param role - the stored role being edited
 * @param locale - the locale the dialog is rendered in
 * @param name - the name in the form
 * @returns the stored name when the form still shows the displayed name, else the form's name
 */
export function teamRoleSubmissionName(
  role: { readonly name: string; readonly defaultKey: DefaultTeamRoleKey | null },
  locale: AppLocale,
  name: string,
): string {
  return name === displayTeamRoleName(role, locale) ? role.name : name;
}
