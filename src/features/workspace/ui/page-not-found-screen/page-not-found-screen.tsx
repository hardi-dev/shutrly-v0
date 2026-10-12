"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { sectionLabel } from "@/features/workspace/ui/owner-trail/owner-trail";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { Button } from "@/ui/primitives/button/button";

import { pageNotFoundBackTarget } from "./page-not-found-back-target";
import {
  OWNER_NAV_COPY_NAMESPACE,
  PAGE_NOT_FOUND_COPY_NAMESPACE,
} from "./page-not-found-screen.copy";

/**
 * The page-not-found state inside the workspace shell (F-24 D-5). Shown for a missing page or record
 * under `/w/{workspaceId}`; it never names the missing record. Not in Pencil (FC-005): copy is from
 * `page-not-found-screen.copy.ts`.
 * @returns the not-found content
 */
export function PageNotFoundScreen() {
  const pathname = usePathname();
  const t = useTranslations(PAGE_NOT_FOUND_COPY_NAMESPACE);
  const navT = useTranslations(OWNER_NAV_COPY_NAMESPACE);
  const target = pageNotFoundBackTarget(pathname);
  const backLabel =
    target.kind === "section"
      ? t("backToSection", { section: sectionLabel(target.section, navT) })
      : t("backToDashboard");
  return (
    <div className="p-(--space-6)">
      <EmptyState
        icon="search-x"
        title={t("title")}
        body={t("body")}
        action={
          <Link href={target.href}>
            <Button variant="secondary">{backLabel}</Button>
          </Link>
        }
      />
    </div>
  );
}
