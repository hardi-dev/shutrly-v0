import { useTranslations } from "next-intl";

import { ToastOnMount } from "@/ui/patterns/toast/toast";

import { SetupChecklist } from "../setup-checklist/setup-checklist";
import { DASHBOARD_COPY_NAMESPACE } from "./dashboard-screen.copy";
import type { DashboardScreenProps } from "./dashboard-screen.types";

/** Renders the workspace dashboard: the setup checklist until the first project, then the overview slot (F-25 D-6, F-26 D-1). @param props - workspace identity, its checklist and the overview @returns the dashboard content */
export function DashboardScreen({
  workspaceId,
  workspaceName,
  created = false,
  checklist,
  overview = null,
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
      {checklist ? (
        <SetupChecklist
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          checklist={checklist}
        />
      ) : (
        overview
      )}
    </>
  );
}
