import Link from "next/link";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { ToastOnMount } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";

import { DASHBOARD_COPY_NAMESPACE } from "./dashboard-screen.copy";
import type { DashboardScreenProps } from "./dashboard-screen.types";

/** Renders the empty workspace dashboard. @param props - workspace identity @returns the dashboard content */
export function DashboardScreen({
  workspaceId,
  workspaceName,
  created = false,
}: Readonly<DashboardScreenProps>) {
  const t = useTranslations(DASHBOARD_COPY_NAMESPACE);
  return (
    <>
      {created ? (
        <ToastOnMount
          tone="success"
          title={t("created")}
          dedupeKey={`workspace-created:${workspaceId}`}
        />
      ) : null}
      <div className="flex min-h-[480px] flex-col items-start gap-(--space-7)">
        <div className="flex w-full flex-col gap-(--space-1)">
          <h2 className="text-(length:--font-size-subtitle) font-semibold text-(--color-semantic-text-primary)">
            {t("greeting", { workspaceName })}
          </h2>
          <p className="text-(length:--font-size-body) leading-(--font-line-height-body) text-(--color-semantic-text-secondary)">
            {t("subtitle")}
          </p>
        </div>
        <EmptyState
          icon="camera"
          title={t("emptyTitle")}
          body={t("emptyBody")}
          action={
            <Link href={`/w/${workspaceId}/settings`}>
              <Button variant="secondary">{t("settings")}</Button>
            </Link>
          }
        />
      </div>
    </>
  );
}
