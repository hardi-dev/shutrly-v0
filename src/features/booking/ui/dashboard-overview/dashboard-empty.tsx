import Link from "next/link";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { Button } from "@/ui/primitives/button/button";

import { projectTabPath } from "../project-search-field/project-tab-path";
import { DASHBOARD_OVERVIEW_COPY_NAMESPACE } from "./dashboard-overview.copy";

/** The no-active state: only completed or cancelled projects exist (AC-DASH-029, D-12). Search and filter are hidden here. The parent sets the padding, which differs by layout. @param props - the workspace @returns the empty state */
export function DashboardNoActive({ workspaceId }: Readonly<{ workspaceId: string }>) {
  const t = useTranslations(DASHBOARD_OVERVIEW_COPY_NAMESPACE);
  return (
    <EmptyState
      placement="in-card"
      icon="folder-kanban"
      title={t("emptyActiveTitle")}
      body={t("emptyActiveBody")}
      action={
        <Link href={projectTabPath(workspaceId, "ACTIVE")}>
          <Button variant="secondary">{t("emptyActiveAction")}</Button>
        </Link>
      }
    />
  );
}
