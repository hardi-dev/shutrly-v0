"use client";

import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Input } from "@/ui/primitives/input/input";

import { TEAM_MEMBER_SEARCH_FIELD_COPY_NAMESPACE } from "./team-member-search-field.copy";
import type { TeamMemberSearchFieldProps } from "./team-member-search-field.types";
import { useTeamMemberSearch } from "./use-team-member-search";

/**
 * The *Anggota* search box: it replaces the tab URL's `?q=` after a short debounce.
 * @param props - the workspace, the tab, the current query and how many rows match
 * @returns the search input and its polite result count
 */
export function TeamMemberSearchField({
  workspaceId,
  status,
  q,
  resultCount,
}: Readonly<TeamMemberSearchFieldProps>) {
  const t = useTranslations(TEAM_MEMBER_SEARCH_FIELD_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const pathname = `/w/${workspaceId}/team${status === "ARCHIVED" ? "/archived" : ""}`;
  const { value, change, clear } = useTeamMemberSearch(q, pathname);
  return (
    <>
      <div className="w-full md:w-[320px]">
        <Input
          variant="search"
          aria-label={t("searchLabel")}
          placeholder={isMobile ? t("searchPlaceholderMobile") : t("searchPlaceholderDesktop")}
          value={value}
          onChange={change}
          iconLeading="search"
          iconTrailing={value ? "x" : undefined}
          iconTrailingAction={value ? { label: t("clearSearch"), onPress: clear } : undefined}
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {value ? t("searchResultCount", { count: resultCount }) : ""}
      </p>
    </>
  );
}
